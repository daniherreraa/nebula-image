# Dockerfile para Nebula ML API
# Imagen base de Python
FROM python:3.11-slim as builder

# Establecer directorio de trabajo
WORKDIR /app

# Instalar dependencias del sistema necesarias para las bibliotecas de ML
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copiar archivo de requerimientos
COPY server/requirements.txt .

# Instalar dependencias de Python
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Etapa de producción
FROM python:3.11-slim

# Crear usuario no-root para mayor seguridad
RUN useradd -m -u 1000 nebula && \
    mkdir -p /app && \
    chown -R nebula:nebula /app

# Establecer directorio de trabajo
WORKDIR /app

# Copiar dependencias de Python desde el builder
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Copiar código de la aplicación
COPY --chown=nebula:nebula server/ ./
COPY --chown=nebula:nebula __init__.py ./

# Cambiar al usuario no-root
USER nebula

# Variables de entorno
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONPATH=/app \
    PORT=8000 \
    HOST=0.0.0.0

# Exponer puerto
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/health')" || exit 1

# Comando para ejecutar la aplicación
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
