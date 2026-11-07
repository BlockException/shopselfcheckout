import { Controller, Post, Body, Delete, Param, Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InitializeCheckoutCommand, ScanItemCommand, RemoveItemCommand, InitiatePaymentCommand, CancelCheckoutCommand } from '../commands/initialize-checkout.command';

@ApiTags('checkout')
@Controller('api/v1/checkouts')
export class CheckoutController {
  private readonly logger = new Logger(CheckoutController.name);

  constructor(
    private readonly commandBus: CommandBus
  ) {}

  @Post()
  @ApiOperation({ summary: 'Initialize a new checkout' })
  @ApiResponse({ status: 201, description: 'Checkout initialized' })
  async initializeCheckout(
    @Body() body: { terminalId: string; customerId?: string }
  ): Promise<{ checkoutId: string }> {
    this.logger.log('Initializing checkout');
    const checkoutId = await this.commandBus.execute(
      new InitializeCheckoutCommand(body.terminalId, body.customerId)
    );
    return { checkoutId };
  }

  @Post(':checkoutId/items')
  @ApiOperation({ summary: 'Scan an item' })
  async scanItem(
    @Param('checkoutId') checkoutId: string,
    @Body() body: any
  ): Promise<void> {
    await this.commandBus.execute(
      new ScanItemCommand(
        checkoutId,
        body.productId,
        body.ean,
        body.name,
        body.quantity,
        body.unitPrice,
        body.discountAmount,
        body.taxRate
      )
    );
  }

  @Delete(':checkoutId/items/:productId')
  @ApiOperation({ summary: 'Remove an item' })
  async removeItem(
    @Param('checkoutId') checkoutId: string,
    @Param('productId') productId: string,
    @Body() body: { quantity: number }
  ): Promise<void> {
    await this.commandBus.execute(
      new RemoveItemCommand(checkoutId, productId, body.quantity)
    );
  }

  @Post(':checkoutId/payment')
  @ApiOperation({ summary: 'Initiate payment' })
  async initiatePayment(
    @Param('checkoutId') checkoutId: string,
    @Body() body: { paymentMethod: string }
  ): Promise<void> {
    await this.commandBus.execute(
      new InitiatePaymentCommand(checkoutId, body.paymentMethod)
    );
  }

  @Post(':checkoutId/cancel')
  @ApiOperation({ summary: 'Cancel checkout' })
  async cancelCheckout(
    @Param('checkoutId') checkoutId: string,
    @Body() body: { reason: string }
  ): Promise<void> {
    await this.commandBus.execute(
      new CancelCheckoutCommand(checkoutId, body.reason)
    );
  }
}
