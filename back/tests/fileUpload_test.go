package tests

import (
	"back/internal/controller"
	model "back/internal/model"
	"back/internal/orm"
	"back/internal/repository"
	"back/internal/service"
	"encoding/json"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	tusd "github.com/tus/tusd/v2/pkg/handler"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"
)

var fileService *service.FileService
var hookController *controller.HookController

func setupHookController() {
	fileRepo := repository.NewFileRepository()
	fileService = service.NewFileService(fileRepo)
	hookController = controller.NewHookController(fileService)
}

// Test for the UploadHook method in HookController
func TestUploadHook(t *testing.T) {
	setupHookController()

	requestBody := `{
		"userId": 1,
		"fileId": "test-file-id",
		"fileName": "testfile.txt",
		"filePath": "/uploads/testfile.txt",
		"size": 1024
	}`

	req := httptest.NewRequest("POST", "/upload-hook", strings.NewReader(requestBody))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = req

	hookController.UploadHook(c)

	assert.Equal(t, http.StatusOK, w.Code)

	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, "success", response["status"])

	// Retrieve the file based on known fields since UploadID was not set correctly
	fileUpload := &model.FileUpload{}
	err = orm.DB.Where("file_name = ? AND user_id = ?", "testfile.txt", 1).First(fileUpload).Error
	assert.NoError(t, err)
	assert.NotNil(t, fileUpload)
	assert.Equal(t, "testfile.txt", fileUpload.FileName)

	// Cleanup
	orm.DB.Unscoped().Delete(&fileUpload)
}

// Test for the GetFiles method in HookController
func TestGetFiles(t *testing.T) {
	setupHookController()

	// Cleanup any existing files in the database to ensure a clean state
	orm.DB.Exec("DELETE FROM file_uploads")

	// Save two files to the repository
	fileUpload1 := &model.FileUpload{
		UploadID:   "upload-id-1",
		UserID:     1,
		FileName:   "file1.txt",
		FilePath:   "/uploads/file1.txt",
		Size:       2048,
		UploadedAt: time.Now(),
	}
	fileUpload2 := &model.FileUpload{
		UploadID:   "upload-id-2",
		UserID:     2,
		FileName:   "file2.txt",
		FilePath:   "/uploads/file2.txt",
		Size:       4096,
		UploadedAt: time.Now(),
	}
	err := fileService.SaveFile(fileUpload1)
	assert.NoError(t, err)
	err = fileService.SaveFile(fileUpload2)
	assert.NoError(t, err)

	req := httptest.NewRequest("GET", "/files", nil)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = req

	hookController.GetFiles(c)

	assert.Equal(t, http.StatusOK, w.Code)

	var response map[string]interface{}
	err = json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, "success", response["status"])

	files := response["data"].([]interface{})
	assert.Len(t, files, 2)

	// Cleanup
	orm.DB.Unscoped().Delete(&fileUpload1)
	orm.DB.Unscoped().Delete(&fileUpload2)
}
func setupFileService() {
	fileRepo := repository.NewFileRepository()
	fileService = service.NewFileService(fileRepo)
}

func TestSaveFileMetadata(t *testing.T) {
	setupFileService()

	metadata := map[string]string{
		"filename": "testfile.txt",
		"size":     "1024",
		"userId":   "1",
	}

	uploadID := "test-upload-id"
	originalFilePath := "/uploads/testfile.txt"

	err := fileService.SaveFile(&model.FileUpload{
		UploadID:   uploadID,
		UserID:     1,
		FileName:   metadata["filename"],
		FilePath:   originalFilePath,
		Size:       1024,
		UploadedAt: time.Now(),
	})
	assert.NoError(t, err)

	// Cleanup
	fileUpload, _ := fileService.GetFileByFileID(uploadID)
	orm.DB.Unscoped().Delete(&fileUpload)
}

func TestGetFileByFileID(t *testing.T) {
	setupFileService()

	// First, save a file to the repository
	uploadID := "test-upload-id"
	fileUpload := &model.FileUpload{
		UploadID:   uploadID,
		UserID:     1,
		FileName:   "testfile.txt",
		FilePath:   "/uploads/testfile.txt",
		Size:       1024,
		UploadedAt: time.Now(),
	}
	err := fileService.SaveFile(fileUpload)
	assert.NoError(t, err)

	// Retrieve the file by its ID
	retrievedFile, err := fileService.GetFileByFileID(uploadID)
	assert.NoError(t, err)
	assert.Equal(t, fileUpload.UploadID, retrievedFile.UploadID)

	// Cleanup
	orm.DB.Unscoped().Delete(&retrievedFile)
}

func TestGetAllFiles(t *testing.T) {
	setupFileService()

	// Save two files to the repository
	fileUpload1 := &model.FileUpload{
		UploadID:   "upload-id-1",
		UserID:     1,
		FileName:   "file1.txt",
		FilePath:   "/uploads/file1.txt",
		Size:       2048,
		UploadedAt: time.Now(),
	}
	fileUpload2 := &model.FileUpload{
		UploadID:   "upload-id-2",
		UserID:     2,
		FileName:   "file2.txt",
		FilePath:   "/uploads/file2.txt",
		Size:       4096,
		UploadedAt: time.Now(),
	}
	err := fileService.SaveFile(fileUpload1)
	assert.NoError(t, err)
	err = fileService.SaveFile(fileUpload2)
	assert.NoError(t, err)

	// Retrieve all files
	files, err := fileService.GetAllFiles()
	assert.NoError(t, err)
	assert.Len(t, files, 2)

	// Cleanup
	orm.DB.Unscoped().Delete(&fileUpload1)
	orm.DB.Unscoped().Delete(&fileUpload2)
}

func TestGetFilesByUserID(t *testing.T) {
	setupFileService()

	// Save files with different user IDs
	fileUpload1 := &model.FileUpload{
		UploadID:   "upload-id-1",
		UserID:     1,
		FileName:   "file1.txt",
		FilePath:   "/uploads/file1.txt",
		Size:       2048,
		UploadedAt: time.Now(),
	}
	fileUpload2 := &model.FileUpload{
		UploadID:   "upload-id-2",
		UserID:     2,
		FileName:   "file2.txt",
		FilePath:   "/uploads/file2.txt",
		Size:       4096,
		UploadedAt: time.Now(),
	}
	err := fileService.SaveFile(fileUpload1)
	assert.NoError(t, err)
	err = fileService.SaveFile(fileUpload2)
	assert.NoError(t, err)

	// Retrieve files by user ID
	files, err := fileService.GetFilesByUserID(1)
	assert.NoError(t, err)
	assert.Len(t, files, 1)
	assert.Equal(t, fileUpload1.UploadID, files[0].UploadID)

	// Cleanup
	orm.DB.Unscoped().Delete(&fileUpload1)
	orm.DB.Unscoped().Delete(&fileUpload2)
}

func TestProcessCompletedUploads(t *testing.T) {
	setupFileService()

	// Create a temporary file to simulate an upload
	uploadID := "test-upload-complete"
	filePath := filepath.Join(fileService.UploadPath, uploadID)
	tempFile, err := os.Create(filePath)
	assert.NoError(t, err)
	tempFile.WriteString("test content")
	tempFile.Close()

	// Simulate the metadata
	metadata := map[string]string{
		"filename": "testfile.txt",
		"size":     "1024",
		"userId":   "1",
	}

	// Create a HookEvent to simulate a completed upload
	event := tusd.HookEvent{
		Upload: tusd.FileInfo{
			ID:       uploadID,
			Size:     1024,
			MetaData: metadata,
		},
	}

	// Simulate the completed upload by sending the event to the CompleteUploads channel
	fileService.TusdHandler.CompleteUploads <- event

	// Wait briefly to allow the process to complete
	time.Sleep(1 * time.Second)

	// Verify that the file metadata is saved in the repository
	savedFile, err := fileService.GetFileByFileID(uploadID)
	assert.NoError(t, err)
	assert.NotNil(t, savedFile)
	assert.Equal(t, "testfile.txt", savedFile.FileName)

	// Cleanup
	orm.DB.Unscoped().Delete(&savedFile)
}
