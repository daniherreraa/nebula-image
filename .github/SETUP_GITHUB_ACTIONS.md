# 🚀 Configuración de GitHub Actions para Azure Deployment

Este documento explica cómo configurar el deployment automático a Azure usando GitHub Actions.

## ✅ Prerequisitos

- Acceso a Azure con permisos de Contributor
- Acceso de admin al repositorio de GitHub

## 📋 Paso 1: Crear Service Principal en Azure

Ejecuta estos comandos en Azure CLI para crear las credenciales que GitHub usará:

```bash
# 1. Obtener tu subscription ID
az account show --query id --output tsv

# 2. Crear service principal con permisos de Contributor
# Reemplaza YOUR_SUBSCRIPTION_ID con el ID del paso 1
az ad sp create-for-rbac \
  --name "github-actions-nebula" \
  --role contributor \
  --scopes /subscriptions/YOUR_SUBSCRIPTION_ID/resourceGroups/MisRecursos \
  --sdk-auth
```

Este comando generará un JSON como este:

```json
{
  "clientId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "clientSecret": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "subscriptionId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "tenantId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "activeDirectoryEndpointUrl": "https://login.microsoftonline.com",
  "resourceManagerEndpointUrl": "https://management.azure.com/",
  "activeDirectoryGraphResourceId": "https://graph.windows.net/",
  "sqlManagementEndpointUrl": "https://management.core.windows.net:8443/",
  "galleryEndpointUrl": "https://gallery.azure.com/",
  "managementEndpointUrl": "https://management.core.windows.net/"
}
```

**⚠️ IMPORTANTE:** Guarda todo este JSON, lo necesitarás en el siguiente paso.

## 📋 Paso 2: Configurar Secret en GitHub

1. Ve a tu repositorio en GitHub: https://github.com/daniherreraa/nebula-image

2. Click en **Settings** (Configuración)

3. En el menú izquierdo, click en **Secrets and variables** → **Actions**

4. Click en **New repository secret**

5. Crea un secret con:
   - **Name**: `AZURE_CREDENTIALS`
   - **Value**: Pega el JSON completo del Paso 1

6. Click en **Add secret**

## 📋 Paso 3: Dar permisos al Service Principal para el ACR

El service principal necesita acceso al Azure Container Registry:

```bash
# Obtener el ID del service principal
SP_APP_ID=$(az ad sp list --display-name "github-actions-nebula" --query "[0].appId" -o tsv)

# Dar permisos de push/pull al ACR
az role assignment create \
  --assignee $SP_APP_ID \
  --role AcrPush \
  --scope /subscriptions/YOUR_SUBSCRIPTION_ID/resourceGroups/MisRecursos/providers/Microsoft.ContainerRegistry/registries/nebulacanadaacr
```

## ✅ ¡Listo! Cómo funciona

Ahora cada vez que hagas `git push` a las ramas `main` o `danilab`:

1. 🏗️ GitHub Actions construirá las imágenes Docker
2. 📤 Las subirá a Azure Container Registry
3. 🔄 Actualizará los Web Apps
4. 🚀 Reiniciará los servicios

## 🎯 Ejecutar manualmente

También puedes ejecutar el workflow manualmente:

1. Ve a: https://github.com/daniherreraa/nebula-image/actions
2. Click en **Deploy to Azure**
3. Click en **Run workflow**
4. Selecciona la rama y click en **Run workflow**

## 📊 Ver el progreso

Durante el deployment puedes ver el progreso en:
https://github.com/daniherreraa/nebula-image/actions

Verás cada paso ejecutándose en tiempo real con logs completos.

## 🔍 Verificar el Deployment

Después de que el workflow complete:

1. **Frontend**: https://nebulafrontend.azurewebsites.net
2. **Backend**: https://nebulabackend.azurewebsites.net/docs

⏰ Espera 2-3 minutos para que los contenedores se inicien completamente.

## 🐛 Troubleshooting

### Error: "Azure Login failed"
- Verifica que el secret `AZURE_CREDENTIALS` esté configurado correctamente
- Asegúrate de que el JSON esté completo y sin errores

### Error: "ACR login failed"
- Ejecuta el Paso 3 para dar permisos al service principal

### Error: "Web App update failed"
- Verifica que el service principal tenga rol de Contributor en el resource group

## 📚 Referencias

- [GitHub Actions for Azure](https://github.com/Azure/actions)
- [Azure Service Principal](https://docs.microsoft.com/en-us/cli/azure/create-an-azure-service-principal-azure-cli)
- [Azure Container Registry](https://docs.microsoft.com/en-us/azure/container-registry/)
