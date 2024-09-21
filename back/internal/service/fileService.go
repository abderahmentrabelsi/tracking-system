package service

import (
	"context"
	_ "encoding/json"
	"fmt"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"log"
	"os"
	"strconv"
	"strings" // Added for string manipulation
	"sync"
	"time"

	model "back/internal/model"
	"back/internal/repository"

	_ "github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	tusd "github.com/tus/tusd/v2/pkg/handler"
	"github.com/tus/tusd/v2/pkg/s3store"
)

// FileService handles file uploads and their associated metadata.
type FileService struct {
	fileRepository *repository.FileRepository // Repository for interacting with file metadata in the database
	TusdHandler    *tusd.Handler              // tusd handler for managing uploads
	workerChan     chan tusd.HookEvent        // Channel for processing completed upload events
	wg             sync.WaitGroup             // WaitGroup for synchronizing goroutines
	mu             sync.Mutex                 // Mutex for thread-safe logging
	s3BucketURL    string                     // Base URL for constructing file URLs
}

// numWorkers defines the number of worker goroutines for processing uploads.
const numWorkers = 5

// NewFileService initializes the FileService with the given FileRepository.
// It sets up the S3 upload storage and the tusd handler.
// It also starts the worker goroutines and the main upload processing goroutine.
func NewFileService(fileRepository *repository.FileRepository) *FileService {
	awsAccessKey := os.Getenv("S3_AWS_ACCESS_KEY_ID")
	awsSecretKey := os.Getenv("S3_AWS_SECRET_ACCESS_KEY")
	awsRegion := os.Getenv("S3_BUCKET_REGION")
	s3Bucket := os.Getenv("S3_BUCKET_NAME")
	s3BucketURL := os.Getenv("S3_BUCKET_URL") // Optional: for constructing file URLs

	// Validate required environment variables
	if awsAccessKey == "" || awsSecretKey == "" || awsRegion == "" || s3Bucket == "" {
		log.Fatalf("One or more required environment variables are missing: S3_AWS_ACCESS_KEY_ID, S3_AWS_SECRET_ACCESS_KEY, S3_BUCKET_REGION, S3_BUCKET_NAME")
	}

	// Optionally log if s3BucketURL is not set
	if s3BucketURL == "" {
		log.Println("Warning: S3_BUCKET_URL is not set. File URLs will not be constructed using s3BucketURL.")
	}

	// Load AWS configuration with static credentials
	cfg, err := config.LoadDefaultConfig(context.TODO(),
		config.WithRegion(awsRegion),
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(
			awsAccessKey,
			awsSecretKey,
			"",
		)),
	)
	if err != nil {
		log.Fatalf("Failed to load AWS configuration: %v", err)
	}

	// Initialize S3 client
	s3Client := s3.NewFromConfig(cfg)

	// Initialize S3Store
	store := s3store.New(s3Bucket, s3Client)

	// Create a new store composer for tusd
	composer := tusd.NewStoreComposer()
	store.UseIn(composer)

	// Create a new tusd handler with the store composer
	handler, err := tusd.NewHandler(tusd.Config{
		BasePath:              "/files/",
		StoreComposer:         composer,
		NotifyCompleteUploads: true,
	})
	if err != nil {
		log.Fatalf("Unable to create tusd handler: %v", err)
	}

	// Initialize the FileService struct
	fs := &FileService{
		fileRepository: fileRepository,
		TusdHandler:    handler,
		workerChan:     make(chan tusd.HookEvent, numWorkers),
		s3BucketURL:    s3BucketURL, // Store the s3BucketURL
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

// handleUploadComplete processes a completed upload event.
func (fs *FileService) handleUploadComplete(event tusd.HookEvent) {
	upload := event.Upload
	fs.logWithMutex(fmt.Sprintf("Processing upload: %s", upload.ID))

	metadata := upload.MetaData

	// Extract necessary metadata
	fileName, ok := metadata["filename"]
	if !ok {
		fs.logWithMutex("Filename not provided in metadata")
		return
	}

	sizeStr, ok := metadata["size"]
	if !ok {
		fs.logWithMutex("Size not provided in metadata")
		return
	}

	size, err := strconv.ParseInt(sizeStr, 10, 64)
	if err != nil {
		fs.logWithMutex(fmt.Sprintf("Error parsing size: %v", err))
		return
	}

	userIDStr, ok := metadata["userId"]
	if !ok {
		fs.logWithMutex("User ID not provided in metadata")
		return
	}

	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		fs.logWithMutex(fmt.Sprintf("Error parsing user ID: %v", err))
		return
	}

	fs.logWithMutex(fmt.Sprintf("Saving file metadata: filename=%s, size=%d, userID=%d", fileName, size, userID))

	var filePath string
	if fs.s3BucketURL != "" {
		// Ensure that s3BucketURL does not end with a slash
		trimmedURL := strings.TrimRight(fs.s3BucketURL, "/")
		filePath = fmt.Sprintf("%s/%s", trimmedURL, upload.Storage["Key"])
	} else {
		// Fallback to constructing the URL using bucket name and region
		s3Bucket := os.Getenv("S3_BUCKET_NAME")
		s3Region := os.Getenv("S3_BUCKET_REGION")
		filePath = fmt.Sprintf("https://%s.s3.%s.amazonaws.com/%s", s3Bucket, s3Region, upload.Storage["Key"])
	}

	fileUpload := &model.FileUpload{
		UploadID:   upload.ID,
		UserID:     uint(userID),
		FileName:   fileName,
		FilePath:   filePath, // S3 URL
		Size:       size,
		UploadedAt: time.Now(),
	}

	// Save metadata to the repository
	if err := fs.fileRepository.SaveFileUpload(fileUpload); err != nil {
		fs.logWithMutex(fmt.Sprintf("Error saving file metadata: %v", err))
		return
	}

	fs.logWithMutex(fmt.Sprintf("Metadata for upload %s saved successfully", upload.ID))
}

// GetFileByFileID retrieves a file upload by its FileID.
func (fs *FileService) GetFileByFileID(fileID string) (*model.FileUpload, error) {
	return fs.fileRepository.GetFileByFileID(fileID)
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

// GetFilesByUserID retrieves all files uploaded by a specific user.
func (fs *FileService) GetFilesByUserID(userID uint) ([]model.FileUpload, error) {
	return fs.fileRepository.GetFilesByUserID(userID)
}
