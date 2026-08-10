package repository

import (
	"shopselfcheckout-payment-service/internal/models"
	"gorm.io/gorm"
)

type PaymentRepository interface {
	Create(payment *models.Payment) error
	FindByID(id string) (*models.Payment, error)
	FindByCheckoutID(checkoutID string) (*models.Payment, error)
	Update(payment *models.Payment) error
}

type paymentRepository struct {
	db *gorm.DB
}

func NewPaymentRepository(db *gorm.DB) PaymentRepository {
	return &paymentRepository{db: db}
}

func (r *paymentRepository) Create(payment *models.Payment) error {
	return r.db.Create(payment).Error
}

func (r *paymentRepository) FindByID(id string) (*models.Payment, error) {
	var payment models.Payment
	err := r.db.First(&payment, "id = ?", id).Error
	return &payment, err
}

func (r *paymentRepository) FindByCheckoutID(checkoutID string) (*models.Payment, error) {
	var payment models.Payment
	err := r.db.First(&payment, "checkout_id = ?", checkoutID).Error
	return &payment, err
}

func (r *paymentRepository) Update(payment *models.Payment) error {
	return r.db.Save(payment).Error
}
