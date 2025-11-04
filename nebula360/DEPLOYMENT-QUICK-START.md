# 🚀 Quick Start - Docker Deployment

Esta es la guía rápida para deployar Nebula 360 con Docker. Para más detalles, revisa [DOCKER.md](./DOCKER.md).

## ⚡ Setup Rápido (5 minutos)

### 1. Configurar variables de entorno

```bash
# Copiar template
cp .env.example .env.production

# Editar con tus credenciales
nano .env.production
```

**Mínimo requerido:**
```bash
# IMPORTANT: Do NOT use quotes around values!
AUTH_SECRET=$(openssl rand -base64 32)
AUTH_GOOGLE_ID=tu_google_client_id
AUTH_GOOGLE_SECRET=tu_google_client_secret
AUTH_TRUST_HOST=true
NEXTAUTH_URL=http://localhost:3000
```

### 2. Build & Run

#### Opción A: Script automatizado (Recomendado)
```bash
# Build imagen
./docker-build.sh latest build

# Ejecutar container
./docker-build.sh latest run

# Ver logs
./docker-build.sh latest logs
```

#### Opción B: Docker comandos directos
```bash
# Build
docker build -t nebula360-frontend:latest .

# Run
docker run -d \
  --name nebula360 \
  -p 3000:3000 \
  --env-file .env.production \
  nebula360-frontend:latest
```

#### Opción C: Docker Compose
```bash
# Setup
cp docker-compose.example.yml docker-compose.yml

# Editar docker-compose.yml con tus valores

# Run
docker-compose up -d

# Logs
docker-compose logs -f frontend
```

### 3. Verificar

```bash
# Health check
curl http://localhost:3000/api/health

# Abrir en navegador
open http://localhost:3000
```

---

## 🔧 Comandos Útiles

### Script Helper
```bash
./docker-build.sh latest build    # Build imagen
./docker-build.sh latest run      # Ejecutar
./docker-build.sh latest stop     # Detener
./docker-build.sh latest restart  # Reiniciar
./docker-build.sh latest logs     # Ver logs
./docker-build.sh latest clean    # Limpiar todo
```

### Docker Directo
```bash
docker ps                          # Ver containers corriendo
docker logs -f nebula360           # Ver logs en tiempo real
docker restart nebula360           # Reiniciar
docker stop nebula360              # Detener
docker rm nebula360                # Remover container
```

### Docker Compose
```bash
docker-compose up -d               # Iniciar en background
docker-compose down                # Detener y remover
docker-compose logs -f frontend    # Ver logs
docker-compose restart frontend    # Reiniciar servicio
docker-compose build --no-cache    # Rebuild sin caché
```

---

## 🌐 Integración en Sistema Mayor

Si Nebula 360 será parte de un docker-compose más grande:

### 1. Como submódulo Git
```bash
# En tu repo principal
git submodule add https://github.com/tu-org/nebula360.git frontend
```

### 2. En tu docker-compose.yml principal
```yaml
services:
  frontend:
    build:
      context: ./frontend  # Path al submódulo
      dockerfile: Dockerfile
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

  # Tu backend aquí
  backend:
    # ...

networks:
  app-network:
```

---

## 🔒 Google OAuth Setup

1. **Ir a**: https://console.cloud.google.com/apis/credentials
2. **Crear OAuth 2.0 Client ID**
3. **Authorized redirect URIs** (agregar ambos):
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://tu-dominio.com/api/auth/callback/google`
4. **Copiar** Client ID y Client Secret a `.env.production`

---

## 📊 Health Check

El container incluye un health check automático cada 30 segundos:

```bash
# Ver estado
docker inspect nebula360 | grep -A 10 Health

# Test manual
curl http://localhost:3000/api/health
```

Respuesta esperada:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-15T...",
  "service": "nebula360-frontend",
  "uptime": 42.5
}
```

---

## 🐛 Troubleshooting Rápido

### Container se detiene inmediatamente
```bash
# Ver logs
docker logs nebula360

# Verificar que .env.production existe
ls -la .env.production

# Verificar variables
docker run --rm --env-file .env.production nebula360-frontend env | grep AUTH
```

### Auth no funciona
```bash
# Verificar NEXTAUTH_URL
echo $NEXTAUTH_URL

# Debe coincidir con la URL real
# Development: http://localhost:3000
# Production: https://tu-dominio.com
```

### Puerto 3000 ocupado
```bash
# Cambiar puerto en docker run
docker run -d -p 8080:3000 --name nebula360 ...

# O en docker-compose.yml
ports:
  - "8080:3000"
```

### Rebuild completo
```bash
# Con script
./docker-build.sh latest clean
./docker-build.sh latest build

# Manual
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

---

## 📁 Estructura de Archivos Docker

```
nebula360/
├── Dockerfile                    # Build de producción
├── .dockerignore                 # Archivos excluidos del build
├── docker-compose.example.yml    # Template compose
├── docker-build.sh               # Script helper
├── .env.example                  # Template variables
├── .env.production              # TUS variables (crear)
├── DOCKER.md                    # Documentación completa
└── DEPLOYMENT-QUICK-START.md    # Esta guía
```

---

## ✅ Checklist Pre-Deploy

- [ ] `.env.production` creado con valores reales
- [ ] `AUTH_SECRET` generado con openssl
- [ ] Google OAuth configurado
- [ ] Redirect URIs agregadas en Google Console
- [ ] Docker instalado (>= 20.10)
- [ ] Puerto 3000 disponible (o configurado otro)
- [ ] `next.config.ts` tiene `output: 'standalone'`

---

## 📚 Recursos

- [DOCKER.md](./DOCKER.md) - Documentación completa
- [Next.js Docker](https://nextjs.org/docs/deployment#docker-image)
- [Auth.js Setup](https://authjs.dev/getting-started/introduction)
- [Google OAuth](https://console.cloud.google.com/apis/credentials)

---

## 🆘 Soporte

Si tienes problemas:
1. Revisa los logs: `docker logs nebula360`
2. Verifica health: `curl localhost:3000/api/health`
3. Consulta [DOCKER.md](./DOCKER.md) para troubleshooting detallado
