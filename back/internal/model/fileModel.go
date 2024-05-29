package models

import (
	"gorm.io/gorm"
	"time"
)

type FileUpload struct {
	gorm.Model
	FileName   string    `json:"fileName"`
	FilePath   string    `json:"filePath"`
	Size       int64     `json:"size"`
	UploadedAt time.Time `json:"uploadedAt"`
}
