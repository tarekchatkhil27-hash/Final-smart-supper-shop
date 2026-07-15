package database

import (
	"fmt"
	"log"
	"os"
	"path/filepath"
	"time"
)

// StartBackupWorker runs a background goroutine that backs up the database every 24 hours
// and cleans up backups older than 7 days.
func StartBackupWorker() {
	go func() {
		// Run the first backup immediately for demonstration, then every 24 hours.
		// In production, you might just want the ticker.
		performBackup()

		ticker := time.NewTicker(24 * time.Hour)
		defer ticker.Stop()

		for range ticker.C {
			performBackup()
		}
	}()
}

func performBackup() {
	backupDir := "backups"

	// Create backups directory if it doesn't exist
	if err := os.MkdirAll(backupDir, os.ModePerm); err != nil {
		log.Printf("Backup Error: Failed to create backups directory: %v\n", err)
		return
	}

	// 1. Create a safe backup using SQLite's VACUUM INTO
	timestamp := time.Now().Format("2006-01-02_15-04-05")
	backupFilename := fmt.Sprintf("ecommerce_%s.db", timestamp)
	backupPath := filepath.Join(backupDir, backupFilename)

	log.Printf("Starting database backup to %s...\n", backupPath)

	// VACUUM INTO safely creates a consistent copy of the database without blocking readers
	if err := DB.Exec(fmt.Sprintf("VACUUM INTO '%s'", backupPath)).Error; err != nil {
		log.Printf("Backup Error: Failed to execute VACUUM INTO: %v\n", err)
		return
	}

	log.Println("Database backup completed successfully.")

	// 2. Clean up old backups (> 7 days)
	cleanupOldBackups(backupDir)
}

func cleanupOldBackups(backupDir string) {
	files, err := os.ReadDir(backupDir)
	if err != nil {
		log.Printf("Cleanup Error: Failed to read backups directory: %v\n", err)
		return
	}

	cutoffDate := time.Now().Add(-7 * 24 * time.Hour)

	for _, file := range files {
		if file.IsDir() {
			continue
		}

		info, err := file.Info()
		if err != nil {
			continue
		}

		if info.ModTime().Before(cutoffDate) {
			path := filepath.Join(backupDir, file.Name())
			if err := os.Remove(path); err != nil {
				log.Printf("Cleanup Error: Failed to delete old backup %s: %v\n", path, err)
			} else {
				log.Printf("Deleted old backup: %s\n", path)
			}
		}
	}
}
