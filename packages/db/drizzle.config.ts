import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

// Load environment variables from .env file
config();

export default defineConfig({
  schema: './src/schema/*.ts',
  out: './src/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || '',
  },
});
