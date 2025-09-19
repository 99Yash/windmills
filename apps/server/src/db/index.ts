import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// For Cloudflare Workers, we need to create the database connection
// with the Hyperdrive binding, which will be passed from the context
let dbInstance: ReturnType<typeof drizzle> | null = null;

export const createDb = (connectionString: string) => {
  const client = postgres(connectionString, {
    prepare: false, // Disable prepared statements for edge runtime compatibility
  });
  return drizzle(client);
};

// Fallback for local development
export const db = (() => {
  if (!dbInstance && process.env.DATABASE_URL) {
    dbInstance = createDb(process.env.DATABASE_URL);
  }
  return dbInstance;
})();
