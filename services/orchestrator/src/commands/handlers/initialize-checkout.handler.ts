import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Injectable, Logger } from '@nestjs/common';
import { InitializeCheckoutCommand, ScanItemCommand, RemoveItemCommand, InitiatePaymentCommand, CompleteCheckoutCommand, CancelCheckoutCommand } from '../initialize-checkout.command';
import { CheckoutAggregate } from '../../aggregates/checkout.aggregate';
import { CheckoutRepository } from '../../repositories/checkout.repository';

@CommandHandler(InitializeCheckoutCommand)
export class InitializeCheckoutHandler implements ICommandHandler<InitializeCheckoutCommand> {
  private readonly logger = new Logger(InitializeCheckoutHandler.name);

  constructor(
    private readonly repository: CheckoutRepository,
    private readonly publisher: EventPublisher
  ) {}

  async execute(command: InitializeCheckoutCommand): Promise<string> {
    this.logger.debug(`Initializing checkout for terminal: ${command.terminalId}`);
    
    const aggregate = this.publisher.mergeObjectContext(
      new CheckoutAggregate()
    );
    
    aggregate.initialize(command.terminalId, command.customerId);
    await this.repository.save(aggregate);
    aggregate.commit();
    
    return aggregate.checkoutId;
  }
}

@CommandHandler(ScanItemCommand)
export class ScanItemHandler implements ICommandHandler<ScanItemCommand> {
  private readonly logger = new Logger(ScanItemHandler.name);

  constructor(
    private readonly repository: CheckoutRepository,
    private readonly publisher: EventPublisher
  ) {}

  async execute(command: ScanItemCommand): Promise<void> {
    this.logger.debug(`Scanning item for checkout: ${command.checkoutId}`);
    
    const aggregate = this.publisher.mergeObjectContext(
      await this.repository.findById(command.checkoutId)
    );
    
    aggregate.scanItem({
      productId: command.productId,
      ean: command.ean,
      name: command.name,
      quantity: command.quantity,
      unitPrice: command.unitPrice,
      discountAmount: command.discountAmount,
      taxRate: command.taxRate
    });
    
    await this.repository.save(aggregate);
    aggregate.commit();
  }
}

@CommandHandler(RemoveItemCommand)
export class RemoveItemHandler implements ICommandHandler<RemoveItemCommand> {
  constructor(
    private readonly repository: CheckoutRepository,
    private readonly publisher: EventPublisher
  ) {}

  async execute(command: RemoveItemCommand): Promise<void> {
    const aggregate = this.publisher.mergeObjectContext(
      await this.repository.findById(command.checkoutId)
    );
    
    aggregate.removeItem(command.productId, command.quantity);
    await this.repository.save(aggregate);
    aggregate.commit();
  }
}

@CommandHandler(InitiatePaymentCommand)
export class InitiatePaymentHandler implements ICommandHandler<InitiatePaymentCommand> {
  constructor(
    private readonly repository: CheckoutRepository,
    private readonly publisher: EventPublisher
  ) {}

  async execute(command: InitiatePaymentCommand): Promise<void> {
    const aggregate = this.publisher.mergeObjectContext(
      await this.repository.findById(command.checkoutId)
    );
    
    aggregate.initiatePayment(command.paymentMethod);
    await this.repository.save(aggregate);
    aggregate.commit();
  }
}

@CommandHandler(CompleteCheckoutCommand)
export class CompleteCheckoutHandler implements ICommandHandler<CompleteCheckoutCommand> {
  constructor(
    private readonly repository: CheckoutRepository,
    private readonly publisher: EventPublisher
  ) {}

  async execute(command: CompleteCheckoutCommand): Promise<void> {
    const aggregate = this.publisher.mergeObjectContext(
      await this.repository.findById(command.checkoutId)
    );
    
    aggregate.completeCheckout();
    await this.repository.save(aggregate);
    aggregate.commit();
  }
}

@CommandHandler(CancelCheckoutCommand)
export class CancelCheckoutHandler implements ICommandHandler<CancelCheckoutCommand> {
  constructor(
    private readonly repository: CheckoutRepository,
    private readonly publisher: EventPublisher
  ) {}

  async execute(command: CancelCheckoutCommand): Promise<void> {
    const aggregate = this.publisher.mergeObjectContext(
      await this.repository.findById(command.checkoutId)
    );
    
    aggregate.cancelCheckout(command.reason);
    await this.repository.save(aggregate);
    aggregate.commit();
  }
}
