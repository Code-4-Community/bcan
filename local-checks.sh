#!/bin/bash

echo "🔍 Running local pre-merge checks..."

# Frontend checks
echo "📦 Installing frontend dependencies..."
cd frontend || exit
npm install
if [ $? -ne 0 ]; then
    echo "❌ Frontend install failed"
    exit 1
fi

echo "🏗️ Building frontend..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed"
    exit 1
fi
cd ..

# Backend checks
echo "📦 Installing backend dependencies..."
cd backend || exit
npm install
if [ $? -ne 0 ]; then
    echo "❌ Backend install failed"
    exit 1
fi

echo "🏗️ Building backend..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Backend build failed"
    exit 1
fi
cd ..

# Pre-merge tool checks
echo "📦 Installing pre-merge check dependencies..."
npm install typescript ts-morph

echo "🔍 Running circular dependency check..."
node canIMerge.js --check-circular
if [ $? -ne 0 ]; then
    echo "❌ Circular dependency check failed"
    exit 1
fi

echo "✅ All checks passed!"