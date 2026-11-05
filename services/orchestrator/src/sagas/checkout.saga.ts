import { Injectable, Logger } from '@nestjs/common';
import { IEvent, ICommand, Saga, ofType } from '@nestjs/cqrs';
import { Observable, delay, map } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { PaymentCompletedEvent, PaymentInitiatedEvent } from '../events/checkout-initialized.event';
import { CancelCheckoutCommand, CompleteCheckoutCommand, CompletePaymentCommand } from '../commands/initialize-checkout.command';

@Injectable()
export class CheckoutSaga {
  private readonly logger = new Logger(CheckoutSaga.name);

  @Saga()
  paymentInitiated = (events$: Observable<IEvent>): Observable<ICommand> => {
    return events$.pipe(
      ofType(PaymentInitiatedEvent),
      delay(1000),
      map((event: PaymentInitiatedEvent) => {
        this.logger.debug(`Processing payment saga for checkout: ${event.aggregateId}`);

        const randomSuccess = Math.random() > 0.1;

        if (randomSuccess) {
          return new CompletePaymentCommand(event.aggregateId, `mock-${uuidv4()}`);
        } else {
          return new CancelCheckoutCommand(event.aggregateId, 'PAYMENT_DECLINED');
        }
      })
    );
  }

  @Saga()
  paymentCompleted = (events$: Observable<IEvent>): Observable<ICommand> => {
    return events$.pipe(
      ofType(PaymentCompletedEvent),
      map((event: PaymentCompletedEvent) => {
        this.logger.debug(`Completing checkout after payment: ${event.aggregateId}`);
        return new CompleteCheckoutCommand(event.aggregateId);
      })
    );
  }
}
