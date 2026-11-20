
import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller.js';
import { OrdersService } from './orders.service.js';
import { databaseProvider } from '../database/database.provider.js';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService, databaseProvider],
})
export class OrdersModule {}
