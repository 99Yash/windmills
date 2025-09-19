import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

export const createDb = (connectionString: string) => {
  const client = postgres(connectionString, {
    prepare: false, // Disable prepared statements for edge runtime compatibility
  });
  return drizzle(client);
};

// For local development only - will be null in Cloudflare Workers
export const db = process.env.DATABASE_URL
  ? createDb(process.env.DATABASE_URL)
  : (null as any);
