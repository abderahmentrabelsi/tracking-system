package service

import (
	model "back/internal/model"
	"back/internal/repository"
	"fmt"
	"log"
	"time"
)

type FileService struct {
	fileRepository *repository.FileRepository
}

func NewFileService(fileRepository *repository.FileRepository) *FileService {
	return &FileService{fileRepository: fileRepository}
}

func (fs *FileService) SaveFile(fileName string, filePath string, size int64) error {
	log.Printf("Starting SaveFile with fileName: %s, filePath: %s, size: %d", fileName, filePath, size)

	// Check inputs
	if fileName == "" || filePath == "" || size <= 0 {
		log.Printf("Invalid input: fileName=%s, filePath=%s, size=%d", fileName, filePath, size)
		return fmt.Errorf("invalid input data")
	}

	fileUpload := &model.FileUpload{
		FileName:   fileName,
		FilePath:   filePath,
		Size:       size,
		UploadedAt: time.Now(),
	}

	log.Printf("FileUpload object created: %+v", fileUpload) // Log the file upload details

	err := fs.fileRepository.SaveFileUpload(fileUpload)
	if err != nil {
		log.Printf("Error saving file upload: %v", err)
		return err
	}

	log.Printf("FileUpload successfully saved: %+v", fileUpload)
	return nil
}
