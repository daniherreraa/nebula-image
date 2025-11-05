# 🐳 Docker Deployment Guide - Nebula 360

Esta guía explica cómo deployar Nebula 360 usando Docker, tanto standalone como parte de un sistema más grande.

## 📋 Tabla de Contenidos

- [Requisitos Previos](#requisitos-previos)
- [Variables de Entorno](#variables-de-entorno)
- [Deployment Standalone](#deployment-standalone)
- [Integración con Docker Compose](#integración-con-docker-compose)
- [Configuración de Producción](#configuración-de-producción)
- [Troubleshooting](#troubleshooting)

---

## Requisitos Previos

- Docker >= 20.10
- Docker Compose >= 2.0 (opcional, para multi-container)
- pnpm >= 8.0 (solo para desarrollo local)
- Node.js 22 (solo para desarrollo local)

---

## Variables de Entorno

Crea un archivo `.env.production` en la raíz del proyecto:

```bash
# Auth.js Configuration
# IMPORTANT: Do NOT use quotes around values in .env files
AUTH_SECRET=your-secret-here-generate-with-openssl-rand-base64-32
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret
AUTH_TRUST_HOST=true
NEXTAUTH_URL=https://your-production-domain.com

# Optional: API Backend URL
NEXT_PUBLIC_API_URL=http://backend:8000
```

### Generar AUTH_SECRET

```bash
openssl rand -base64 32
```

### Google OAuth Setup

1. Ve a [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Crea credenciales OAuth 2.0
3. Agrega las URIs autorizadas:
   - **Desarrollo**: `http://localhost:3000/api/auth/callback/google`
   - **Producción**: `https://your-domain.com/api/auth/callback/google`

---

## Deployment Standalone

### 1. Build de la imagen

```bash
docker build -t nebula360-frontend:latest .
```

### 2. Run del container

```bash
docker run -d \
  --name nebula360 \
  -p 3000:3000 \
  --env-file .env.production \
  nebula360-frontend:latest
```

### 3. Verificar health

```bash
curl http://localhost:3000/api/health
```

Deberías ver:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-15T...",
  "service": "nebula360-frontend",
  "uptime": 42.5
}
```

---

## Integración con Docker Compose

### Setup Básico

1. Copia el archivo de ejemplo:
```bash
cp docker-compose.example.yml docker-compose.yml
```

2. Edita las variables de entorno en `docker-compose.yml` o crea un `.env`

3. Levanta los servicios:
```bash
docker-compose up -d
```

### Integración en Sistema Mayor

Si Nebula 360 será parte de un sistema más grande, puedes integrarlo así:

```yaml
# docker-compose.yml (en tu repo principal)
version: '3.8'

services:
  # Nebula 360 Frontend
  frontend:
    build:
      context: ./nebula360  # Path al repo de Nebula
      dockerfile: Dockerfile
    container_name: nebula360-frontend
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - AUTH_SECRET=${AUTH_SECRET}
      - AUTH_GOOGLE_ID=${AUTH_GOOGLE_ID}
      - AUTH_GOOGLE_SECRET=${AUTH_GOOGLE_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
      - NEXT_PUBLIC_API_URL=http://backend:8000
    networks:
      - app-network
    depends_on:
      - backend

  # Tu Backend API
  backend:
    image: your-backend:latest
    # ... resto de configuración

networks:
  app-network:
    driver: bridge
```

---

## Configuración de Producción

### Nginx Reverse Proxy (Recomendado)

```nginx
# /etc/nginx/sites-available/nebula360
server {
    listen 80;
    server_name your-domain.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL Configuration
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Proxy to Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Docker Compose con Nginx

Agrega Nginx a tu `docker-compose.yml`:

```yaml
services:
  nginx:
    image: nginx:alpine
    container_name: nebula360-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certs:/etc/nginx/certs:ro
    networks:
      - nebula-network
    depends_on:
      - frontend
```

---

## Comandos Útiles

### Ver logs
```bash
docker logs -f nebula360
# o con compose
docker-compose logs -f frontend
```

### Reiniciar container
```bash
docker restart nebula360
# o con compose
docker-compose restart frontend
```

### Rebuild y restart
```bash
docker-compose up -d --build frontend
```

### Detener todo
```bash
docker-compose down
# o para eliminar volúmenes también
docker-compose down -v
```

### Inspeccionar container
```bash
docker exec -it nebula360 sh
```

---

## Troubleshooting

### Error: "Cannot find module"
- Asegúrate de que `output: 'standalone'` esté en `next.config.ts`
- Rebuild la imagen: `docker-compose build --no-cache frontend`

### Error: Auth no funciona
- Verifica que `NEXTAUTH_URL` coincida con tu dominio real
- En producción usa HTTPS
- Verifica que las credenciales de Google estén correctas

### Error: Health check failing
- Verifica que el puerto 3000 esté expuesto
- Revisa logs: `docker logs nebula360`
- Prueba el endpoint: `curl http://localhost:3000/api/health`

### Performance lento
- Asegúrate de estar usando `NODE_ENV=production`
- Verifica que el build esté optimizado
- Considera agregar Redis para caché

### Container se detiene inmediatamente
- Revisa logs: `docker logs nebula360`
- Verifica variables de entorno
- Asegúrate de que todas las dependencias estén instaladas

---

## Arquitectura de Capas Docker

```
┌─────────────────────────────────────┐
│     Stage 1: Dependencies           │
│  - Instala solo node_modules        │
│  - Usa pnpm (más eficiente)         │
│  - Frozen lockfile (reproducible)   │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│     Stage 2: Builder                │
│  - Copia código fuente              │
│  - Ejecuta build de Next.js         │
│  - Genera .next/standalone          │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│     Stage 3: Runner (Final)         │
│  - Solo archivos necesarios         │
│  - Usuario no-root (seguridad)      │
│  - Health check incluido            │
│  - Imagen final ~240MB              │
└─────────────────────────────────────┘
```

---

## Seguridad

- ✅ Usuario no-root (nextjs:nodejs)
- ✅ Multi-stage build (imagen mínima)
- ✅ .dockerignore (excluye archivos sensibles)
- ✅ Health check (monitoring)
- ✅ Variables de entorno (no hardcodeadas)

---

## Next Steps

Cuando integres con backend:

1. Agrega el servicio de backend a `docker-compose.yml`
2. Conecta ambos servicios a la misma network
3. Actualiza `NEXT_PUBLIC_API_URL` para apuntar al backend
4. Considera agregar Redis para sesiones compartidas
5. Implementa logging centralizado (ELK stack, etc.)

---

## Soporte

Para issues relacionados con Docker, revisa:
- [Next.js Docker Docs](https://nextjs.org/docs/deployment#docker-image)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
