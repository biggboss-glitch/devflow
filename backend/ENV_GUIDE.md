# Environment Variables Guide

## Quick Start

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Fill in the required values:**
   - Database credentials
   - JWT secrets (generate strong secrets!)
   - Frontend URL

3. **Validate your configuration:**
   ```bash
   npm run validate-env
   ```

## Generating Secure Secrets

### JWT Secrets

Generate secure JWT secrets using OpenSSL:

```bash
# Generate JWT_SECRET (64 characters)
openssl rand -base64 64

# Generate JWT_REFRESH_SECRET (64 characters, different from JWT_SECRET)
openssl rand -base64 64
```

### Database Password

Generate a strong database password:

```bash
# Generate secure password (32 characters)
openssl rand -base64 32
```

## Environment-Specific Configurations

### Development

```env
NODE_ENV=development
LOG_LEVEL=debug
SWAGGER_ENABLED=true
DB_SSL_ENABLED=false
TRUST_PROXY=false
```

### Staging

```env
NODE_ENV=staging
LOG_LEVEL=info
SWAGGER_ENABLED=true
DB_SSL_ENABLED=true
TRUST_PROXY=true
```

### Production

```env
NODE_ENV=production
LOG_LEVEL=info
SWAGGER_ENABLED=false
DB_SSL_ENABLED=true
TRUST_PROXY=true
```

## Required Variables

These variables **must** be set:

- `NODE_ENV` - Environment name
- `PORT` - Server port
- `DB_HOST` - Database host
- `DB_PORT` - Database port
- `DB_NAME` - Database name
- `DB_USER` - Database user
- `DB_PASSWORD` - Database password (min 8 chars)
- `JWT_SECRET` - JWT secret (min 32 chars)
- `JWT_REFRESH_SECRET` - JWT refresh secret (min 32 chars)
- `FRONTEND_URL` - Frontend URL for CORS

## Optional Variables

These have sensible defaults but can be customized:

- `APP_NAME` - Application name (default: devflow-backend)
- `APP_VERSION` - Application version (default: 1.0.0)
- `JWT_EXPIRES_IN` - JWT expiration (default: 7d)
- `JWT_REFRESH_EXPIRES_IN` - Refresh token expiration (default: 30d)
- `RATE_LIMIT_WINDOW_MS` - Rate limit window (default: 900000 = 15 min)
- `RATE_LIMIT_MAX_REQUESTS` - Max requests per window (default: 100)
- `LOG_LEVEL` - Log level (default: info)
- `GITHUB_TOKEN` - GitHub API token (optional)

## Production Checklist

Before deploying to production, verify:

- [ ] `NODE_ENV=production`
- [ ] `JWT_SECRET` is at least 32 characters and unique
- [ ] `JWT_REFRESH_SECRET` is at least 32 characters and different from `JWT_SECRET`
- [ ] `DB_PASSWORD` is strong (12+ characters)
- [ ] `DB_SSL_ENABLED=true`
- [ ] `FRONTEND_URL` points to your production domain (not localhost)
- [ ] `TRUST_PROXY=true` if behind reverse proxy
- [ ] `SWAGGER_ENABLED=false`
- [ ] `LOG_LEVEL=info` or `warn`
- [ ] All secrets are stored securely (not in code)
- [ ] Rate limiting is configured appropriately

## Validation

The environment configuration is automatically validated on startup using Zod schemas. Invalid configurations will prevent the server from starting.

You can also manually validate:

```bash
npm run validate-env
```

## Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use strong, unique secrets** for each environment
3. **Rotate secrets regularly** (especially after security incidents)
4. **Use different secrets** for development, staging, and production
5. **Store production secrets** in secure secret management systems (AWS Secrets Manager, HashiCorp Vault, etc.)
6. **Limit access** to production environment variables
7. **Use SSL/TLS** for database connections in production
8. **Enable rate limiting** to prevent abuse
9. **Monitor and log** access to sensitive endpoints
10. **Review and audit** environment variables regularly

## Troubleshooting

### "JWT_SECRET must be at least 32 characters"

Generate a new secret:
```bash
openssl rand -base64 64
```

### "DB_PASSWORD appears to be a placeholder"

Replace placeholder values with actual secure passwords.

### "FRONTEND_URL should not point to localhost in production"

Update `FRONTEND_URL` to your production domain:
```env
FRONTEND_URL=https://yourdomain.com
```

### Database connection errors

1. Verify database is running
2. Check database credentials
3. Ensure database exists
4. Check network connectivity
5. Verify SSL settings if using remote database

## Additional Resources

- [12-Factor App: Config](https://12factor.net/config)
- [OWASP: Secrets Management](https://owasp.org/www-community/vulnerabilities/Insecure_Storage_of_Sensitive_Information)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

