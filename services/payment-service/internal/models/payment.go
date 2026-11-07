package models

import (
	"time"
	"gorm.io/gorm"
)

type Payment struct {
	ID            string    `gorm:"type:uuid;primaryKey" json:"id"`
	CheckoutID    string    `gorm:"not null" json:"checkout_id"`
	Amount        float64   `gorm:"not null" json:"amount"`
	Currency      string    `gorm:"default:'EUR'" json:"currency"`
	Method        string    `gorm:"not null" json:"method"`
	Status        string    `gorm:"default:'pending'" json:"status"`
	TransactionID string    `json:"transaction_id"`
	ErrorCode     string    `json:"error_code"`
	ErrorMessage  string    `json:"error_message"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

func (p *Payment) BeforeCreate(tx *gorm.DB) error {
	p.ID = generateUUID()
	p.CreatedAt = time.Now()
	p.UpdatedAt = time.Now()
	return nil
}

func (p *Payment) BeforeUpdate(tx *gorm.DB) error {
	p.UpdatedAt = time.Now()
	return nil
}

func generateUUID() string {
	// Simplified for demo
	return "uuid-" + time.Now().Format("20060102150405")
}
