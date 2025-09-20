import { trpcServer } from '@hono/trpc-server';
import 'dotenv/config';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { env } from './env';
import { auth } from './lib/auth';
import { createContext } from './lib/context';
import { appRouter } from './routers/index';
import { checkHealth } from './utils/health';

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

// Export for Vercel (Hono app directly)
export default app;

// For local development with Node.js
export const config = {
  port: env.PORT,
  hostname: env.HOSTNAME,
};
