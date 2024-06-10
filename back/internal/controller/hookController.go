package controller

import (
	model "back/internal/model"
	"back/internal/service"
	"github.com/gin-gonic/gin"
	"log"
	"net/http"
	"time"
)

type HookController struct {
	fileService *service.FileService
}

func NewHookController(fileService *service.FileService) *HookController {
	return &HookController{fileService: fileService}
}

func (hc *HookController) UploadHook(c *gin.Context) {
	var fileUpload struct {
		UserID   uint   `json:"userId"`
		FileID   string `json:"fileId"`
		FileName string `json:"fileName"`
		FilePath string `json:"filePath"`
		Size     int64  `json:"size"`
	}

	if err := c.BindJSON(&fileUpload); err != nil {
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

	log.Printf("Received file upload data: %+v", fileUpload)

	file := &model.FileUpload{
		UserID:     fileUpload.UserID,
		FileName:   fileUpload.FileName,
		FilePath:   fileUpload.FilePath,
		Size:       fileUpload.Size,
		UploadedAt: time.Now(),
	}

	err := hc.fileService.SaveFile(file)
	if err != nil {
		log.Printf("Error saving file info: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"msg":   "Failed to save file info",
				"error": err.Error(),
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":   nil,
		"status": "success",
		"message": gin.H{
			"msg": "File info saved successfully",
		},
	})
}

func (fc *HookController) GetFiles(c *gin.Context) {
	files, err := fc.fileService.GetAllFiles()
	if err != nil {
		log.Printf("Error fetching files: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"msg":   "Failed to fetch files",
				"error": err.Error(),
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":   files,
		"status": "success",
		"message": gin.H{
			"msg": "Files fetched successfully",
		},
	})
}
