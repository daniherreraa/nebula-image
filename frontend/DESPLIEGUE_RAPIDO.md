# 🚀 Despliegue Rápido - Nebula 360 Frontend

## Para ti (Desarrollo Local con Docker)

### Paso 1: Preparar el entorno
```bash
# Asegúrate de estar en el directorio del proyecto
cd /home/dani/Documentos/apps/nebula360

# Verifica que tienes el archivo .env.production
ls -la .env.production
```

### Paso 2: Build de la imagen Docker
```bash
# Opción A: Usar el script automatizado (recomendado)
chmod +x docker-build.sh
./docker-build.sh

# Opción B: Build manual
docker build -t nebula360-frontend:latest .
```

### Paso 3: Ejecutar el contenedor
```bash
# Detener y eliminar contenedor anterior si existe
docker stop nebula360 2>/dev/null || true
docker rm nebula360 2>/dev/null || true

# Ejecutar el nuevo contenedor
docker run -d \
  --name nebula360 \
  -p 3000:3000 \
  --env-file .env.production \
  nebula360-frontend:latest
```

### Paso 4: Verificar que está funcionando
```bash
# Ver logs en tiempo real
docker logs -f nebula360

# Verificar health (en otra terminal)
curl http://localhost:3000/api/health
```

### Paso 5: Ver la aplicación
Abre tu navegador en: **http://localhost:3000**

### Comandos útiles durante desarrollo:

```bash
# Ver logs
docker logs nebula360

# Ver logs en tiempo real
docker logs -f nebula360

# Reiniciar el contenedor
docker restart nebula360

# Detener el contenedor
docker stop nebula360

# Eliminar el contenedor
docker rm nebula360

# Rebuild completo (si cambias código)
docker stop nebula360 && docker rm nebula360
./docker-build.sh
docker run -d --name nebula360 -p 3000:3000 --env-file .env.production nebula360-frontend:latest

# Ver contenedores activos
docker ps

# Acceder al contenedor (debugging)
docker exec -it nebula360 sh
```

---

## Para tu compañero (Despliegue en su máquina)

### Requisitos previos
- Docker instalado (versión 20.10+)
- Git
- Puerto 3000 disponible

### Paso 1: Clonar el repositorio
```bash
git clone <URL_DEL_REPO>
cd nebula360
```

### Paso 2: Configurar variables de entorno
```bash
# Ya viene configurado el .env.production, pero verifica que existe
cat .env.production

# Si necesitas cambiar algo (ej: Google OAuth credentials), edítalo:
nano .env.production  # o tu editor preferido
```

### Paso 3: Build de la imagen
```bash
# Dale permisos al script
chmod +x docker-build.sh

# Ejecuta el build
./docker-build.sh
```

Esto tomará unos minutos la primera vez. Verás algo como:
```
[+] Building 120.5s (22/22) FINISHED
 => [stage-3 1/6] COPY --from=builder /app/public ./public
 => [stage-3 2/6] COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
 ...
Successfully tagged nebula360-frontend:latest
```

### Paso 4: Ejecutar el contenedor
```bash
docker run -d \
  --name nebula360 \
  -p 3000:3000 \
  --env-file .env.production \
  nebula360-frontend:latest
```

### Paso 5: Verificar
```bash
# Verificar que el contenedor está corriendo
docker ps | grep nebula360

# Ver logs
docker logs nebula360

# Verificar health endpoint
curl http://localhost:3000/api/health
```

Deberías ver:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-02T...",
  "service": "nebula360-frontend",
  "uptime": 42.5
}
```

### Paso 6: Acceder
Abre tu navegador en: **http://localhost:3000**

---

## Troubleshooting

### Error: "Puerto 3000 ya está en uso"
```bash
# Ver qué está usando el puerto
sudo lsof -i :3000

# Matar el proceso
sudo kill -9 <PID>

# O usa otro puerto
docker run -d --name nebula360 -p 8080:3000 --env-file .env.production nebula360-frontend:latest
# Luego accede a http://localhost:8080
```

### Error: "Cannot find module"
```bash
# Rebuild sin caché
docker build --no-cache -t nebula360-frontend:latest .
```

### El contenedor se detiene inmediatamente
```bash
# Ver logs de error
docker logs nebula360

# Verificar variables de entorno
docker exec nebula360 env | grep AUTH
```

### Error: Auth no funciona
```bash
# Verifica que NEXTAUTH_URL esté correcto
docker exec nebula360 env | grep NEXTAUTH_URL

# En producción debe ser HTTPS
# En local puede ser HTTP
```

---

## Arquitectura Docker

La imagen Docker usa multi-stage build para optimización:

1. **Stage 1: Dependencies** - Instala dependencias con pnpm
2. **Stage 2: Builder** - Compila la aplicación Next.js
3. **Stage 3: Runner** - Imagen final minimalista (~240MB)

### Características de seguridad:
- ✅ Usuario no-root (nextjs:nodejs)
- ✅ Imagen Alpine Linux (ligera)
- ✅ Solo archivos necesarios
- ✅ Health check integrado
- ✅ Variables de entorno (no hardcoded)

---

## Docker Compose (Opcional)

Si prefieres usar Docker Compose:

```bash
# Copia el archivo de ejemplo
cp docker-compose.example.yml docker-compose.yml

# Edita las variables si es necesario
nano docker-compose.yml

# Levanta los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f frontend

# Detener
docker-compose down
```

---

## Actualizar después de cambios en el código

```bash
# 1. Pull los últimos cambios
git pull origin main

# 2. Rebuild la imagen
docker build -t nebula360-frontend:latest .

# 3. Detener y eliminar contenedor anterior
docker stop nebula360
docker rm nebula360

# 4. Ejecutar nuevo contenedor
docker run -d --name nebula360 -p 3000:3000 --env-file .env.production nebula360-frontend:latest
```

O todo en una línea:
```bash
git pull && docker build -t nebula360-frontend:latest . && docker stop nebula360 && docker rm nebula360 && docker run -d --name nebula360 -p 3000:3000 --env-file .env.production nebula360-frontend:latest
```

---

## Notas importantes

1. **Primera ejecución**: El build puede tomar 3-5 minutos
2. **Cambios en código**: Requieren rebuild de la imagen
3. **Cambios en .env**: Solo requieren restart del contenedor
4. **Producción**: Cambiar NEXTAUTH_URL a tu dominio real con HTTPS
5. **Google OAuth**: Asegúrate de agregar las URLs autorizadas en Google Console

---

## Soporte

Si tienes problemas:
1. Revisa los logs: `docker logs nebula360`
2. Verifica el health: `curl http://localhost:3000/api/health`
3. Revisa el DOCKER.md para más detalles
