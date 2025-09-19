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

// Initialize database connection - ensures db is never null
export const db = (() => {
  if (!dbInstance) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error(
        'DATABASE_URL environment variable is required but not set. ' +
          'Please set DATABASE_URL in your environment variables.'
      );
    }
    dbInstance = createDb(connectionString);
  }
  return dbInstance;
})();
