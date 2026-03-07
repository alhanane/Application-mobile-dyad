#!/bin/bash

# Script de déploiement pour Ubuntu 22
# Ce script installe et configure tous les composants nécessaires

set -e  # Arrêter le script en cas d'erreur

echo "========================================"
echo "Déploiement du Projet Mobile - Ubuntu 22"
echo "========================================"
echo ""

# Vérifier que le script est exécuté en root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Ce script doit être exécuté en root (sudo)"
    exit 1
fi

# Variables de configuration
DOMAIN="votre-domaine.com"  # À modifier
DB_NAME="mobile_app_db"
DB_USER="mobile_user"
DB_PASS=$(openssl rand -base64 32)
MYSQL_ROOT_PASS=""  # Laisser vide pour demander
WEB_SERVER="nginx"  # nginx ou apache

# Demander les informations de configuration
echo "📋 Configuration du déploiement"
echo ""
read -p "Nom de domaine [$DOMAIN]: " INPUT_DOMAIN
DOMAIN=${INPUT_DOMAIN:-$DOMAIN}

read -p "Nom de la base de données [$DB_NAME]: " INPUT_DB_NAME
DB_NAME=${INPUT_DB_NAME:-$DB_NAME}

read -p "Utilisateur de la base de données [$DB_USER]: " INPUT_DB_USER
DB_USER=${INPUT_DB_USER:-$DB_USER}

read -sp "Mot de passe MySQL root (laisser vide pour demander): " INPUT_MYSQL_ROOT
MYSQL_ROOT_PASS=$INPUT_MYSQL_ROOT
echo ""

read -p "Serveur web (nginx/apache) [$WEB_SERVER]: " INPUT_WEB_SERVER
WEB_SERVER=${INPUT_WEB_SERVER:-$WEB_SERVER}

echo ""
echo "========================================"
echo "Résumé de la configuration:"
echo "  Domaine: $DOMAIN"
echo "  Base de données: $DB_NAME"
echo "  Utilisateur BDD: $DB_USER"
echo "  Serveur web: $WEB_SERVER"
echo "========================================"
echo ""
read -p "Continuer? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Annulation"
    exit 1
fi

# Mise à jour du système
echo ""
echo "📦 Mise à jour du système..."
apt update && apt upgrade -y

# Installation des dépendances
echo ""
echo "📦 Installation des dépendances..."
apt install -y curl wget git unzip software-properties-common

# Installation de PHP
echo ""
echo "📦 Installation de PHP 8.1..."
add-apt-repository ppa:ondrej/php -y
apt update
apt install -y php8.1 php8.1-fpm php8.1-mysql php8.1-curl php8.1-json php8.1-mbstring php8.1-fileinfo php8.1-xml php8.1-zip

# Installation de MySQL
echo ""
echo "📦 Installation de MySQL..."
if [ -z "$MYSQL_ROOT_PASS" ]; then
    debconf-set-selections <<< "mysql-server mysql-server/root_password password $MYSQL_ROOT_PASS"
    debconf-set-selections <<< "mysql-server mysql-server/root_password_again password $MYSQL_ROOT_PASS"
fi
apt install -y mysql-server

# Installation de Node.js
echo ""
echo "📦 Installation de Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Installation du serveur web
echo ""
echo "📦 Installation de $WEB_SERVER..."
if [ "$WEB_SERVER" = "nginx" ]; then
    apt install -y nginx
    systemctl enable nginx
    systemctl start nginx
elif [ "$WEB_SERVER" = "apache" ]; then
    apt install -y apache2 libapache2-mod-php8.1
    a2enmod rewrite
    a2enmod ssl
    systemctl enable apache2
    systemctl start apache2
fi

# Installation de Certbot (SSL)
echo ""
echo "📦 Installation de Certbot..."
apt install -y certbot python3-certbot-nginx

# Création du répertoire de l'application
echo ""
echo "📁 Création du répertoire de l'application..."
mkdir -p /var/www/mobile
chown -R $USER:$USER /var/www/mobile

# Copie des fichiers
echo ""
echo "📁 Copie des fichiers..."
cp -r . /var/www/mobile/
cd /var/www/mobile

# Installation des dépendances Node.js
echo ""
echo "📦 Installation des dépendances Node.js..."
npm install

# Build du frontend
echo ""
echo "🔨 Build du frontend..."
export VITE_API_URL="https://$DOMAIN/api"
export VITE_USE_PHP_API=1
npm run build

# Configuration de la base de données
echo ""
echo "🗄️  Configuration de la base de données..."
mysql -u root -p"$MYSQL_ROOT_PASS" <<EOF
CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASS';
GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';
FLUSH PRIVILEGES;
EOF

# Import du schéma de la base de données
echo ""
echo "🗄️  Import du schéma de la base de données..."
mysql -u root -p"$MYSQL_ROOT_PASS" $DB_NAME < db/schema.sql

# Import des données de test
echo ""
echo "🗄️  Import des données de test..."
mysql -u root -p"$MYSQL_ROOT_PASS" $DB_NAME < db/seeds.sql

# Configuration PHP
echo ""
echo "⚙️  Configuration PHP..."
sed -i "s/;upload_max_filesize = 2M/upload_max_filesize = 10M/" /etc/php/8.1/fpm/php.ini
sed -i "s/;post_max_size = 8M/post_max_size = 10M/" /etc/php/8.1/fpm/php.ini
sed -i "s/;max_execution_time = 30/max_execution_time = 300/" /etc/php/8.1/fpm/php.ini
systemctl restart php8.1-fpm

# Configuration de l'application
echo ""
echo "⚙️  Configuration de l'application..."
cat > config/config.php <<EOF
<?php
declare(strict_types=1);

// Database
define('DB_HOST', 'localhost');
define('DB_NAME', '$DB_NAME');
define('DB_USER', '$DB_USER');
define('DB_PASS', '$DB_PASS');
define('DB_CHARSET', 'utf8mb4');

// Base URL
define('BASE_URL', 'https://$DOMAIN');

// Uploads
define('UPLOAD_DIR', __DIR__ . '/../uploads');
define('UPLOAD_URL_PREFIX', '/uploads');
define('MAX_FILE_SIZE_BYTES', 10 * 1024 * 1024);

// FCM
define('FCM_SERVER_KEY', getenv('FCM_SERVER_KEY') ?: '');
define('FCM_ENDPOINT', 'https://fcm.googleapis.com/fcm/send');

// Contact
define('CONTACT_PHONE', getenv('CONTACT_PHONE') ?: '');
define('CONTACT_EMAIL', getenv('CONTACT_EMAIL') ?: '');
define('CONTACT_ADDRESS', getenv('CONTACT_ADDRESS') ?: '');
EOF

# Création du dossier uploads
echo ""
echo "📁 Création du dossier uploads..."
mkdir -p uploads/documents
mkdir -p uploads/news
chown -R www-data:www-data uploads
chmod -R 755 uploads

# Configuration du serveur web
echo ""
echo "⚙️  Configuration du serveur web..."
if [ "$WEB_SERVER" = "nginx" ]; then
    sed "s/votre-domaine.com/$DOMAIN/g" nginx.conf.example > /etc/nginx/sites-available/mobile
    ln -sf /etc/nginx/sites-available/mobile /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    nginx -t
    systemctl restart nginx
elif [ "$WEB_SERVER" = "apache" ]; then
    sed "s/votre-domaine.com/$DOMAIN/g" apache.conf.example > /etc/apache2/sites-available/mobile.conf
    a2ensite mobile.conf
    a2dissite 000-default.conf
    apache2ctl configtest
    systemctl restart apache2
fi

# Configuration des permissions
echo ""
echo "🔒 Configuration des permissions..."
chown -R www-data:www-data /var/www/mobile
find /var/www/mobile -type d -exec chmod 755 {} \;
find /var/www/mobile -type f -exec chmod 644 {} \;
chmod 755 uploads

# Configuration du pare-feu
echo ""
echo "🔒 Configuration du pare-feu..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Installation du certificat SSL
echo ""
echo "🔒 Installation du certificat SSL..."
read -p "Installer le certificat SSL maintenant? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    certbot --$WEB_SERVER -d $DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN
fi

# Affichage des informations
echo ""
echo "========================================"
echo "✅ Déploiement terminé avec succès!"
echo "========================================"
echo ""
echo "📋 Informations importantes:"
echo "  URL: https://$DOMAIN"
echo "  Base de données: $DB_NAME"
echo "  Utilisateur BDD: $DB_USER"
echo "  Mot de passe BDD: $DB_PASS"
echo ""
echo "👤 Comptes de test:"
echo "  Admin: admin@ecole.com / admin123"
echo "  Parent: parent@test.com / parent123"
echo ""
echo "📝 Prochaines étapes:"
echo "  1. Configurez la clé FCM dans config/config.php"
echo "  2. Configurez les informations de contact"
echo "  3. Testez l'application"
echo ""
echo "📁 Logs:"
echo "  Nginx: /var/log/nginx/mobile_error.log"
echo "  PHP: /var/log/php8.1-fpm.log"
echo "  MySQL: /var/log/mysql/error.log"
echo ""
echo "========================================"
echo ""
echo "⚠️  IMPORTANT: Sauvegardez le mot de passe de la base de données!"
echo "   Mot de passe: $DB_PASS"
echo ""