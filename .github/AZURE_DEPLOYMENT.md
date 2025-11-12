# Azure Deployment Setup

This document explains how to configure GitHub Secrets for automatic deployment to Azure.

## Required GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret

### 1. Azure Container Registry (ACR) Credentials

**ACR_USERNAME**
```
<your-acr-username>
```

**ACR_PASSWORD**
```
<your-acr-password>
```

### 2. Azure Web App Publish Profile

**SECRET_NEBULAML**

Download this from Azure Portal:
1. Go to your Web App (NebulaML)
2. Click "Get publish profile"
3. Copy the entire XML content
4. Paste it as a GitHub Secret

### 3. Application Environment Variables

These should be configured in Azure Portal → Web App → Configuration → Application settings:

**DATABASE_URL**
```
postgresql://username:password@server.postgres.database.azure.com:5432/database_name
```

**AUTH_SECRET**
```
<generate-with: openssl rand -base64 32>
```

**AUTH_GOOGLE_ID**
```
<your-google-oauth-client-id>
```

**AUTH_GOOGLE_SECRET**
```
<your-google-oauth-client-secret>
```

**NEXTAUTH_URL**
```
https://your-app-name.azurewebsites.net
```

**NEXT_PUBLIC_API_URL** (Optional GitHub Secret for build-time)
```
https://your-app-name.azurewebsites.net/api
```

## Azure Web App Configuration

### Required Settings in Azure Portal

1. **Container Settings**
   - Go to: Deployment Center
   - Source: Container Registry
   - Registry: your-registry.azurecr.io
   - Enable: Continuous Deployment

2. **Multi-Container Configuration**
   - Configuration source: Docker Compose
   - Config type: Configuration file

3. **Port Configuration**
   - WEBSITES_PORT: 3000 (frontend port)

## Deployment Process

### Automatic Deployment
Every push to the `main` branch will trigger:
1. Build backend and frontend Docker images
2. Push images to Azure Container Registry
3. Deploy to Azure Web App

### Manual Deployment
1. Go to GitHub repository → Actions
2. Select "Deploy Nebula to Azure" workflow
3. Click "Run workflow"
4. Select branch and run

## Database Setup

### PostgreSQL on Azure

Create an Azure Database for PostgreSQL flexible server:

```bash
# Create resource group (if not exists)
az group create --name nebula-resources --location canadacentral

# Create PostgreSQL server
az postgres flexible-server create \
  --resource-group nebula-resources \
  --name nebula-postgres-server \
  --location canadacentral \
  --admin-user your_admin_user \
  --admin-password 'YourSecurePassword123!' \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --version 15

# Create database
az postgres flexible-server db create \
  --resource-group nebula-resources \
  --server-name nebula-postgres-server \
  --database-name your_database_name

# Configure firewall (allow Azure services)
az postgres flexible-server firewall-rule create \
  --resource-group nebula-resources \
  --name nebula-postgres-server \
  --rule-name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0
```

## Monitoring

### View Logs
```bash
# Stream logs from Azure
az webapp log tail --name YourAppName --resource-group your-resource-group
```

### Check Container Status
```bash
# Check container logs
az webapp log download --name YourAppName --resource-group your-resource-group
```

## Troubleshooting

### Common Issues

1. **Images not found in ACR**
   - Verify ACR credentials in GitHub Secrets
   - Check workflow logs for build errors

2. **Container fails to start**
   - Check environment variables in Azure Web App
   - Verify port configuration (WEBSITES_PORT)

3. **Database connection fails**
   - Verify DATABASE_URL in Azure Web App configuration
   - Check PostgreSQL firewall rules
   - Ensure SSL mode is configured correctly

4. **OAuth not working**
   - Update Google OAuth redirect URIs to include Azure domain
   - Verify AUTH_SECRET matches between containers

## Security Notes

- **NEVER commit secrets to the repository**
- Store all credentials in GitHub Secrets
- Use Azure Key Vault for production secrets
- Enable Azure Web App managed identity when possible
- Review and update OAuth callback URLs after deployment
- Rotate credentials regularly

## Resources

- [Azure Container Registry](https://portal.azure.com/)
- [Azure Web Apps](https://portal.azure.com/)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
