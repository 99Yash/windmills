import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.url(),
  BETTER_AUTH_SECRET: z.string(),
  CORS_ORIGIN: z.string(),
  NODE_ENV: z
    .enum(['development', 'production', 'staging'])
    .optional()
    .default('development'),
  PORT: z.string().transform(Number).optional().default(3000),
  HOSTNAME: z.string().optional().default('0.0.0.0'),
});

function createEnv(env: NodeJS.ProcessEnv) {
  const safeParseResult = envSchema.safeParse(env);
  if (!safeParseResult.success) throw new Error(safeParseResult.error.message);
  return safeParseResult.data;
}

export const env = createEnv(process.env);
