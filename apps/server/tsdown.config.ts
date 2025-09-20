import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  bundle: true,
  external: [
    // Keep external dependencies as external
    'hono',
    'better-auth',
    '@trpc/server',
    'drizzle-orm',
    'postgres',
    'zod',
    'dotenv',
  ],
  // Bundle workspace packages
  noExternal: ['@windmills/db', '@windmills/lib'],
  platform: 'node',
});
