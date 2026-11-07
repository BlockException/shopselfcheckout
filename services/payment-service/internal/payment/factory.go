package payment

import (
	"errors"
	"fmt"
)

var ErrUnsupportedMethod = errors.New("unsupported payment method")

type PaymentProcessor interface {
	Process(amount float64, currency string) (string, error)
	Refund(transactionID string) error
}

type CreditCardProcessor struct{}
type PayPalProcessor struct{}
type CashProcessor struct{}
type GiftCardProcessor struct{}
type ApplePayProcessor struct{}
type GooglePayProcessor struct{}

func (c *CreditCardProcessor) Process(amount float64, currency string) (string, error) {
	return "cc-" + fmt.Sprintf("%.2f", amount), nil
}
func (c *CreditCardProcessor) Refund(transactionID string) error { return nil }

func (p *PayPalProcessor) Process(amount float64, currency string) (string, error) {
	return "pp-" + fmt.Sprintf("%.2f", amount), nil
}
func (p *PayPalProcessor) Refund(transactionID string) error { return nil }

func (c *CashProcessor) Process(amount float64, currency string) (string, error) {
	return "cash-" + fmt.Sprintf("%.2f", amount), nil
}
func (c *CashProcessor) Refund(transactionID string) error { return nil }

func (g *GiftCardProcessor) Process(amount float64, currency string) (string, error) {
	return "gc-" + fmt.Sprintf("%.2f", amount), nil
}
func (g *GiftCardProcessor) Refund(transactionID string) error { return nil }

func (a *ApplePayProcessor) Process(amount float64, currency string) (string, error) {
	return "ap-" + fmt.Sprintf("%.2f", amount), nil
}
func (a *ApplePayProcessor) Refund(transactionID string) error { return nil }

func (g *GooglePayProcessor) Process(amount float64, currency string) (string, error) {
	return "gp-" + fmt.Sprintf("%.2f", amount), nil
}
func (g *GooglePayProcessor) Refund(transactionID string) error { return nil }

func NewPaymentProcessor(method string) (PaymentProcessor, error) {
	switch method {
	case "credit_card":
		return &CreditCardProcessor{}, nil
	case "paypal":
		return &PayPalProcessor{}, nil
	case "cash":
		return &CashProcessor{}, nil
	case "gift_card":
		return &GiftCardProcessor{}, nil
	case "apple_pay":
		return &ApplePayProcessor{}, nil
	case "google_pay":
		return &GooglePayProcessor{}, nil
	default:
		return nil, ErrUnsupportedMethod
	}
}
