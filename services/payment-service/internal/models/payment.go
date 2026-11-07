package models

import (
	"crypto/rand"
	"fmt"
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
	id, err := generateUUID()
	if err != nil {
		return err
	}
	p.ID = id
	p.CreatedAt = time.Now()
	p.UpdatedAt = time.Now()
	return nil
}

func (p *Payment) BeforeUpdate(tx *gorm.DB) error {
	p.UpdatedAt = time.Now()
	return nil
}

func generateUUID() (string, error) {
	var id [16]byte
	if _, err := rand.Read(id[:]); err != nil {
		return "", err
	}
	id[6] = (id[6] & 0x0f) | 0x40
	id[8] = (id[8] & 0x3f) | 0x80

	return fmt.Sprintf("%x-%x-%x-%x-%x", id[0:4], id[4:6], id[6:8], id[8:10], id[10:16]), nil
}
