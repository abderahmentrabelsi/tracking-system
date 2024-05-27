package service

import (
	model "back/internal/model"
	"back/internal/repository"
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
	fileUpload := &model.FileUpload{
		FileName:   fileName,
		FilePath:   filePath,
		Size:       size,
		UploadedAt: time.Now(),
	}
	err := fs.fileRepository.SaveFileUpload(fileUpload)
	if err != nil {
		log.Printf("Error saving file upload: %v", err)
	}
	return err
}
