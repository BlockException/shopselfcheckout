import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import 'reflect-metadata';

async function bootstrap() {
  const logger = new Logger('ShopSelfCheckoutOrchestrator');
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(new ValidationPipe());
  
  const config = new DocumentBuilder()
    .setTitle('ShopSelfCheckout Orchestrator')
    .setDescription('CQRS & Event Sourcing API')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  
  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`Orchestrator is running on port ${port}`);
}

bootstrap();
