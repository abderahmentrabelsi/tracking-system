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
	var fileUploads []struct {
		FileID   string `json:"fileId"`
		FileName string `json:"fileName"`
		FilePath string `json:"filePath"`
		Size     int64  `json:"size"`
	}
	if err := c.BindJSON(&fileUploads); err != nil {
		log.Printf("Error binding JSON: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"msg":   "Invalid request body",
				"error": err.Error(),
			},
		})
		return
	}

	for _, fileUpload := range fileUploads {
		log.Printf("Received file upload data: %+v", fileUpload)

		err := hc.fileService.SaveFile(fileUpload.FileID, fileUpload.FileName, fileUpload.FilePath, fileUpload.Size)
		if err != nil {
			log.Printf("Error saving file info to database: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{
				"data":   nil,
				"status": "error",
				"message": gin.H{
					"msg":   "Failed to save file info to database",
					"error": err.Error(),
				},
			})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"data":   nil,
		"status": "success",
		"message": gin.H{
			"msg": "File info saved successfully",
		},
	})
}
