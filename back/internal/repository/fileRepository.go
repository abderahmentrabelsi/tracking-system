package repository

import (
	model "back/internal/model"
	"back/internal/orm"
	"gorm.io/gorm"
	"log"
)

type FileRepository struct{}

func NewFileRepository() *FileRepository {
	return &FileRepository{}
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

func (fr *FileRepository) GetFileByFileID(uploadID string) (*model.FileUpload, error) {
	var file model.FileUpload
	err := orm.DB.Where("upload_id = ?", uploadID).First(&file).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		log.Printf("Error fetching file by upload ID from database: %v", err)
		return nil, err
	}
	return &file, nil
}

func (fr *FileRepository) UpdateFileUpload(fileUpload *model.FileUpload) error {
	log.Printf("Attempting to update file in database: %+v", fileUpload)
	// Assuming `ID` is a field in fileUpload that identifies the record
	err := orm.DB.Model(&model.FileUpload{}).Where("id = ?", fileUpload.ID).Updates(fileUpload).Error
	if err != nil {
		log.Printf("Error during file update: %v", err)
		return err
	}
	log.Printf("Successfully updated file in database: %+v", fileUpload)
	return nil
}
