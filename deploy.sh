#!/bin/bash
# Run this script from inside the soundtrack-app folder to deploy instantly
# Usage: bash deploy.sh

echo "🚀 Deploying to Vercel..."
vercel --prod --yes
echo "✅ Done! Check https://booktomusicmatcher.vercel.app"
