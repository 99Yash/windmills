import * as schema from '@windmills/db';
import { betterAuth, type BetterAuthOptions } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { z } from 'zod';
import { db } from '../db';

// Inline environment validation for auth
const authEnvSchema = z.object({
  BETTER_AUTH_SECRET: z.string(),
  CORS_ORIGIN: z.string(),
  NODE_ENV: z
    .enum(['development', 'production', 'staging'])
    .optional()
    .default('development'),
});

const authEnv = authEnvSchema.parse(process.env);

export const auth = betterAuth<BetterAuthOptions>({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: schema,
  }),

  secret: authEnv.BETTER_AUTH_SECRET,

  trustedOrigins: authEnv.CORS_ORIGIN.split(','),

  emailAndPassword: {
    enabled: true,
  },

  advanced: {
    defaultCookieAttributes: {
      sameSite: 'none',
      secure: authEnv.NODE_ENV === 'production',
      httpOnly: true,
    },
  },
});
