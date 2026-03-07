#!/bin/bash

# Script de build pour la production
# Ce script prépare le frontend pour le déploiement

echo "========================================"
echo "Build de Production - Mobile App"
echo "========================================"
echo ""

# Vérifier si Node.js est installé
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé"
    echo "Veuillez installer Node.js depuis https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo ""

# Installer les dépendances
echo "📦 Installation des dépendances..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors de l'installation des dépendances"
    exit 1
fi

echo "✅ Dépendances installées"
echo ""

# Configurer l'URL de l'API
echo "⚙️  Configuration de l'API..."
read -p "Entrez l'URL de votre API (ex: https://votre-domaine.com/mobile/api): " API_URL

if [ -z "$API_URL" ]; then
    echo "❌ URL de l'API requise"
    exit 1
fi

# Créer le fichier .env
cat > .env << EOF
VITE_API_URL=$API_URL
VITE_APP_URL=$(dirname $API_URL)
NODE_ENV=production
EOF

echo "✅ Configuration de l'API: $API_URL"
echo ""

# Effectuer le build
echo "🔨 Build de l'application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors du build"
    exit 1
fi

echo "✅ Build terminé avec succès"
echo ""

# Afficher les informations
echo "========================================"
echo "✅ Build terminé !"
echo "========================================"
echo ""
echo "📁 Dossier de build: ./dist/"
echo ""
echo "📋 Prochaines étapes:"
echo "1. Uploadez le contenu du dossier dist/ sur votre serveur"
echo "2. Uploadez les dossiers api/, admin/, config/, lib/ sur votre serveur"
echo "3. Configurez config/config.php avec vos informations de base de données"
echo "4. Exécutez test-server.php pour vérifier la configuration"
echo ""
echo "Pour plus d'informations, consultez GUIDE_DEPLOIEMENT.md"
echo ""