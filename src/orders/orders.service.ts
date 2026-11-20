
import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Pool } from 'pg';

interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

interface CreateOrder {
  customerId: string;
  items: OrderItem[];
}

@Injectable()
export class OrdersService {
  constructor(
    @Inject('DATABASE_POOL')
    private readonly pool: Pool,
  ) {}

  async createOrder(body: CreateOrder) {
    const { customerId, items } = body;

    if (
      typeof customerId !== 'string' ||
      !customerId.trim() ||
      !Array.isArray(items) ||
      items.length === 0 ||
      !items.every(
        (item) =>
          typeof item.productId === 'string' &&
          item.productId.trim().length > 0 &&
          Number.isInteger(item.quantity) &&
          item.quantity > 0 &&
          typeof item.price === 'number' &&
          Number.isFinite(item.price) &&
          item.price >= 0,
      )
    ) {
      throw new BadRequestException('Datos del pedido no válidos');
    }

    const totalAmount = Number(
      items
        .reduce(
          (total, item) => total + item.quantity * item.price,
          0,
        )
        .toFixed(2),
    );

    const itemsCount = items.reduce(
      (count, item) => count + item.quantity,
      0,
    );

    if (
      !Number.isFinite(totalAmount) ||
      totalAmount > 99999999.99 ||
      !Number.isSafeInteger(itemsCount) ||
      itemsCount > 2147483647
    ) {
      throw new BadRequestException('Totales fuera de rango');
    }

    const orderId = randomUUID();
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      const result = await client.query(
        `INSERT INTO orders
         (order_id, customer_id, total_amount, items_count)
         VALUES ($1, $2, $3, $4)
         RETURNING created_at`,
        [orderId, customerId, totalAmount, itemsCount],
      );

      for (const item of items) {
        await client.query(
          `INSERT INTO order_items
           (order_id, product_id, quantity, price)
           VALUES ($1, $2, $3, $4)`,
          [
            orderId,
            item.productId,
            item.quantity,
            item.price,
          ],
        );
      }

      await client.query('COMMIT');

      return {
        orderId,
        totalAmount,
        itemsCount,
        processedAt: result.rows[0].created_at,
      };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error guardando pedido:', error);
      throw new InternalServerErrorException(
        'No fue posible guardar el pedido',
      );
    } finally {
      client.release();
    }
  }
}
