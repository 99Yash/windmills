// Development server entry point using Node.js
import { serve } from '@hono/node-server';
import app, { config } from './index';

serve(
  {
    fetch: app.fetch,
    port: config.port,
    hostname: config.hostname,
  },
  (info) => {
    console.log(`🚀 Server is running on http://${info.address}:${info.port}`);
    console.log(`📊 Health check: http://${info.address}:${info.port}/health`);
    console.log(
      `🔐 Auth endpoints: http://${info.address}:${info.port}/api/auth/*`
    );
    console.log(
      `🔌 tRPC endpoints: http://${info.address}:${info.port}/trpc/*`
    );
  }
);
