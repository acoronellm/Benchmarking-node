
import { Body, Controller, Post } from '@nestjs/common';
import { OrdersService } from './orders.service.js';

@Controller('api/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  createOrder(@Body() body: any) {
    return this.ordersService.createOrder(body);
  }
}
