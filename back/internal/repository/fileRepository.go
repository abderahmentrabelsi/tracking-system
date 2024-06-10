package repository

import (
	model "back/internal/model"
	"back/internal/orm"
	"log"

	"gorm.io/gorm"
)

type FileRepository struct{}

func NewFileRepository() *FileRepository {
	return &FileRepository{}
}

func (fr *FileRepository) SaveFileUpload(fileUpload *model.FileUpload) error {
	log.Printf("Attempting to save to database: %+v", fileUpload)

	err := orm.DB.Create(fileUpload).Error
	if err != nil {
		log.Printf("Error during database save: %v", err)
		return err
	}

	log.Printf("Successfully saved to database: %+v", fileUpload)
	return nil
}

func (fr *FileRepository) GetAllFiles() ([]model.FileUpload, error) {
	var files []model.FileUpload
	err := orm.DB.Find(&files).Error
	if err != nil {
		log.Printf("Error fetching files from database: %v", err)
		return nil, err
	}
	return files, nil
}

// Add the GetFileByFileID function
func (fr *FileRepository) GetFileByFileID(uploadID string) (*model.FileUpload, error) {
	var file model.FileUpload
	err := orm.DB.Where("upload_id = ?", uploadID).First(&file).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil // No record found
		}
		log.Printf("Error fetching file by upload ID from database: %v", err)
		return nil, err
	}
	return &file, nil
}
