import * as schema from '@windmills/db';
import { betterAuth, type BetterAuthOptions } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { createDb, db } from '../db';

// Create auth configuration function that can work with both local dev and Cloudflare Workers
const createAuthConfig = (
  database: ReturnType<typeof createDb>
): BetterAuthOptions => ({
  database: drizzleAdapter(database, {
    provider: 'pg',
    schema: schema,
  }),

  // Use environment variable for secret (required for JWT signing)
  secret: process.env.AUTH_SECRET || 'fallback-secret-for-development',

  // Trusted origins for CORS
  trustedOrigins: process.env.TRUSTED_ORIGINS?.split(',') ||
    process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3001'],

  emailAndPassword: {
    enabled: true,
  },

  advanced: {
    defaultCookieAttributes: {
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
    },
  },
});

// Export auth instance for local development (will be null in Cloudflare Workers)
export const auth = db ? betterAuth(createAuthConfig(db)) : null;

// Export function to create auth with specific database connection (for Cloudflare Workers)
export const createAuth = (database: ReturnType<typeof createDb>) =>
  betterAuth(createAuthConfig(database));
