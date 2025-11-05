# Nebula

## Estructura del Proyecto

```
nebula-image/
├── backend/              # Backend ML API (Python/FastAPI)
│   ├── server/          # Código fuente del servidor
│   │   ├── api/        # Endpoints de la API
│   │   ├── core/       # Configuración principal
│   │   ├── models/     # Modelos ML
│   │   ├── services/   # Lógica de negocio
│   │   └── utils/      # Utilidades
│   ├── Dockerfile      # Imagen Docker del backend
│   └── .env.example    # Variables de entorno
│
├── frontend/            # Frontend Dashboard (Next.js)
│   ├── app/            # App Router de Next.js
│   ├── components/     # Componentes React
│   ├── lib/           # Utilidades y helpers
│   ├── public/        # Archivos estáticos
│   └── Dockerfile     # Imagen Docker del frontend
│
├── docker-compose.yml  # Orquestación de servicios
└── .gitignore
```

## Requisitos Previos

- Docker y Docker Compose
- Node.js 18+ (para desarrollo local)
- Python 3.9+ (para desarrollo local)

## Inicio Rápido

### Opción 1: Con Docker (Recomendado)

```bash
# Clonar el repositorio
git clone <url-del-repo>
cd nebula-image

# Levantar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f
```

**URLs de los servicios:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Documentación API: http://localhost:8000/docs

### Opción 2: Desarrollo Local

**Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
pnpm install
pnpm dev
```

## Configuración

### Backend
Copia `.env.example` a `.env` en la carpeta `backend/` y configura las variables:
```bash
cp backend/.env.example backend/.env
```

### Frontend
Las variables de entorno se configuran en el `docker-compose.yml` o crea un `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Comandos Útiles

```bash
# Detener servicios
docker-compose down

# Reconstruir imágenes
docker-compose build

# Ver logs de un servicio específico
docker-compose logs -f backend
docker-compose logs -f frontend

# Ejecutar comandos dentro del contenedor
docker-compose exec backend python manage.py
docker-compose exec frontend pnpm install
```

## Tecnologías

### Backend
- Python 3.9+
- FastAPI
- Machine Learning (TensorFlow/PyTorch)
- Uvicorn

### Frontend
- Next.js 14+
- React
- TypeScript
- Tailwind CSS

## Documentación Adicional

- [Documentación del Backend](backend/README.md)
- [Documentación del Frontend](frontend/README.md)
- [Guía de Deployment](frontend/DEPLOYMENT-QUICK-START.md)


