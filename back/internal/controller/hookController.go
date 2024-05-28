package controller

import (
	"back/internal/service"
	"github.com/gin-gonic/gin"
	"log"
	"net/http"
)

type HookController struct {
	fileService *service.FileService
}

func NewHookController(fileService *service.FileService) *HookController {
	return &HookController{fileService: fileService}
}

func (hc *HookController) UploadHook(c *gin.Context) {
	var fileUpload struct {
		FileID   string `json:"fileId"`
		FileName string `json:"fileName"`
		FilePath string `json:"filePath"`
		Size     int64  `json:"size"`
	}
	if err := c.BindJSON(&fileUpload); err != nil {
		log.Printf("Error binding JSON: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	log.Printf("Received file upload data: %+v", fileUpload) // Log the received data

	// Call the SaveFile function
	err := hc.fileService.SaveFile(fileUpload.FileID, fileUpload.FileName, fileUpload.FilePath, fileUpload.Size)
	if err != nil {
		log.Printf("Error saving file info to database: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file info to database"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "File info saved successfully"})
}
