import * as schema from '@windmills/db';
import { env } from '@windmills/db';
import { betterAuth, type BetterAuthOptions } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '../db';

export const auth = betterAuth<BetterAuthOptions>({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: schema,
  }),

  secret: env.BETTER_AUTH_SECRET,

  trustedOrigins: env.CORS_ORIGIN.split(','),

  emailAndPassword: {
    enabled: true,
  },

  advanced: {
    defaultCookieAttributes: {
      sameSite: 'none',
      secure: env.NODE_ENV === 'production',
      httpOnly: true,
    },
  },
});
