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
		storedFile := filepath.Join(fs.UploadPath, upload.ID)

		log.Printf("File should be stored at %s", storedFile)
		if _, err := os.Stat(storedFile); err == nil {
			log.Printf("File already exists at %s", storedFile)
		}

		if err := fs.saveFileMetadata(upload.ID, metadata); err != nil {
			log.Printf("Error saving file metadata: %v", err)
		} else {
			log.Printf("Metadata for upload %s saved successfully", upload.ID)
		}

		// Rename file to original filename
		originalFileName, err := base64.StdEncoding.DecodeString(metadata["filename"])
		if err != nil {
			log.Printf("Error decoding filename: %v", err)
			continue
		}

		originalFilePath := filepath.Join(fs.UploadPath, string(originalFileName))
		if err := os.Rename(storedFile, originalFilePath); err != nil {
			log.Printf("Error renaming file: %v", err)
		} else {
			log.Printf("File renamed to %s", originalFilePath)
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

	sizeStr, ok := metadata["size"]
	if !ok {
		log.Println("Size not provided in metadata")
		return fmt.Errorf("size not provided in metadata")
	}

	decodedSize, err := base64.StdEncoding.DecodeString(sizeStr)
	if err != nil {
		log.Println("Error decoding size:", err)
		return fmt.Errorf("error decoding size: %v", err)
	}

	size, err := strconv.ParseInt(string(decodedSize), 10, 64)
	if err != nil {
		log.Println("Error parsing size:", err)
		return fmt.Errorf("error parsing size: %v", err)
	}

	filePath := filepath.Join(fs.UploadPath, uploadID)
	log.Printf("Saving file metadata: filename=%s, path=%s, size=%d", string(decodedFileName), filePath, size)

	fileUpload := &model.FileUpload{
		FileName:   string(decodedFileName),
		FilePath:   filePath,
		Size:       size,
		UploadedAt: time.Now(),
	}

	return fs.fileRepository.SaveFileUpload(fileUpload)
}

func getFileSize(filePath string) int64 {
	fileInfo, err := os.Stat(filePath)
	if err != nil {
		log.Println("Error getting file size:", err)
		return 0
	}
	return fileInfo.Size()
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
