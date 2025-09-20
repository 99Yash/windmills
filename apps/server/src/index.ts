import { trpcServer } from '@hono/trpc-server';
import 'dotenv/config';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { auth } from './lib/auth';
import { createContext } from './lib/context';
import { appRouter } from './routers/index';
import { checkHealth } from './utils/health';

// Hono app for Vercel deployment
const app = new Hono();

// Security headers - important for production
app.use(secureHeaders());

app.use(logger());
app.use('*', async (c, next) => {
  const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3001';
  const origins = corsOrigin.split(',');

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
    // Use environment variable for database connection
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error('No database connection string available');
    }

    await checkHealth(connectionString);
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
  port: process.env.PORT ? Number.parseInt(process.env.PORT) : 3000,
  hostname: process.env.HOSTNAME || '0.0.0.0',
};
