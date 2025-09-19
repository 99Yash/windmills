# Environment Variables Reference

This document lists all environment variables used in the Windmills server application.

## 🔐 Required Secrets (Production)

Set these using `wrangler secret put <KEY>` for production deployment:

| Variable       | Description                            | Example                                                 |
| -------------- | -------------------------------------- | ------------------------------------------------------- |
| `DATABASE_URL` | PostgreSQL connection string           | `postgresql://user:pass@host:5432/db`                   |
| `AUTH_SECRET`  | Better Auth JWT signing secret         | Generate: `openssl rand -base64 32`                     |
| `CORS_ORIGIN`  | Allowed CORS origins (comma-separated) | `https://yourdomain.com,https://staging.yourdomain.com` |

## ⚙️ Server Configuration

| Variable   | Description      | Default       | Required |
| ---------- | ---------------- | ------------- | -------- |
| `NODE_ENV` | Environment mode | `development` | No       |
| `PORT`     | Server port      | `3000`        | No       |
| `HOSTNAME` | Server hostname  | `0.0.0.0`     | No       |

## 🔒 Auth & Security (Optional)

| Variable          | Description                 | Usage                      |
| ----------------- | --------------------------- | -------------------------- |
| `JWT_SECRET`      | Custom JWT secret           | If using custom JWT logic  |
| `TRUSTED_ORIGINS` | Better Auth trusted origins | Alternative to CORS_ORIGIN |

## 📧 Email Configuration (Optional)

Enable if using email authentication:

| Variable     | Description                | Example                  |
| ------------ | -------------------------- | ------------------------ |
| `SMTP_HOST`  | SMTP server host           | `smtp.gmail.com`         |
| `SMTP_PORT`  | SMTP server port           | `587`                    |
| `SMTP_USER`  | SMTP username              | `your-email@gmail.com`   |
| `SMTP_PASS`  | SMTP password/app password | `your-app-password`      |
| `EMAIL_FROM` | From email address         | `noreply@yourdomain.com` |

## 🔑 OAuth Providers (Optional)

### Google OAuth

| Variable               | Description                |
| ---------------------- | -------------------------- |
| `GOOGLE_CLIENT_ID`     | Google OAuth client ID     |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |

### GitHub OAuth

| Variable               | Description                |
| ---------------------- | -------------------------- |
| `GITHUB_CLIENT_ID`     | GitHub OAuth client ID     |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth client secret |

## 🚀 External Services (Optional)

Add your specific API keys and services:

| Variable             | Description        | Service         |
| -------------------- | ------------------ | --------------- |
| `OPENAI_API_KEY`     | OpenAI API key     | AI/LLM features |
| `STRIPE_SECRET_KEY`  | Stripe secret key  | Payments        |
| `UPLOADTHING_SECRET` | UploadThing secret | File uploads    |
| `RESEND_API_KEY`     | Resend API key     | Email delivery  |

## 📊 Monitoring & Analytics (Optional)

| Variable       | Description               | Service          |
| -------------- | ------------------------- | ---------------- |
| `SENTRY_DSN`   | Sentry error tracking DSN | Error monitoring |
| `ANALYTICS_ID` | Analytics service ID      | Usage tracking   |

## 🛠️ Setup Instructions

### For Local Development:

1. Copy `.dev.vars` to `.dev.vars.local`
2. Update values in `.dev.vars.local`
3. Run `pnpm run dev` or `pnpm run dev:cf`

### For Production:

```bash
# Required secrets
wrangler secret put DATABASE_URL
wrangler secret put AUTH_SECRET
wrangler secret put CORS_ORIGIN

# Optional secrets (as needed)
wrangler secret put SMTP_USER
wrangler secret put GOOGLE_CLIENT_SECRET
# ... etc
```

## 🔍 Usage in Code

Environment variables are accessed via `process.env`:

```typescript
// Database connection
const dbUrl = process.env.DATABASE_URL;

// Auth configuration
const authSecret = process.env.AUTH_SECRET;

// CORS origins
const corsOrigins = process.env.CORS_ORIGIN?.split(',') || [
  'http://localhost:3001',
];
```

## 📝 Adding New Variables

When adding new environment variables:

1. **Add to `.dev.vars`** - For local development
2. **Document in this file** - For team reference
3. **Add to `wrangler.toml` comments** - For production deployment
4. **Update code** - To use the new variables
5. **Set production secrets** - Using `wrangler secret put`
