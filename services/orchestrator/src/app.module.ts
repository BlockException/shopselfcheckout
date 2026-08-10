import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CheckoutController } from './controllers/checkout.controller';
import { InitializeCheckoutHandler, ScanItemHandler, RemoveItemHandler, InitiatePaymentHandler, CompleteCheckoutHandler, CancelCheckoutHandler } from './commands/handlers/initialize-checkout.handler';
import { CheckoutRepository } from './repositories/checkout.repository';
import { CheckoutSaga } from './sagas/checkout.saga';
import { DatabaseConfigModule } from './config/database.config';

const CommandHandlers = [
  InitializeCheckoutHandler,
  ScanItemHandler,
  RemoveItemHandler,
  InitiatePaymentHandler,
  CompleteCheckoutHandler,
  CancelCheckoutHandler
];

const Sagas = [CheckoutSaga];
const Repositories = [CheckoutRepository];

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CqrsModule,
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URL', 'mongodb://localhost:27017/shopselfcheckout_events')
      }),
      inject: [ConfigService]
    }),
    DatabaseConfigModule
  ],
  controllers: [CheckoutController],
  providers: [
    ...CommandHandlers,
    ...Sagas,
    ...Repositories
  ]
})
export class AppModule {}
