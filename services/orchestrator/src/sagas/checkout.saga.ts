import { Injectable, Logger } from '@nestjs/common';
import { Saga, ICommand, ofType } from '@nestjs/cqrs';
import { Observable, delay, map } from 'rxjs';
import { PaymentInitiatedEvent, CheckoutCompletedEvent } from '../events/checkout-initialized.event';
import { CompleteCheckoutCommand, CancelCheckoutCommand } from '../commands/initialize-checkout.command';

@Injectable()
export class CheckoutSaga {
  private readonly logger = new Logger(CheckoutSaga.name);

  @Saga()
  paymentInitiated = (events$: Observable<any>): Observable<ICommand> => {
    return events$.pipe(
      ofType(PaymentInitiatedEvent),
      delay(1000),
      map((event: PaymentInitiatedEvent) => {
        this.logger.debug(`Processing payment saga for checkout: ${event.aggregateId}`);
        
        const randomSuccess = Math.random() > 0.1;
        
        if (randomSuccess) {
          return new CompleteCheckoutCommand(event.aggregateId);
        } else {
          return new CancelCheckoutCommand(event.aggregateId, 'PAYMENT_DECLINED');
        }
      })
    );
  }

  @Saga()
  checkoutCompleted = (events$: Observable<any>): Observable<ICommand> => {
    return events$.pipe(
      ofType(CheckoutCompletedEvent),
      map((event: CheckoutCompletedEvent) => {
        this.logger.debug(`Checkout completed saga for: ${event.aggregateId}`);
        return { type: 'NOOP' } as any;
      })
    );
  }
}
