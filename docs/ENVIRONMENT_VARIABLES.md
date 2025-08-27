# Environment Variables Reference

Dokumentasi lengkap untuk semua environment variables yang digunakan dalam CYS Fumadocs.

## 📋 Required Variables

### NextAuth Configuration

| Variable          | Type   | Required | Description                          | Example                    |
| ----------------- | ------ | -------- | ------------------------------------ | -------------------------- |
| `NEXTAUTH_SECRET` | string | ✅       | Secret key untuk NextAuth encryption | `your-secret-key-32-chars` |
| `NEXTAUTH_URL`    | string | ✅       | Base URL aplikasi                    | `http://localhost:3000`    |

### Telyus API Configuration

| Variable            | Type   | Required | Description                            | Example                    |
| ------------------- | ------ | -------- | -------------------------------------- | -------------------------- |
| `TELYUS_APPS_NAME`  | string | ✅       | Nama aplikasi yang terdaftar di Telyus | `CyberSec-Docs`            |
| `TELYUS_APPS_TOKEN` | string | ✅       | Token autentikasi dari Auth_API        | `your-token-from-auth-api` |

## 🔧 Optional Variables

### Azure AD Configuration (Hybrid Mode)

| Variable                 | Type   | Required | Description             | Example                                |
| ------------------------ | ------ | -------- | ----------------------- | -------------------------------------- |
| `AZURE_AD_CLIENT_ID`     | string | ⚪       | Azure AD Client ID      | `12345678-1234-1234-1234-123456789012` |
| `AZURE_AD_CLIENT_SECRET` | string | ⚪       | Azure AD Client Secret  | `your-azure-secret`                    |
| `AZURE_AD_TENANT_ID`     | string | ⚪       | Azure AD Tenant ID      | `87654321-4321-4321-4321-210987654321` |
| `ALLOWED_TENANT_ID`      | string | ⚪       | Allowed Azure Tenant ID | `87654321-4321-4321-4321-210987654321` |

### Database Configuration (Future Use)

| Variable       | Type   | Required | Description                | Example                                    |
| -------------- | ------ | -------- | -------------------------- | ------------------------------------------ |
| `DATABASE_URL` | string | ⚪       | Database connection string | `postgresql://user:pass@localhost:5432/db` |

### Performance & Debugging

| Variable      | Type   | Required | Description              | Default       | Example      |
| ------------- | ------ | -------- | ------------------------ | ------------- | ------------ |
| `API_TIMEOUT` | number | ⚪       | API request timeout (ms) | `30000`       | `45000`      |
| `LOG_LEVEL`   | string | ⚪       | Logging level            | `info`        | `debug`      |
| `NODE_ENV`    | string | ⚪       | Node environment         | `development` | `production` |

## 🚀 Environment-Specific Configurations

### Development (.env.local)

```env
NEXTAUTH_SECRET=dev-secret-key-32-characters-long
NEXTAUTH_URL=http://localhost:3000

TELYUS_APPS_NAME=CyberSec-Docs-Dev
TELYUS_APPS_TOKEN=dev-token-from-auth-api

NODE_ENV=development
LOG_LEVEL=debug
```

### Staging (.env.staging)

```env
NEXTAUTH_SECRET=staging-secret-key-32-characters-long
NEXTAUTH_URL=https://staging.yourdomain.com

TELYUS_APPS_NAME=CyberSec-Docs-Staging
TELYUS_APPS_TOKEN=staging-token-from-auth-api

NODE_ENV=production
LOG_LEVEL=info
```

### Production (.env.production)

```env
NEXTAUTH_SECRET=production-secret-key-32-characters-long
NEXTAUTH_URL=https://yourdomain.com

TELYUS_APPS_NAME=CyberSec-Docs
TELYUS_APPS_TOKEN=production-token-from-auth-api

NODE_ENV=production
LOG_LEVEL=warn

# Optional: Database for login logs persistence
DATABASE_URL=postgresql://user:pass@prod-db:5432/cysdocs
```

## 🔐 Security Best Practices

### Secret Generation

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Or use online generator
# https://generate-secret.vercel.app/32
```

### Environment File Security

```bash
# Ensure proper file permissions
chmod 600 .env.local

# Add to .gitignore
echo ".env.local" >> .gitignore
echo ".env.*.local" >> .gitignore
```

### Variable Validation

```typescript
// Add runtime validation in your app
function validateEnvVars() {
  const required = [
    "NEXTAUTH_SECRET",
    "NEXTAUTH_URL",
    "TELYUS_APPS_NAME",
    "TELYUS_APPS_TOKEN",
  ];

  for (const envVar of required) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }
}
```

## 📦 Docker Configuration

### Dockerfile Environment

```dockerfile
# Set environment variables in Dockerfile
ENV NODE_ENV=production
ENV NEXTAUTH_URL=https://yourdomain.com

# Use build args for sensitive data
ARG NEXTAUTH_SECRET
ARG TELYUS_APPS_NAME
ARG TELYUS_APPS_TOKEN

ENV NEXTAUTH_SECRET=$NEXTAUTH_SECRET
ENV TELYUS_APPS_NAME=$TELYUS_APPS_NAME
ENV TELYUS_APPS_TOKEN=$TELYUS_APPS_TOKEN
```

### Docker Compose

```yaml
version: "3.8"
services:
  app:
    build: .
    environment:
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
      - TELYUS_APPS_NAME=${TELYUS_APPS_NAME}
      - TELYUS_APPS_TOKEN=${TELYUS_APPS_TOKEN}
    env_file:
      - .env.production
```

## 🧪 Testing Configurations

### Test Environment

```env
# .env.test
NEXTAUTH_SECRET=test-secret-key-32-characters-long
NEXTAUTH_URL=http://localhost:3001

TELYUS_APPS_NAME=CyberSec-Docs-Test
TELYUS_APPS_TOKEN=test-token-from-auth-api

NODE_ENV=test
LOG_LEVEL=error
```

### Environment Variable Testing

```bash
# Test if all required vars are set
npm run test:env

# Or manually check
node -e "
const required = ['NEXTAUTH_SECRET', 'NEXTAUTH_URL', 'TELYUS_APPS_NAME', 'TELYUS_APPS_TOKEN'];
required.forEach(v => {
  if (!process.env[v]) console.error('Missing:', v);
  else console.log('✓', v);
});
"
```

## 🚨 Troubleshooting

### Common Issues

#### "Missing environment variable"

```bash
# Check if .env.local exists
ls -la .env.local

# Check if variables are loaded
node -e "console.log(process.env.TELYUS_APPS_NAME)"
```

#### "Cannot read environment variables"

```bash
# Restart development server
npm run dev

# Clear Next.js cache
rm -rf .next
npm run dev
```

#### "Environment variables not updating"

```bash
# Next.js only loads .env files on startup
# Restart the server after changes
^C  # Stop server
npm run dev  # Start again
```

### Variable Priority Order

1. `.env.local` (highest priority)
2. `.env.development` / `.env.production`
3. `.env`
4. System environment variables

## 📞 Getting Help

### For API Credentials:

- **Contact**: Tim Auth_API Telyus
- **Request**: AppsName dan AppsToken untuk aplikasi CyberSec Docs

### For Setup Issues:

- Check `SETUP.md` for quick setup guide
- Review `TELYUS_API_SETUP.md` for detailed API integration
- Verify environment file permissions and syntax

---

**Note**: Selalu restart development server setelah mengubah environment variables!
