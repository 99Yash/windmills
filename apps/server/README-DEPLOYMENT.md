# Cloudflare Workers Deployment Guide

## Prerequisites

1. **Cloudflare Account**: Sign up at [cloudflare.com](https://cloudflare.com)
2. **Wrangler CLI**: Already included in devDependencies
3. **Compatible Database**: Use Neon, Supabase, PlanetScale, or other HTTP-compatible PostgreSQL

## Setup Steps

### 1. Install Dependencies

```bash
cd apps/server
pnpm install
```

### 2. Database Setup

**Recommended Database Providers for Cloudflare Workers:**

- [Neon](https://neon.tech) - Serverless PostgreSQL
- [Supabase](https://supabase.com) - PostgreSQL with HTTP API
- [PlanetScale](https://planetscale.com) - MySQL (requires adapter change)

Create your database and get the connection string.

### 3. Environment Variables

#### For Local Development:

1. Copy the `.dev.vars` file and update values:

```bash
cp .dev.vars.example .dev.vars
```

2. Update `.dev.vars` with your actual values:

```env
DATABASE_URL=postgresql://user:password@host/database
CORS_ORIGIN=http://localhost:3001
AUTH_SECRET=your-secure-random-string
```

#### For Production:

Set secrets using Wrangler CLI:

```bash
# Required secrets
wrangler secret put DATABASE_URL
wrangler secret put AUTH_SECRET

# Optional but recommended
wrangler secret put CORS_ORIGIN
```

### 4. Authentication with Cloudflare

```bash
wrangler login
```

### 5. Development

```bash
# Local development with Cloudflare Workers environment
pnpm run dev:cf

# Traditional Node.js development (if needed)
pnpm run dev
```

### 6. Deployment

```bash
# Deploy to production
pnpm run deploy

# Deploy to staging (if configured)
pnpm run deploy:staging
```

## Configuration Notes

### Database Compatibility

- **Changed from `pg` to `postgres-js`**: Better edge runtime compatibility
- **Disabled prepared statements**: Required for some edge databases
- **HTTP connections**: Works with serverless databases

### CORS Configuration

Update `wrangler.toml` routes section for your domain:

```toml
[[routes]]
pattern = "api.yourdomain.com/*"
zone_name = "yourdomain.com"
```

### Environment-Specific Configuration

Add to `wrangler.toml` for multiple environments:

```toml
[env.staging]
name = "windmills-server-staging"
vars = { CORS_ORIGIN = "https://staging.yourdomain.com" }

[env.production]
name = "windmills-server-production"
vars = { CORS_ORIGIN = "https://yourdomain.com" }
```

## Troubleshooting

### Common Issues:

1. **Database Connection Errors**:

   - Ensure your database provider supports HTTP connections
   - Check if the connection string includes proper SSL settings
   - Verify firewall/access settings

2. **CORS Issues**:

   - Set `CORS_ORIGIN` to your frontend domain
   - For development, use `http://localhost:3001`
   - For production, use your actual domain

3. **Authentication Issues**:
   - Ensure `AUTH_SECRET` is set and secure
   - Check `trustedOrigins` in auth configuration

### Database Migration:

```bash
# Generate migration files
pnpm run db:generate

# Apply migrations (run locally against your cloud database)
pnpm run db:push
```

## Monitoring

- **Logs**: View in Cloudflare Dashboard or use `wrangler tail`
- **Analytics**: Available in Cloudflare Workers dashboard
- **Errors**: Check Workers dashboard for runtime errors

## Next Steps

1. Set up your database with a compatible provider
2. Configure domain routing
3. Set up CI/CD with GitHub Actions (optional)
4. Configure monitoring and alerting
