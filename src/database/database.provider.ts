
import { Pool } from 'pg';

export const databaseProvider = {
  provide: 'DATABASE_POOL',
  useFactory: () => {
    return new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 5433),
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'orders_db',
      max: 10,
    });
  },
};
