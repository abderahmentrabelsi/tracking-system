package service

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strconv"
	"sync"
	"time"

	model "back/internal/model"               // Import the model package for data structures
	"back/internal/repository"                // Import the repository package for database interactions
	"github.com/tus/tusd/v2/pkg/filelocker"   // Import tusd file locker package
	"github.com/tus/tusd/v2/pkg/filestore"    // Import tusd file store package
	tusd "github.com/tus/tusd/v2/pkg/handler" // Import tusd handler package
)

// FileService handles file uploads and their associated metadata.
type FileService struct {
	fileRepository *repository.FileRepository // Repository for interacting with file metadata in the database
	TusdHandler    *tusd.Handler              // tusd handler for managing uploads
	UploadPath     string                     // Path where uploads are stored
	workerChan     chan tusd.HookEvent        // Channel for processing completed upload events
	wg             sync.WaitGroup             // WaitGroup for synchronizing goroutines
	mu             sync.Mutex                 // Mutex for thread-safe logging
}

// numWorkers defines the number of worker goroutines for processing uploads.
const numWorkers = 5

// NewFileService initializes the FileService with the given FileRepository.
// It sets up the upload directory, file storage, and tusd handler.
// It also starts the worker goroutines and the main upload processing goroutine.
func NewFileService(fileRepository *repository.FileRepository) *FileService {
	// Get the upload path from the environment variable
	uploadPath := os.Getenv("UPLOAD_PATH")
	if uploadPath == "" {
		log.Fatalf("UPLOAD_PATH environment variable is not set") // Log an error if the environment variable is not set
	}

	// Clean the upload path to ensure it's an absolute path
	absoluteUploadPath := filepath.Clean(uploadPath)

	// Create the upload directory if it doesn't exist
	if _, err := os.Stat(absoluteUploadPath); os.IsNotExist(err) {
		if err := os.MkdirAll(absoluteUploadPath, os.ModePerm); err != nil {
			log.Fatalf("Unable to create upload directory: %s", err) // Log an error if the directory cannot be created
		}
	}

	// Initialize filestore and filelocker with the upload path
	store := filestore.New(absoluteUploadPath)
	locker := filelocker.New(absoluteUploadPath)

	// Create a new store composer for tusd
	composer := tusd.NewStoreComposer()
	store.UseIn(composer)
	locker.UseIn(composer)

	// Create a new tusd handler with the store composer
	handler, err := tusd.NewHandler(tusd.Config{
		BasePath:              "/files/",
		StoreComposer:         composer,
		NotifyCompleteUploads: true,
	})
	if err != nil {
		log.Fatalf("Unable to create tusd handler: %s", err) // Log an error if the tusd handler cannot be created
	}

	// Initialize the FileService struct
	fs := &FileService{
		fileRepository: fileRepository,
		TusdHandler:    handler,
		UploadPath:     absoluteUploadPath,
		workerChan:     make(chan tusd.HookEvent, numWorkers),
	}

	// Start the worker goroutines
	for i := 0; i < numWorkers; i++ {
		fs.wg.Add(1)
		go fs.uploadWorker()
	}

	// Start the main upload processing goroutine
	go fs.processCompletedUploads()
	return fs
}

// processCompletedUploads listens for completed uploads and sends them to worker goroutines.
func (fs *FileService) processCompletedUploads() {
	log.Println("Started processing completed uploads")
	// Continuously listen for completed uploads
	for event := range fs.TusdHandler.CompleteUploads {
		fs.workerChan <- event // Send the completed upload event to the worker channel
	}
	close(fs.workerChan) // Close the channel after all events are processed
	fs.wg.Wait()         // Wait for all worker goroutines to finish
}

// uploadWorker processes upload events from the worker channel.
func (fs *FileService) uploadWorker() {
	defer fs.wg.Done() // Mark this goroutine as done when it exits
	// Continuously receive events from the worker channel
	for event := range fs.workerChan {
		fs.handleUploadComplete(event) // Process the completed upload event
	}
}

func decodeBase64IfNeeded(value string) (string, error) {
	decoded, err := base64.StdEncoding.DecodeString(value)
	if err != nil {
		return value, nil // Assume it's not base64 encoded if decoding fails
	}
	return string(decoded), nil
}

func (fs *FileService) handleUploadComplete(event tusd.HookEvent) {
	upload := event.Upload // Get the upload from the event
	fs.logWithMutex(fmt.Sprintf("Processing upload: %s", upload.ID))

	metadata := upload.MetaData                           // Get metadata from the upload
	storedFile := filepath.Join(fs.UploadPath, upload.ID) // Path to the stored file

	// Log each metadata key-value pair
	for key, value := range metadata {
		fs.logWithMutex(fmt.Sprintf("Metadata - Key: %s, Value: %s", key, value))
	}

	// Get file information and check if it exists and is not empty
	fileInfo, err := os.Stat(storedFile)
	if err != nil {
		fs.logWithMutex(fmt.Sprintf("Error stating file: %v", err))
		return
	}
	if fileInfo.Size() == 0 {
		fs.logWithMutex(fmt.Sprintf("File %s is empty", storedFile))
		return
	}

	fs.logWithMutex(fmt.Sprintf("File stored at %s with size %d", storedFile, fileInfo.Size()))

	// Use the upload ID directly as the filename
	originalFileName := upload.ID
	originalFilePath := filepath.Join(fs.UploadPath, originalFileName)
	if err := os.Rename(storedFile, originalFilePath); err != nil {
		fs.logWithMutex(fmt.Sprintf("Error renaming file: %v", err))
		return
	}
	fs.logWithMutex(fmt.Sprintf("File renamed to %s", originalFilePath))

	// Save metadata to a .info file in JSON format
	infoFilePath := originalFilePath + ".info"
	infoData := map[string]interface{}{
		"ID":             upload.ID,
		"Size":           upload.Size,
		"SizeIsDeferred": upload.SizeIsDeferred,
		"Offset":         upload.Offset,
		"MetaData":       upload.MetaData,
		"IsPartial":      upload.IsPartial,
		"IsFinal":        upload.IsFinal,
		"PartialUploads": upload.PartialUploads,
		"Storage": map[string]interface{}{
			"Path": originalFilePath,
			"Type": "filestore",
		},
	}

	infoFile, err := os.Create(infoFilePath)
	if err != nil {
		fs.logWithMutex(fmt.Sprintf("Error creating info file: %v", err))
		return
	}
	defer infoFile.Close()

	encoder := json.NewEncoder(infoFile)
	encoder.SetIndent("", "  ")
	if err := encoder.Encode(infoData); err != nil {
		fs.logWithMutex(fmt.Sprintf("Error writing to info file: %v", err))
		return
	}
	fs.logWithMutex(fmt.Sprintf("Metadata saved to %s", infoFilePath))

	// Check if the file already exists in the repository
	existingFile, err := fs.fileRepository.GetFileByFileID(upload.ID)
	if err != nil {
		fs.logWithMutex(fmt.Sprintf("Error checking for existing file: %v", err))
		return
	}
	if existingFile == nil {
		// Save file metadata to the repository if it doesn't already exist
		if err := fs.saveFileMetadata(upload.ID, metadata, originalFilePath); err != nil {
			fs.logWithMutex(fmt.Sprintf("Error saving file metadata: %v", err))
			return
		}
		fs.logWithMutex(fmt.Sprintf("Metadata for upload %s saved successfully", upload.ID))
	} else {
		fs.logWithMutex(fmt.Sprintf("File metadata for upload %s already exists", upload.ID))
	}
}

// saveFileMetadata saves the file metadata to the repository.
func (fs *FileService) saveFileMetadata(uploadID string, metadata map[string]string, originalFilePath string) error {
	fileName, ok := metadata["filename"]
	if !ok {
		fs.logWithMutex("Filename not provided in metadata")
		return fmt.Errorf("filename not provided in metadata")
	}

	sizeStr, ok := metadata["size"]
	if !ok {
		fs.logWithMutex("Size not provided in metadata")
		return fmt.Errorf("size not provided in metadata")
	}

	size, err := strconv.ParseInt(sizeStr, 10, 64)
	if err != nil {
		fs.logWithMutex(fmt.Sprintf("Error parsing size: %v", err))
		return fmt.Errorf("error parsing size: %v", err)
	}

	userID, err := strconv.Atoi(metadata["userId"])
	if err != nil {
		fs.logWithMutex(fmt.Sprintf("Error parsing user ID: %v", err))
		return fmt.Errorf("error parsing user ID: %v", err)
	}

	fs.logWithMutex(fmt.Sprintf("Saving file metadata: filename=%s, path=%s, size=%d", fileName, originalFilePath, size))

	fileUpload := &model.FileUpload{
		UserID:     uint(userID),
		FileName:   fileName,
		FilePath:   originalFilePath,
		Size:       size,
		UploadedAt: time.Now(),
	}

	return fs.fileRepository.SaveFileUpload(fileUpload)
}

// SaveFile saves a file's metadata to the repository.
func (fs *FileService) SaveFile(file *model.FileUpload) error {
	return fs.fileRepository.SaveFileUpload(file)
}

// GetAllFiles retrieves all files' metadata from the repository.
func (fs *FileService) GetAllFiles() ([]model.FileUpload, error) {
	return fs.fileRepository.GetAllFiles()
}

// logWithMutex logs a message with a mutex to ensure thread safety.
func (fs *FileService) logWithMutex(message string) {
	fs.mu.Lock()
	defer fs.mu.Unlock()
	log.Println(message)
}
