package service

import (
	model "back/internal/model"
	"back/internal/repository"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"time"
)

type FileService struct {
	fileRepository *repository.FileRepository
	tusdServerURL  string
}

func NewFileService(fileRepository *repository.FileRepository, tusdServerURL string) *FileService {
	return &FileService{fileRepository: fileRepository, tusdServerURL: tusdServerURL}
}

func (fs *FileService) SaveFile(fileID string, fileName string, filePath string, size int64) error {
	log.Printf("Starting SaveFile with fileID: %s, fileName: %s, filePath: %s, size: %d", fileID, fileName, filePath, size)

	if fileID == "" || fileName == "" || filePath == "" || size <= 0 {
		log.Printf("Invalid input: fileID=%s, fileName=%s, filePath=%s, size=%d", fileID, fileName, filePath, size)
		return fmt.Errorf("invalid input data")
	}

	resp, err := http.Get(fs.tusdServerURL + "/files/" + fileID)
	if err != nil {
		log.Printf("Error retrieving file from tusd: %v", err)
		return err
	}
	defer resp.Body.Close()

	uploadDir := "internal/uploads"
	err = os.MkdirAll(uploadDir, os.ModePerm)
	if err != nil {
		log.Printf("Error creating upload directory: %v", err)
		return err
	}

	out, err := os.Create(filepath.Join(uploadDir, fileName))
	if err != nil {
		log.Printf("Error creating file: %v", err)
		return err
	}
	defer out.Close()

	_, err = io.Copy(out, resp.Body)
	if err != nil {
		log.Printf("Error writing file: %v", err)
		return err
	}

	fileUpload := &model.FileUpload{
		FileName:   fileName,
		FilePath:   filepath.Join(uploadDir, fileName),
		Size:       size,
		UploadedAt: time.Now(),
	}

	log.Printf("FileUpload object created: %+v", fileUpload)

	err = fs.fileRepository.SaveFileUpload(fileUpload)
	if err != nil {
		log.Printf("Error saving file upload: %v", err)
		return err
	}

	log.Printf("FileUpload successfully saved: %+v", fileUpload)
	return nil
}
