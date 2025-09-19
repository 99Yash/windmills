import { trpcServer } from '@hono/trpc-server';
import 'dotenv/config';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { createDb } from './db';
import { auth, createAuth } from './lib/auth';
import { createContext } from './lib/context';
import { appRouter } from './routers/index';
import { checkHealth } from './utils/health';

// Define the Cloudflare Worker environment bindings
type Bindings = {
  HYPERDRIVE: {
    connectionString: string;
  };
  DATABASE_URL?: string;
  AUTH_SECRET?: string;
  CORS_ORIGIN?: string;
  NODE_ENV?: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// Security headers - important for production
app.use(secureHeaders());

app.use(logger());
app.use('*', async (c, next) => {
  const corsOrigin =
    c.env.CORS_ORIGIN || process.env.CORS_ORIGIN || 'http://localhost:3001';
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

app.on(['POST', 'GET'], '/api/auth/*', async (c) => {
  // In Cloudflare Workers, create auth with Hyperdrive connection
  if (c.env.HYPERDRIVE) {
    const db = createDb(c.env.HYPERDRIVE.connectionString);

    // Create auth configuration with Cloudflare Workers environment variables
    const authConfig = {
      database: db,
      secret: c.env.AUTH_SECRET || 'fallback-secret-for-development',
      trustedOrigins: [c.env.CORS_ORIGIN || 'http://localhost:3001'],
      nodeEnv: c.env.NODE_ENV || 'production',
    };

    const authInstance = createAuth(db);
    return authInstance.handler(c.req.raw);
  }

  // Fallback to local auth for development
  if (auth) {
    return auth.handler(c.req.raw);
  }

  throw new Error('No database connection available for authentication');
});

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
    // Pass the Hyperdrive connection to the health check
    const connectionString =
      c.env.HYPERDRIVE?.connectionString ||
      c.env.DATABASE_URL ||
      process.env.DATABASE_URL;

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

// Export using Midday's pattern - works for both Cloudflare Workers and Node.js
export default {
  port: process.env.PORT ? Number.parseInt(process.env.PORT) : 3000,
  fetch: app.fetch,
  hostname: process.env.HOSTNAME || '0.0.0.0',
};
