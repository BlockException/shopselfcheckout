package payment

import "fmt"

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

func NewPaymentProcessor(method string) PaymentProcessor {
	switch method {
	case "credit_card":
		return &CreditCardProcessor{}
	case "paypal":
		return &PayPalProcessor{}
	case "cash":
		return &CashProcessor{}
	case "gift_card":
		return &GiftCardProcessor{}
	case "apple_pay":
		return &ApplePayProcessor{}
	case "google_pay":
		return &GooglePayProcessor{}
	default:
		return &CashProcessor{}
	}
}
