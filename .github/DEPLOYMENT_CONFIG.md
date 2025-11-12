# Configuración de Deployment para Nebula

## 🎯 URLs de los Servicios

- **Backend:** https://nebulabackend.azurewebsites.net
- **Frontend:** https://nebulafrontend.azurewebsites.net

## 🔐 GitHub Secrets Requeridos

Ve a: `https://github.com/daniherreraa/nebula-image/settings/secrets/actions`

### Secrets para ACR (Container Registry)
Estos ya deberían estar configurados:
- ✅ `ACR_USERNAME`: `nebulacanadaacr`
- ✅ `ACR_PASSWORD`: (contraseña del ACR)

### Secrets para Deployment (NUEVOS - necesarios)
Tu compañero de Azure necesita obtener estos:

**SECRET_NEBULA_BACKEND**
```
Obtener desde Azure Portal:
1. Ve a: nebulabackend Web App
2. Click en "Get publish profile"
3. Copia todo el contenido XML
4. Pégalo en este secret
```

**SECRET_NEBULA_FRONTEND**
```
Obtener desde Azure Portal:
1. Ve a: nebulafrontend Web App
2. Click en "Get publish profile"
3. Copia todo el contenido XML
4. Pégalo en este secret
```

## ⚙️ Variables de Entorno en Azure

### Backend (nebulabackend)
Ir a: Azure Portal → nebulabackend → Configuration → Application settings

Agregar estas variables:

```bash
# Base de Datos
DATABASE_URL=postgresql://usuario:password@server.postgres.database.azure.com:5432/database_name

# Autenticación (debe ser el mismo que en frontend)
AUTH_SECRET=p/7r4lPQYn3+rfx4RBFdw0W013NOUtYhz9bthGUm4x4=

# Puerto (ya debería estar configurado)
PORT=8000
HOST=0.0.0.0
```

### Frontend (nebulafrontend)
Ir a: Azure Portal → nebulafrontend → Configuration → Application settings

Agregar estas variables:

```bash
# URL del Backend (IMPORTANTE - apuntar al backend de Azure)
NEXT_PUBLIC_API_URL=https://nebulabackend.azurewebsites.net

# URL del Frontend (para NextAuth)
NEXTAUTH_URL=https://nebulafrontend.azurewebsites.net

# Autenticación (debe ser el MISMO que en backend)
AUTH_SECRET=p/7r4lPQYn3+rfx4RBFdw0W013NOUtYhz9bthGUm4x4=

# Google OAuth
AUTH_GOOGLE_ID=1014675173340-mc6gq7vsqui0ms4otfqepi2meojjuips.apps.googleusercontent.com
AUTH_GOOGLE_SECRET=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

# Otros
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

## 🔧 Configuración de Google OAuth

Necesitas actualizar las URLs autorizadas en Google Cloud Console:

1. Ve a: https://console.cloud.google.com/apis/credentials
2. Selecciona tu OAuth Client ID
3. En "Authorized redirect URIs", agrega:
   ```
   https://nebulafrontend.azurewebsites.net/api/auth/callback/google
   ```
4. Guarda los cambios

## 📦 Cómo Funciona el Workflow

Cuando hagas push a `main`:

1. ✅ Build de imagen Backend → Push a ACR
2. ✅ Build de imagen Frontend → Push a ACR
3. ✅ Deploy Backend a `nebulabackend` Web App
4. ✅ Deploy Frontend a `nebulafrontend` Web App

## ✅ Checklist de Configuración

Antes de hacer el primer deployment:

### En GitHub (tú o tu compañero)
- [ ] `ACR_USERNAME` configurado
- [ ] `ACR_PASSWORD` configurado
- [ ] `SECRET_NEBULA_BACKEND` configurado (nuevo)
- [ ] `SECRET_NEBULA_FRONTEND` configurado (nuevo)

### En Azure Backend (tu compañero)
- [ ] `DATABASE_URL` configurado
- [ ] `AUTH_SECRET` configurado
- [ ] Puerto configurado (8000)

### En Azure Frontend (tu compañero)
- [ ] `NEXT_PUBLIC_API_URL` = https://nebulabackend.azurewebsites.net
- [ ] `NEXTAUTH_URL` = https://nebulafrontend.azurewebsites.net
- [ ] `AUTH_SECRET` configurado (mismo que backend)
- [ ] `AUTH_GOOGLE_ID` configurado
- [ ] `AUTH_GOOGLE_SECRET` configurado

### En Google Cloud Console
- [ ] Redirect URI actualizado con la URL de Azure

## 🚀 Primer Deployment

Una vez configurado todo:

1. Merge estos cambios a `main`
2. El workflow se ejecutará automáticamente
3. O ejecuta manualmente desde: Actions → Deploy Nebula to Azure → Run workflow

## 🐛 Troubleshooting

### Si el frontend no puede conectarse al backend:
- Verifica que `NEXT_PUBLIC_API_URL` en frontend apunte a `https://nebulabackend.azurewebsites.net`
- Verifica que el backend esté respondiendo en `/health`

### Si OAuth falla:
- Verifica que `NEXTAUTH_URL` sea correcto
- Verifica que `AUTH_SECRET` sea el MISMO en frontend y backend
- Verifica redirect URIs en Google Cloud Console

### Si el deployment falla:
- Verifica que los secrets `SECRET_NEBULA_BACKEND` y `SECRET_NEBULA_FRONTEND` estén configurados
- Verifica que los nombres de las Web Apps sean correctos: `nebulabackend` y `nebulafrontend`
