package storage

import (
	"context"
	"io"
)

// ImageStorage defines the contract for uploading product images.
// By depending on this interface, the application can easily switch
// between local storage, AWS S3, Google Cloud Storage, etc.
type ImageStorage interface {
	UploadImage(ctx context.Context, file io.Reader, filename string, contentType string) (string, error)
}

// ActiveStorage is the globally configured storage provider
var ActiveStorage ImageStorage
