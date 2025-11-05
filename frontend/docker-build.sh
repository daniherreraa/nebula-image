#!/bin/bash

# Nebula 360 - Docker Build Script
# Este script facilita el build y deployment de la aplicación

set -e

# Colors para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables
IMAGE_NAME="nebula360-frontend"
TAG="${1:-latest}"
CONTAINER_NAME="nebula360"

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}   Nebula 360 - Docker Build Script    ${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""

# Función para mostrar uso
usage() {
    echo "Usage: $0 [TAG] [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  build     - Build Docker image"
    echo "  run       - Run container"
    echo "  stop      - Stop container"
    echo "  restart   - Restart container"
    echo "  logs      - Show container logs"
    echo "  clean     - Remove container and image"
    echo ""
    echo "Examples:"
    echo "  $0 latest build    # Build image with tag 'latest'"
    echo "  $0 v1.0.0 build    # Build image with tag 'v1.0.0'"
    echo "  $0 latest run      # Run container"
    exit 1
}

# Función para build
build() {
    echo -e "${YELLOW}Building Docker image: ${IMAGE_NAME}:${TAG}${NC}"

    # Check if .env.production exists
    if [ ! -f .env.production ]; then
        echo -e "${RED}Warning: .env.production not found!${NC}"
        echo -e "${YELLOW}Creating from .env.example...${NC}"

        if [ -f .env.example ]; then
            cp .env.example .env.production
            echo -e "${YELLOW}Please edit .env.production with your actual values${NC}"
        else
            echo -e "${RED}Error: .env.example not found!${NC}"
            exit 1
        fi
    fi

    # Build image
    docker build \
        --build-arg NODE_ENV=production \
        -t ${IMAGE_NAME}:${TAG} \
        -t ${IMAGE_NAME}:latest \
        .

    echo -e "${GREEN}✓ Build completed successfully!${NC}"
    echo -e "${BLUE}Image: ${IMAGE_NAME}:${TAG}${NC}"

    # Show image size
    SIZE=$(docker images ${IMAGE_NAME}:${TAG} --format "{{.Size}}")
    echo -e "${BLUE}Size: ${SIZE}${NC}"
}

# Función para run
run() {
    echo -e "${YELLOW}Starting container: ${CONTAINER_NAME}${NC}"

    # Check if .env.production exists
    if [ ! -f .env.production ]; then
        echo -e "${RED}Error: .env.production not found!${NC}"
        echo -e "${YELLOW}Run with 'build' command first${NC}"
        exit 1
    fi

    # Stop existing container if running
    if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        echo -e "${YELLOW}Stopping existing container...${NC}"
        docker stop ${CONTAINER_NAME} 2>/dev/null || true
        docker rm ${CONTAINER_NAME} 2>/dev/null || true
    fi

    # Run container
    docker run -d \
        --name ${CONTAINER_NAME} \
        -p 3000:3000 \
        --env-file .env.production \
        --restart unless-stopped \
        ${IMAGE_NAME}:${TAG}

    echo -e "${GREEN}✓ Container started successfully!${NC}"
    echo -e "${BLUE}Container name: ${CONTAINER_NAME}${NC}"
    echo -e "${BLUE}URL: http://localhost:3000${NC}"
    echo ""
    echo -e "${YELLOW}Waiting for health check...${NC}"
    sleep 5

    # Health check
    if curl -s http://localhost:3000/api/health > /dev/null; then
        echo -e "${GREEN}✓ Health check passed!${NC}"
    else
        echo -e "${RED}✗ Health check failed. Check logs:${NC}"
        echo -e "${YELLOW}docker logs ${CONTAINER_NAME}${NC}"
    fi
}

# Función para stop
stop() {
    echo -e "${YELLOW}Stopping container: ${CONTAINER_NAME}${NC}"
    docker stop ${CONTAINER_NAME} 2>/dev/null || echo -e "${RED}Container not running${NC}"
    docker rm ${CONTAINER_NAME} 2>/dev/null || true
    echo -e "${GREEN}✓ Container stopped${NC}"
}

# Función para restart
restart() {
    echo -e "${YELLOW}Restarting container: ${CONTAINER_NAME}${NC}"
    docker restart ${CONTAINER_NAME} 2>/dev/null || {
        echo -e "${RED}Container not running. Starting...${NC}"
        run
    }
    echo -e "${GREEN}✓ Container restarted${NC}"
}

# Función para logs
logs() {
    echo -e "${YELLOW}Showing logs for: ${CONTAINER_NAME}${NC}"
    docker logs -f ${CONTAINER_NAME}
}

# Función para clean
clean() {
    echo -e "${YELLOW}Cleaning up...${NC}"

    # Stop and remove container
    docker stop ${CONTAINER_NAME} 2>/dev/null || true
    docker rm ${CONTAINER_NAME} 2>/dev/null || true

    # Remove images
    docker rmi ${IMAGE_NAME}:${TAG} 2>/dev/null || true
    docker rmi ${IMAGE_NAME}:latest 2>/dev/null || true

    # Prune dangling images
    docker image prune -f

    echo -e "${GREEN}✓ Cleanup completed${NC}"
}

# Main
COMMAND="${2:-help}"

case $COMMAND in
    build)
        build
        ;;
    run)
        run
        ;;
    stop)
        stop
        ;;
    restart)
        restart
        ;;
    logs)
        logs
        ;;
    clean)
        clean
        ;;
    help|*)
        usage
        ;;
esac
