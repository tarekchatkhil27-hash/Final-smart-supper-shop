package models

import "gorm.io/gorm"

// Admin represents a system administrator
type Admin struct {
	gorm.Model
	Username     string `gorm:"uniqueIndex;not null" json:"username"`
	PasswordHash string `gorm:"not null" json:"-"`
}

// Product represents an item for sale in the e-commerce store
type Product struct {
	gorm.Model
	Name        string  `gorm:"not null" json:"name"`
	Description string  `json:"description"`
	Price       float64 `gorm:"not null" json:"price"`
	Stock       int     `gorm:"not null;default:0" json:"stock"`
	ImageURL    string  `json:"image_url"`
}

// Order represents a guest checkout order
type Order struct {
	gorm.Model
	CustomerEmail   string      `gorm:"not null" json:"customer_email"`
	CustomerAddress string      `gorm:"not null" json:"customer_address"`
	TotalPrice      float64     `gorm:"not null" json:"total_price"`
	Status          string      `gorm:"default:'pending'" json:"status"`
	Items           []OrderItem `gorm:"foreignKey:OrderID" json:"items"`
}

// OrderItem represents an individual product line item in an order
type OrderItem struct {
	gorm.Model
	OrderID   uint    `gorm:"index" json:"order_id"`
	ProductID uint    `json:"product_id"`
	Quantity  int     `gorm:"not null" json:"quantity"`
	Price     float64 `gorm:"not null" json:"price"` // Captured price at checkout
}
