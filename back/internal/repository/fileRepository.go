package repository

import (
	model "back/internal/model"
	"back/internal/orm"
	"log"
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
	} else {
		log.Printf("Successfully saved to database: %+v", fileUpload)
	}

	return err
}
