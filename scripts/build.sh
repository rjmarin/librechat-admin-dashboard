#!/bin/bash
#
# Build and push Docker image for AI Metrics Dashboard
# 
# Usage: ./build.sh --repo <registry> --image <image-name> --tag <tag> [--base-url <base-url>] [--push]
#
# Arguments:
#   --repo       Docker registry URL (e.g., docker.io/myorg, ghcr.io/myorg, registry.example.com)
#   --image      Image name (e.g., ai-metrics-dashboard)
#   --tag        Image tag (e.g., v1.0.0, latest)
#   --base-url   Base URL for the application when behind a proxy/load balancer (optional)
#   --push       Push the image to the registry after building (optional)
#   --platform   Target platform (default: linux/amd64, can be linux/amd64,linux/arm64)
#
# Examples:
#   ./build.sh --repo ghcr.io/myorg --image ai-metrics-dashboard --tag v1.0.0
#   ./build.sh --repo docker.io/myorg --image dashboard --tag latest --base-url /metrics --push
#   ./build.sh --repo registry.internal.com --image ai-dashboard --tag 1.2.3 --platform linux/amd64,linux/arm64 --push
#

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
REPO=""
IMAGE=""
TAG=""
BASE_URL=""
PUSH=false
PLATFORM="linux/amd64"

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

usage() {
    echo "Usage: $0 --repo <registry> --image <image-name> --tag <tag> [--base-url <base-url>] [--push] [--platform <platform>]"
    echo ""
    echo "Required arguments:"
    echo "  --repo       Docker registry URL (e.g., docker.io/myorg, ghcr.io/myorg)"
    echo "  --image      Image name (e.g., ai-metrics-dashboard)"
    echo "  --tag        Image tag (e.g., v1.0.0, latest)"
    echo ""
    echo "Optional arguments:"
    echo "  --base-url   Base URL for the application (e.g., /metrics-dashboard)"
    echo "  --push       Push the image to the registry after building"
    echo "  --platform   Target platform (default: linux/amd64)"
    echo "  --help       Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 --repo ghcr.io/myorg --image ai-metrics-dashboard --tag v1.0.0"
    echo "  $0 --repo docker.io/myorg --image dashboard --tag latest --base-url /metrics --push"
    exit 1
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --repo)
            REPO="$2"
            shift 2
            ;;
        --image)
            IMAGE="$2"
            shift 2
            ;;
        --tag)
            TAG="$2"
            shift 2
            ;;
        --base-url)
            BASE_URL="$2"
            shift 2
            ;;
        --push)
            PUSH=true
            shift
            ;;
        --platform)
            PLATFORM="$2"
            shift 2
            ;;
        --help)
            usage
            ;;
        *)
            log_error "Unknown option: $1"
            usage
            ;;
    esac
done

# Validate required arguments
if [[ -z "$REPO" ]]; then
    log_error "Missing required argument: --repo"
    usage
fi

if [[ -z "$IMAGE" ]]; then
    log_error "Missing required argument: --image"
    usage
fi

if [[ -z "$TAG" ]]; then
    log_error "Missing required argument: --tag"
    usage
fi

# Construct full image name
FULL_IMAGE="${REPO}/${IMAGE}:${TAG}"

log_info "Building Docker image for AI Metrics Dashboard"
log_info "=============================================="
log_info "Registry:   ${REPO}"
log_info "Image:      ${IMAGE}"
log_info "Tag:        ${TAG}"
log_info "Full image: ${FULL_IMAGE}"
log_info "Platform:   ${PLATFORM}"
if [[ -n "$BASE_URL" ]]; then
    log_info "Base URL:   ${BASE_URL}"
fi
log_info "Push:       ${PUSH}"
echo ""

# Change to project root
cd "$PROJECT_ROOT"

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    log_error "Docker is not installed or not in PATH"
    exit 1
fi

# Check if Docker daemon is running
if ! docker info &> /dev/null; then
    log_error "Docker daemon is not running"
    exit 1
fi

# Build arguments
BUILD_ARGS=(
    "--file" "Dockerfile"
    "--tag" "${FULL_IMAGE}"
    "--platform" "${PLATFORM}"
)

# Add base URL as build argument if specified
if [[ -n "$BASE_URL" ]]; then
    BUILD_ARGS+=("--build-arg" "NEXT_PUBLIC_BASE_PATH=${BASE_URL}")
fi

# Add labels for better traceability
BUILD_ARGS+=(
    "--label" "org.opencontainers.image.source=https://github.com/your-org/ai-metrics-dashboard"
    "--label" "org.opencontainers.image.created=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
    "--label" "org.opencontainers.image.version=${TAG}"
    "--label" "org.opencontainers.image.title=AI Metrics Dashboard"
    "--label" "org.opencontainers.image.description=Dashboard for LibreChat AI metrics visualization"
)

# Add build context
BUILD_ARGS+=(".")

log_info "Starting Docker build..."

# Check if buildx is available for multi-platform builds
if [[ "$PLATFORM" == *","* ]]; then
    log_info "Multi-platform build detected, using buildx"
    
    # Ensure buildx is available
    if ! docker buildx version &> /dev/null; then
        log_error "Docker buildx is required for multi-platform builds but not available"
        exit 1
    fi
    
    # Create builder if it doesn't exist
    if ! docker buildx inspect multiarch-builder &> /dev/null; then
        log_info "Creating buildx builder..."
        docker buildx create --name multiarch-builder --use
    else
        docker buildx use multiarch-builder
    fi
    
    if [[ "$PUSH" == true ]]; then
        docker buildx build "${BUILD_ARGS[@]}" --push
    else
        docker buildx build "${BUILD_ARGS[@]}" --load 2>/dev/null || {
            log_warn "Cannot load multi-platform image locally. Use --push to push directly to registry."
            docker buildx build "${BUILD_ARGS[@]}"
        }
    fi
else
    # Single platform build
    docker build "${BUILD_ARGS[@]}"
    
    if [[ "$PUSH" == true ]]; then
        log_info "Pushing image to registry..."
        docker push "${FULL_IMAGE}"
    fi
fi

log_success "Build completed successfully!"
log_success "Image: ${FULL_IMAGE}"

if [[ "$PUSH" == true ]]; then
    log_success "Image pushed to registry"
else
    log_info "To push the image, run: docker push ${FULL_IMAGE}"
    log_info "Or re-run this script with --push flag"
fi

echo ""
log_info "To run the container locally:"
echo "  docker run -p 3000:3000 \\"
echo "    -e MONGODB_URI=<your-mongodb-uri> \\"
echo "    -e MONGODB_DB_NAME=<your-db-name> \\"
if [[ -n "$BASE_URL" ]]; then
echo "    -e NEXT_PUBLIC_API_BACKEND_BASE_URL_NODE=${BASE_URL}/api \\"
fi
echo "    -e DASHBOARD_PASSWORD=<your-secure-password> \\"
echo "    ${FULL_IMAGE}"
