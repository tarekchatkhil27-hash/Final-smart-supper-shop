package notifications

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"
)

// WebhookPayload represents the standard Discord webhook JSON payload
type WebhookPayload struct {
	Content string `json:"content"`
}

// SendOrderNotification fires off a webhook message detailing a new order.
// It runs in the background so it doesn't block the API response.
func SendOrderNotification(orderID uint, totalAmount float64) {
	webhookURL := os.Getenv("DISCORD_WEBHOOK_URL")
	if webhookURL == "" {
		// Silently skip if no webhook is configured
		return
	}

	// Run the network request in a goroutine to keep the API fast
	go func() {
		msg := fmt.Sprintf("🛒 **New Order Received!**\nOrder ID: `%d`\nTotal Amount: `$%.2f`", orderID, totalAmount)
		
		payload := WebhookPayload{
			Content: msg,
		}

		jsonData, err := json.Marshal(payload)
		if err != nil {
			log.Printf("Webhook Error: Failed to marshal payload: %v", err)
			return
		}

		client := &http.Client{Timeout: 10 * time.Second}
		resp, err := client.Post(webhookURL, "application/json", bytes.NewBuffer(jsonData))
		if err != nil {
			log.Printf("Webhook Error: Failed to send notification: %v", err)
			return
		}
		defer resp.Body.Close()

		if resp.StatusCode >= 400 {
			log.Printf("Webhook Error: Received status code %d from webhook", resp.StatusCode)
		}
	}()
}
