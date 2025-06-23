#!/bin/bash

# Query Performance Benchmark UI - Setup Script
# This script helps set up the development environment

set -e

echo "🚀 Query Performance Benchmark UI - Setup Script"
echo "=================================================="

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Prerequisites check passed!"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Set up environment files
echo "⚙️ Setting up environment files..."

# Backend environment
cat > .env << EOF
# Neo4j Configuration
NEO4J_URI=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=benchmark123

# Elasticsearch Configuration
ELASTICSEARCH_NODE=http://localhost:9200
ELASTICSEARCH_INDEX=benchmark-data

# Frontend Configuration
CORS_ORIGIN=http://localhost:5173
EOF

# Frontend environment
cat > apps/frontend/.env << EOF
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000
EOF

echo "✅ Environment files created!"

# Build the project
echo "🔨 Building the project..."
npx nx run-many --target=build --all

echo "✅ Build completed!"

# Set up Docker data directories
echo "📁 Creating Docker data directories..."
mkdir -p docker/neo4j/import
mkdir -p docker/elasticsearch/data

echo "✅ Docker directories created!"

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Start the services: docker compose -f docker/docker-compose.yml up -d"
echo "2. Open your browser to: http://localhost:5173"
echo "3. Check the backend API: http://localhost:3000/query"
echo "4. Access Neo4j browser: http://localhost:7474"
echo "5. Check Elasticsearch: http://localhost:9200"
echo ""
echo "For development:"
echo "- Start backend: npx nx serve backend"
echo "- Start frontend: npx nx serve frontend"
echo "- Run tests: npx nx run-many --target=test"
echo ""
echo "Happy benchmarking! 🚀" 