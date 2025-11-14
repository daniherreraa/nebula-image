#!/bin/bash
# Script de deployment a Azure - Adaptado del script PowerShell de Diego
# Equivalente a la guía manual de deployment

set -e  # Exit on error

# Colores para output
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
GRAY='\033[0;90m'
NC='\033[0m' # No Color

echo -e "${CYAN}=== ACTUALIZANDO A NUEVA VERSIÓN ===${NC}"

# Definir nueva versión
VERSION="v3"  # Incrementar a v4, v5, v6, etc. en próximos deployments

# Verificar que estamos en el directorio correcto
PROJECT_ROOT="/home/dani/Documentos/apps/nebula-image"
cd "$PROJECT_ROOT"

# ===== 1. IR A LAS CARPETAS Y CONSTRUIR =====
echo -e "\n${YELLOW}[1/4] 🔨 CONSTRUYENDO IMÁGENES...${NC}"

# Frontend
echo -e "${GRAY}  📦 Frontend...${NC}"
cd "$PROJECT_ROOT/frontend"
docker build -t nebula-image-frontend:latest .

# Backend
echo -e "${GRAY}  📦 Backend...${NC}"
cd "$PROJECT_ROOT/backend"
docker build -t nebula-image-backend:latest .

# ===== 2. LOGIN EN ACR =====
echo -e "\n${YELLOW}[2/4] 🔐 Login en ACR...${NC}"
az acr login --name nebulacanadaacr

# ===== 3. ETIQUETAR Y SUBIR =====
echo -e "\n${YELLOW}[3/4] 🏷️  Etiquetando y subiendo $VERSION...${NC}"

docker tag nebula-image-frontend:latest nebulacanadaacr.azurecr.io/nebula-image-frontend:$VERSION
docker tag nebula-image-backend:latest nebulacanadaacr.azurecr.io/nebula-image-backend:$VERSION

# También tagear como :latest
docker tag nebula-image-frontend:latest nebulacanadaacr.azurecr.io/nebula-image-frontend:latest
docker tag nebula-image-backend:latest nebulacanadaacr.azurecr.io/nebula-image-backend:latest

echo -e "${GRAY}  ⬆️  Subiendo frontend:$VERSION...${NC}"
docker push nebulacanadaacr.azurecr.io/nebula-image-frontend:$VERSION
docker push nebulacanadaacr.azurecr.io/nebula-image-frontend:latest

echo -e "${GRAY}  ⬆️  Subiendo backend:$VERSION...${NC}"
docker push nebulacanadaacr.azurecr.io/nebula-image-backend:$VERSION
docker push nebulacanadaacr.azurecr.io/nebula-image-backend:latest

# ===== 4. ACTUALIZAR Y REINICIAR =====
echo -e "\n${YELLOW}[4/4] 🔄 Actualizando App Services a $VERSION...${NC}"

# Nota: Los nombres pueden variar - ajustar según los recursos reales en Azure
# Intentar con los nombres en mayúsculas primero (como en el script de PowerShell)
FRONTEND_APP="NebulaFrontend"
BACKEND_APP="NebulaBackend"
RESOURCE_GROUP="MisRecursos"

# Verificar si los nombres son correctos, si no, intentar con minúsculas
if ! az webapp show --name "$FRONTEND_APP" --resource-group "$RESOURCE_GROUP" &>/dev/null; then
    echo -e "${GRAY}  ℹ️  Intentando con nombres en minúsculas...${NC}"
    FRONTEND_APP="nebulafrontend"
    BACKEND_APP="nebulabackend"
fi

echo -e "${GRAY}  🔧 Actualizando $FRONTEND_APP...${NC}"
az webapp config container set \
    --name "$FRONTEND_APP" \
    --resource-group "$RESOURCE_GROUP" \
    --docker-custom-image-name "nebulacanadaacr.azurecr.io/nebula-image-frontend:$VERSION"

echo -e "${GRAY}  🔧 Actualizando $BACKEND_APP...${NC}"
az webapp config container set \
    --name "$BACKEND_APP" \
    --resource-group "$RESOURCE_GROUP" \
    --docker-custom-image-name "nebulacanadaacr.azurecr.io/nebula-image-backend:$VERSION"

echo -e "${GRAY}  🔄 Reiniciando $FRONTEND_APP...${NC}"
az webapp restart --name "$FRONTEND_APP" --resource-group "$RESOURCE_GROUP"

echo -e "${GRAY}  🔄 Reiniciando $BACKEND_APP...${NC}"
az webapp restart --name "$BACKEND_APP" --resource-group "$RESOURCE_GROUP"

# ===== VERIFICACIÓN =====
echo -e "\n${GREEN}✅ ACTUALIZACIÓN A $VERSION COMPLETADA!${NC}"
echo -e "\n${CYAN}🌐 URLs:${NC}"
echo -e "${YELLOW}Frontend: https://nebulafrontend.azurewebsites.net${NC}"
echo -e "${YELLOW}Backend:  https://nebulabackend.azurewebsites.net/docs${NC}"
echo -e "\n${CYAN}⏰ Espera 2-3 minutos y prueba en incógnito (Ctrl+Shift+N)${NC}"
echo ""
echo -e "${CYAN}📋 Verificar logs:${NC}"
echo -e "${GRAY}az webapp log tail --name $BACKEND_APP --resource-group $RESOURCE_GROUP${NC}"
echo ""
