package service

import (
	"encoding/base64"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strconv"
	"time"

	model "back/internal/model"
	"back/internal/repository"
	"github.com/tus/tusd/v2/pkg/filelocker"
	"github.com/tus/tusd/v2/pkg/filestore"
	tusd "github.com/tus/tusd/v2/pkg/handler"
)

type FileService struct {
	fileRepository *repository.FileRepository
	TusdHandler    *tusd.Handler
	UploadPath     string
	workerChan     chan tusd.HookEvent
}

const numWorkers = 5

func NewFileService(fileRepository *repository.FileRepository) *FileService {
	uploadPath := os.Getenv("UPLOAD_PATH")
	if uploadPath == "" {
		log.Fatalf("UPLOAD_PATH environment variable is not set")
	}

	absoluteUploadPath := filepath.Clean(uploadPath)

	if _, err := os.Stat(absoluteUploadPath); os.IsNotExist(err) {
		if err := os.MkdirAll(absoluteUploadPath, os.ModePerm); err != nil {
			log.Fatalf("Unable to create upload directory: %s", err)
		}
	}

	store := filestore.New(absoluteUploadPath)
	locker := filelocker.New(absoluteUploadPath)

	composer := tusd.NewStoreComposer()
	store.UseIn(composer)
	locker.UseIn(composer)

	handler, err := tusd.NewHandler(tusd.Config{
		BasePath:              "/files/",
		StoreComposer:         composer,
		NotifyCompleteUploads: true,
	})
	if err != nil {
		log.Fatalf("Unable to create tusd handler: %s", err)
	}

	fs := &FileService{
		fileRepository: fileRepository,
		TusdHandler:    handler,
		UploadPath:     absoluteUploadPath,
		workerChan:     make(chan tusd.HookEvent, numWorkers),
	}

	for i := 0; i < numWorkers; i++ {
		go fs.uploadWorker()
	}

	go fs.processCompletedUploads()
	return fs
}

func (fs *FileService) processCompletedUploads() {
	log.Println("Started processing completed uploads")
	for event := range fs.TusdHandler.CompleteUploads {
		fs.workerChan <- event
	}
	close(fs.workerChan)
}

func (fs *FileService) uploadWorker() {
	for event := range fs.workerChan {
		fs.handleUploadComplete(event)
	}
}

func decodeBase64IfNeeded(value string) (string, error) {
	decoded, err := base64.StdEncoding.DecodeString(value)
	if err != nil {
		return value, nil // Assume it's not base64 encoded
	}
	return string(decoded), nil
}

func (fs *FileService) handleUploadComplete(event tusd.HookEvent) {
	upload := event.Upload
	log.Printf("Processing upload: %s", upload.ID)
	metadata := upload.MetaData
	storedFile := filepath.Join(fs.UploadPath, upload.ID)

	for key, value := range metadata {
		log.Printf("Metadata - Key: %s, Value: %s", key, value)
	}

	fileInfo, err := os.Stat(storedFile)
	if err != nil {
		log.Printf("Error stating file: %v", err)
		return
	}
	if fileInfo.Size() == 0 {
		log.Printf("File %s is empty", storedFile)
		return
	}

	log.Printf("File stored at %s with size %d", storedFile, fileInfo.Size())

	if err := fs.saveFileMetadata(upload.ID, metadata); err != nil {
		log.Printf("Error saving file metadata: %v", err)
		return
	}
	log.Printf("Metadata for upload %s saved successfully", upload.ID)

	originalFileName, err := decodeBase64IfNeeded(metadata["filename"])
	if err != nil {
		log.Printf("Error decoding filename: %v, raw: %s", err, metadata["filename"])
		return
	}

	originalFilePath := filepath.Join(fs.UploadPath, originalFileName)
	if err := os.Rename(storedFile, originalFilePath); err != nil {
		log.Printf("Error renaming file: %v", err)
		return
	}
	log.Printf("File renamed to %s", originalFilePath)
}

func (fs *FileService) saveFileMetadata(uploadID string, metadata map[string]string) error {
	fileName, ok := metadata["filename"]
	if !ok {
		log.Println("Filename not provided in metadata")
		return fmt.Errorf("filename not provided in metadata")
	}

	decodedFileName, err := decodeBase64IfNeeded(fileName)
	if err != nil {
		log.Printf("Error decoding filename: %s, raw: %s", err, fileName)
		return fmt.Errorf("error decoding filename: %v", err)
	}

	sizeStr, ok := metadata["size"]
	if !ok {
		log.Println("Size not provided in metadata")
		return fmt.Errorf("size not provided in metadata")
	}

	decodedSizeStr, err := decodeBase64IfNeeded(sizeStr)
	if err != nil {
		log.Printf("Error decoding size: %s, raw: %s", err, sizeStr)
		return fmt.Errorf("error decoding size: %v", err)
	}

	size, err := strconv.ParseInt(decodedSizeStr, 10, 64)
	if err != nil {
		log.Printf("Error parsing size: %v, raw: %s", err, decodedSizeStr)
		return fmt.Errorf("error parsing size: %v", err)
	}

	filePath := filepath.Join(fs.UploadPath, uploadID)
	log.Printf("Saving file metadata: filename=%s, path=%s, size=%d", decodedFileName, filePath, size)

	fileUpload := &model.FileUpload{
		FileName:   decodedFileName,
		FilePath:   filePath,
		Size:       size,
		UploadedAt: time.Now(),
	}

	return fs.fileRepository.SaveFileUpload(fileUpload)
}

func (fs *FileService) SaveFile(fileID, fileName, filePath string, size int64) error {
	metadata := map[string]string{
		"filename": base64.StdEncoding.EncodeToString([]byte(fileName)),
		"size":     base64.StdEncoding.EncodeToString([]byte(strconv.FormatInt(size, 10))),
	}
	return fs.saveFileMetadata(fileID, metadata)
}

func (fs *FileService) GetAllFiles() ([]model.FileUpload, error) {
	return fs.fileRepository.GetAllFiles()
}
