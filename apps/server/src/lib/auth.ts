import * as schema from '@windmills/db';
import { betterAuth, type BetterAuthOptions } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '../db';

// Note: db is guaranteed to be non-null - will throw during module initialization if DATABASE_URL is missing
export const auth = betterAuth<BetterAuthOptions>({
  database: drizzleAdapter(db, {
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
      sameSite: 'none',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
    },
  },
});
