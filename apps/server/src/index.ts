import { trpcServer } from '@hono/trpc-server';
import 'dotenv/config';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { z } from 'zod';
import { auth } from './lib/auth';
import { createContext } from './lib/context';
import { appRouter } from './routers/index';
import { checkHealth } from './utils/health';

// Inline environment validation
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

const env = envSchema.parse(process.env);

const app = new Hono();

app.use(secureHeaders());

app.use(logger());
app.use('*', async (c, next) => {
  const origins = env.CORS_ORIGIN.split(',');

  return cors({
    origin: origins,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowHeaders: [
      'Authorization',
      'Content-Type',
      'Accept',
      'Origin',
      'User-Agent',
      'DNT',
      'Cache-Control',
      'X-Mx-ReqToken',
      'Keep-Alive',
      'X-Requested-With',
      'If-Modified-Since',
    ],
    exposeHeaders: ['Content-Length'],
    credentials: true,
    maxAge: 86400,
  })(c, next);
});

app.on(['POST', 'GET'], '/api/auth/*', (c) => auth.handler(c.req.raw));

app.use(
  '/trpc/*',
  trpcServer({
    router: appRouter,
    createContext: (_opts, context) => {
      return createContext({ context });
    },
  })
);

// Health check endpoint
app.get('/health', async (c) => {
  try {
    // Use validated environment for database connection
    await checkHealth(env.DATABASE_URL);
    return c.json(
      {
        status: 'ok',
        timestamp: new Date().toISOString(),
        services: {
          database: 'connected',
          api: 'running',
        },
      },
      200
    );
  } catch (error) {
    return c.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      500
    );
  }
});

app.get('/', (c) => {
  return c.json({
    message: 'Windmills API',
    status: 'running',
    endpoints: {
      health: '/health',
      auth: '/api/auth/*',
      trpc: '/trpc/*',
    },
  });
});

// For local development with Node.js
const port = 3000;
const hostname = '0.0.0.0';

export const config = {
  port,
  hostname,
};

// Export for Vercel (Hono app directly)
export default app;
