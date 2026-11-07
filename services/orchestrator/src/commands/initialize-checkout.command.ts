import { ICommand } from '@nestjs/cqrs';
import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class InitializeCheckoutCommand implements ICommand {
  @IsString()
  @IsNotEmpty()
  public readonly terminalId: string;

  @IsString()
  @IsOptional()
  public readonly customerId?: string;

  constructor(terminalId: string, customerId?: string) {
    this.terminalId = terminalId;
    this.customerId = customerId;
  }
}

export class ScanItemCommand implements ICommand {
  @IsString()
  @IsNotEmpty()
  public readonly checkoutId: string;

  @IsString()
  @IsNotEmpty()
  public readonly productId: string;

  @IsString()
  @IsNotEmpty()
  public readonly ean: string;

  @IsString()
  @IsNotEmpty()
  public readonly name: string;

  public readonly quantity: number;
  public readonly unitPrice: number;
  public readonly discountAmount: number;
  public readonly taxRate: number;

  constructor(
    checkoutId: string,
    productId: string,
    ean: string,
    name: string,
    quantity: number,
    unitPrice: number,
    discountAmount: number,
    taxRate: number
  ) {
    this.checkoutId = checkoutId;
    this.productId = productId;
    this.ean = ean;
    this.name = name;
    this.quantity = quantity;
    this.unitPrice = unitPrice;
    this.discountAmount = discountAmount;
    this.taxRate = taxRate;
  }
}

export class RemoveItemCommand implements ICommand {
  @IsString()
  @IsNotEmpty()
  public readonly checkoutId: string;

  @IsString()
  @IsNotEmpty()
  public readonly productId: string;

  public readonly quantity: number;

  constructor(checkoutId: string, productId: string, quantity: number) {
    this.checkoutId = checkoutId;
    this.productId = productId;
    this.quantity = quantity;
  }
}

export class InitiatePaymentCommand implements ICommand {
  @IsString()
  @IsNotEmpty()
  public readonly checkoutId: string;

  @IsString()
  @IsNotEmpty()
  public readonly paymentMethod: string;

  constructor(checkoutId: string, paymentMethod: string) {
    this.checkoutId = checkoutId;
    this.paymentMethod = paymentMethod;
  }
}

export class CompleteCheckoutCommand implements ICommand {
  @IsString()
  @IsNotEmpty()
  public readonly checkoutId: string;

  constructor(checkoutId: string) {
    this.checkoutId = checkoutId;
  }
}

export class CancelCheckoutCommand implements ICommand {
  @IsString()
  @IsNotEmpty()
  public readonly checkoutId: string;

  @IsString()
  @IsNotEmpty()
  public readonly reason: string;

  constructor(checkoutId: string, reason: string) {
    this.checkoutId = checkoutId;
    this.reason = reason;
  }
}
