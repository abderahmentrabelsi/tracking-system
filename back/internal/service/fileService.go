package service

import (
	"fmt"
	"log"
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
}

func NewFileService(fileRepository *repository.FileRepository, uploadPath string) *FileService {
	absolutePath, err := filepath.Abs(uploadPath)
	if err != nil {
		log.Fatalf("Unable to determine absolute path: %s", err)
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
	}

	go fs.processCompletedUploads()
	return fs
}

func (fs *FileService) processCompletedUploads() {
	for {
		event := <-fs.TusdHandler.CompleteUploads
		log.Printf("Upload %s finished\n", event.Upload.ID)
		metadata := event.Upload.MetaData
		if err := fs.saveFileMetadata(event.Upload.ID, metadata); err != nil {
			log.Printf("Error saving file metadata: %v", err)
		} else {
			log.Printf("Metadata for upload %s saved successfully", event.Upload.ID)
		}
	}
}

func (fs *FileService) saveFileMetadata(uploadID string, metadata map[string]string) error {
	fileName, ok := metadata["filename"]
	if !ok {
		return fmt.Errorf("filename not provided in metadata")
	}
	filePath := filepath.Join("back/internal/uploads", fileName)
	sizeStr, ok := metadata["size"]
	if !ok {
		return fmt.Errorf("size not provided in metadata")
	}
	size, err := strconv.ParseInt(sizeStr, 10, 64)
	if err != nil {
		return fmt.Errorf("invalid size value: %v", err)
	}

	fileUpload := &model.FileUpload{
		FileName:   fileName,
		FilePath:   filePath,
		Size:       size,
		UploadedAt: time.Now(),
	}

	return fs.fileRepository.SaveFileUpload(fileUpload)
}

// SaveFile is a method that wraps the saveFileMetadata method to match the expected interface
func (fs *FileService) SaveFile(fileID, fileName, filePath string, size int64) error {
	metadata := map[string]string{
		"filename": fileName,
		"size":     strconv.FormatInt(size, 10),
	}
	return fs.saveFileMetadata(fileID, metadata)
}
