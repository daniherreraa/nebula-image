"""
Punto de entrada principal de la aplicación FastAPI
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging

from api.endpoints import ml_endpoints, models_endpoints, users_endpoints
from config.database import db

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Crear aplicación FastAPI
app = FastAPI(
    title="Nebula",
    description="API para análisis de datos y entrenamiento de modelos de Machine Learning",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configurar CORS
origins = [
    # Local development
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:8080",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:8080",
    # Azure production
    "https://nebulafrontend.azurewebsites.net",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir routers
app.include_router(
    ml_endpoints.router,
    prefix="/api",
    tags=["Machine Learning"]
)

app.include_router(
    models_endpoints.router,
    prefix="/api",
    tags=["Models"]
)

app.include_router(
    users_endpoints.router,
    prefix="/api",
    tags=["Users"]
)


@app.get("/")
async def root():
    """Endpoint raíz de la API"""
    return JSONResponse(content={
        "message": "Bienvenido a Nebula",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    })


@app.get("/health")
async def health_check():
    """Endpoint de health check"""
    return JSONResponse(content={
        "status": "healthy",
        "service": "Nebula ML API"
    })


@app.on_event("startup")
async def startup_event():
    """Evento de inicio de la aplicación"""
    logger.info("=" * 60)
    logger.info("🚀 Iniciando Nebula ML API...")
    logger.info("=" * 60)

    # Conectar a la base de datos
    try:
        await db.connect()
        logger.info("✅ Base de datos conectada")
    except Exception as e:
        logger.error(f"❌ Error al conectar base de datos: {e}")

    logger.info("=" * 60)
    logger.info("📚 Documentación disponible en: http://localhost:8000/docs")
    logger.info("=" * 60)


@app.on_event("shutdown")
async def shutdown_event():
    """Evento de cierre de la aplicación"""
    logger.info("🛑 Nebula ML API cerrando...")

    # Desconectar base de datos
    try:
        await db.disconnect()
        logger.info("✅ Base de datos desconectada")
    except Exception as e:
        logger.error(f"❌ Error al desconectar base de datos: {e}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
