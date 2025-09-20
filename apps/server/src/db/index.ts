import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { z } from 'zod';

// Inline environment validation for database
const dbEnvSchema = z.object({
  DATABASE_URL: z.string().url(),
});

const dbEnv = dbEnvSchema.parse(process.env);

// For Cloudflare Workers, we need to create the database connection
// with the Hyperdrive binding, which will be passed from the context
let dbInstance: ReturnType<typeof drizzle> | null = null;

export const createDb = (connectionString: string) => {
  const client = postgres(connectionString, {
    prepare: false, // Disable prepared statements for edge runtime compatibility
  });
  return drizzle(client);
};

// Initialize database connection - uses validated environment
export const db = (() => {
  if (!dbInstance) {
    dbInstance = createDb(dbEnv.DATABASE_URL);
  }
  return dbInstance;
})();

export * as schema from '@windmills/db';
