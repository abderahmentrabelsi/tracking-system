// internal/repository/fileRepository.go
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

// TODO
func (fr *FileRepository) SaveFileUpload(fileUpload *model.FileUpload) error {
	log.Printf("Attempting to save to database: %+v", fileUpload) // Log before saving to the database

	err := orm.DB.Create(fileUpload).Error
	if err != nil {
		log.Printf("Error during database save: %v", err)
	} else {
		log.Printf("Successfully saved to database: %+v", fileUpload)
	}

	return err
}
