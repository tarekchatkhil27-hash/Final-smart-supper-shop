package models

import "gorm.io/gorm"

// Admin represents an administrative user
type Admin struct {
	gorm.Model
	Email        string `gorm:"uniqueIndex;not null" json:"email"`
	PasswordHash string `gorm:"not null" json:"-"`
}

// Product represents an item in the store
type Product struct {
	gorm.Model
	Slug            string   `gorm:"uniqueIndex;not null" json:"slug"`
	NameBn          string   `gorm:"not null" json:"nameBn"`
	NameEn          string   `gorm:"not null" json:"nameEn"`
	Price           float64  `gorm:"not null" json:"price"`
	DiscountPrice   *float64 `json:"discountPrice"`
	DiscountPercent *int     `json:"discountPercent"`
	Image           string   `json:"image"`
	UnitBn          string   `json:"unitBn"`
	UnitEn          string   `json:"unitEn"`
	Category        string   `gorm:"index" json:"category"`
	DescriptionBn   string   `json:"descriptionBn"`
	DescriptionEn   string   `json:"descriptionEn"`
	IsNew           bool     `gorm:"default:false" json:"isNew"`
	PackSizes       string   `json:"packSizes"` // JSON string representation
}

// Order represents a guest checkout order
type Order struct {
	gorm.Model
	CustomerName string      `gorm:"not null" json:"customerName"`
	Phone        string      `gorm:"not null" json:"phone"`
	Address      string      `gorm:"not null" json:"address"`
	TotalAmount  float64     `gorm:"not null" json:"totalAmount"`
	Status       string      `gorm:"default:'pending'" json:"status"`
	Items        []OrderItem `gorm:"foreignKey:OrderID" json:"items"`
}

// OrderItem represents a single line item in an order
type OrderItem struct {
	gorm.Model
	OrderID   uint    `gorm:"index" json:"orderId"`
	ProductID uint    `json:"productId"`
	Quantity  int     `gorm:"not null" json:"quantity"`
	Price     float64 `gorm:"not null" json:"price"` // Captured at purchase time
}
