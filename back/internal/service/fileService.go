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
}

func NewFileService(fileRepository *repository.FileRepository, uploadPath string) *FileService {
	absolutePath, err := filepath.Abs(uploadPath)
	if err != nil {
		log.Fatalf("Unable to determine absolute path: %s", err)
	}

	if _, err := os.Stat(absolutePath); os.IsNotExist(err) {
		os.MkdirAll(absolutePath, os.ModePerm)
	}

	store := filestore.New(absolutePath)
	locker := filelocker.New(absolutePath)

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
		UploadPath:     absolutePath,
	}

	go fs.processCompletedUploads()
	return fs
}

func (fs *FileService) processCompletedUploads() {
	log.Println("Started processing completed uploads")
	for {
		event, ok := <-fs.TusdHandler.CompleteUploads
		if !ok {
			log.Println("CompleteUploads channel closed")
			return
		}

		upload := event.Upload
		log.Printf("Processing upload: %s", upload.ID)
		metadata := upload.MetaData
		storedFile := filepath.Join(fs.UploadPath, metadata["filename"])

		log.Printf("File should be stored at %s", storedFile)
		if _, err := os.Stat(storedFile); err == nil {
			log.Printf("File already exists at %s", storedFile)
			continue
		}

		log.Printf("File successfully processed at %s", storedFile)
		if err := fs.saveFileMetadata(upload.ID, metadata); err != nil {
			log.Printf("Error saving file metadata: %v", err)
		} else {
			log.Printf("Metadata for upload %s saved successfully", upload.ID)
		}
	}
}

func (fs *FileService) saveFileMetadata(uploadID string, metadata map[string]string) error {
	fileName, ok := metadata["filename"]
	if !ok {
		log.Println("Filename not provided in metadata")
		return fmt.Errorf("filename not provided in metadata")
	}

	decodedFileName, err := base64.StdEncoding.DecodeString(fileName)
	if err != nil {
		log.Println("Error decoding filename:", err)
		return fmt.Errorf("error decoding filename: %v", err)
	}

	filePath := filepath.Join(fs.UploadPath, string(decodedFileName))
	log.Printf("Saving file metadata: filename=%s, path=%s", string(decodedFileName), filePath)

	fileUpload := &model.FileUpload{
		FileName:   string(decodedFileName),
		FilePath:   filePath,
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
