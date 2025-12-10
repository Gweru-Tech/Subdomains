#!/bin/bash

# Subdomain Creator Deployment Script
# This script helps deploy the application to Render.com

echo "🚀 Subdomain Creator Deployment Helper"
echo "======================================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit: Subdomain Creator setup"
    echo "✅ Git repository initialized"
else
    echo "✅ Git repository already exists"
fi

# Check if remote is set
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "🌐 Please add your GitHub repository as remote:"
    echo "   git remote add origin https://github.com/yourusername/subdomain-creator.git"
    echo ""
    echo "📤 Then push to GitHub:"
    echo "   git push -u origin main"
else
    echo "✅ Remote repository is configured"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if render.yaml exists
if [ -f "render.yaml" ]; then
    echo "✅ Render configuration found"
else
    echo "❌ render.yaml not found"
    exit 1
fi

# Create environment file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating environment file..."
    cp .env.example .env
    echo "✅ .env file created from .env.example"
    echo "⚠️  Please update .env with your specific values"
fi

echo ""
echo "🎯 Next Steps for Render.com Deployment:"
echo "======================================="
echo "1. Push your code to GitHub"
echo "2. Go to https://dashboard.render.com"
echo "3. Click 'New +' → 'Web Service'"
echo "4. Connect your GitHub repository"
echo "5. Select this repository"
echo "6. Keep default settings (Node.js, Free plan)"
echo "7. Click 'Create Web Service'"
echo "8. Wait for deployment to complete"
echo ""
echo "🌐 Your app will be available at: https://your-app-name.onrender.com"
echo ""
echo "📚 For custom domains:"
echo "   1. Add domain in Render dashboard"
echo "   2. Update DNS records with provided configuration"
echo "   3. Wait for SSL certificate issuance"
echo ""
echo "✨ Happy deploying!"