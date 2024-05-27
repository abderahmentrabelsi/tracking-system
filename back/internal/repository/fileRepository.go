// internal/repository/fileRepository.go
package repository

import (
	model "back/internal/model"
	"back/internal/orm"
)

type FileRepository struct{}

func NewFileRepository() *FileRepository {
	return &FileRepository{}
}

func (fr *FileRepository) SaveFileUpload(fileUpload *model.FileUpload) error {
	return orm.DB.Create(fileUpload).Error
}
