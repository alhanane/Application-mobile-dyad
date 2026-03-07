# 🚀 Guide de Déploiement - VPS Ubuntu 22

## 📋 Table des matières

1. [Prérequis](#prérequis)
2. [Méthode 1: Script de déploiement automatique](#méthode-1-script-de-déploiement-automatique)
3. [Méthode 2: Déploiement manuel](#méthode-2-déploiement-manuel)
4. [Méthode 3: Docker Compose](#méthode-3-docker-compose)
5. [Configuration post-déploiement](#configuration-post-déploiement)
6. [Sécurisation](#sécurisation)
7. [Maintenance](#maintenance)

---

## Prérequis

- VPS Ubuntu 22.04 avec au moins 2 Go RAM
- Accès root ou sudo
- Nom de domaine configuré avec les DNS
- Port 80 et 443 ouverts

---

## Méthode 1: Script de déploiement automatique

### Étape 1: Transférer l'archive sur le VPS

```bash
# Sur votre machine locale
scp projet_mobile_vps_ubuntu22.zip root@votre-vps-ip:/root/
```

### Étape 2: Se connecter au VPS

```bash
ssh root@votre-vps-ip
```

### Étape 3: Décompresser l'archive

```bash
cd /root
unzip projet_mobile_vps_ubuntu22.zip
cd mobile
```

### Étape 4: Exécuter le script de déploiement

```bash
chmod +x deploy-ubuntu.sh
sudo bash deploy-ubuntu.sh
```

Le script va :
- ✅ Mettre à jour le système
- ✅ Installer PHP 8.1, MySQL, Node.js, Nginx/Apache
- ✅ Configurer la base de données
- ✅ Build le frontend React
- ✅ Configurer le serveur web
- ✅ Installer le certificat SSL (optionnel)

### Étape 5: Configurer le certificat SSL

```bash
sudo certbot --nginx -d votre-domaine.com
```

---

## Méthode 2: Déploiement manuel

### Étape 1: Mise à jour du système

```bash
sudo apt update && sudo apt upgrade -y
```

### Étape 2: Installation de PHP 8.1

```bash
sudo add-apt-repository ppa:ondrej/php -y
sudo apt update
sudo apt install -y php8.1 php8.1-fpm php8.1-mysql php8.1-curl php8.1-json php8.1-mbstring php8.1-fileinfo php8.1-xml php8.1-zip
```

### Étape 3: Installation de MySQL

```bash
sudo apt install -y mysql-server
sudo mysql_secure_installation
```

### Étape 4: Installation de Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

### Étape 5: Installation de Nginx

```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

### Étape 6: Copie des fichiers

```bash
sudo mkdir -p /var/www/mobile
sudo cp -r . /var/www/mobile/
cd /var/www/mobile
```

### Étape 7: Installation des dépendances Node.js

```bash
npm install
```

### Étape 8: Build du frontend

```bash
export VITE_API_URL="https://votre-domaine.com/api"
export VITE_USE_PHP_API=1
npm run build
```

### Étape 9: Configuration de la base de données

```bash
sudo mysql -u root -p
```

```sql
CREATE DATABASE mobile_app_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'mobile_user'@'localhost' IDENTIFIED BY 'votre_mot_de_passe';
GRANT ALL PRIVILEGES ON mobile_app_db.* TO 'mobile_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Étape 10: Import du schéma

```bash
sudo mysql -u mobile_user -p mobile_app_db < db/schema.sql
sudo mysql -u mobile_user -p mobile_app_db < db/seeds.sql
```

### Étape 11: Configuration PHP

```bash
sudo nano /etc/php/8.1/fpm/php.ini
```

Modifier les valeurs suivantes :
```ini
upload_max_filesize = 10M
post_max_size = 10M
max_execution_time = 300
memory_limit = 256M
```

```bash
sudo systemctl restart php8.1-fpm
```

### Étape 12: Configuration de l'application

```bash
sudo nano config/config.php
```

Modifier les valeurs de la base de données et de l'URL.

### Étape 13: Configuration Nginx

```bash
sudo cp nginx.conf.example /etc/nginx/sites-available/mobile
sudo sed -i 's/votre-domaine.com/votre-domaine.com/g' /etc/nginx/sites-available/mobile
sudo ln -s /etc/nginx/sites-available/mobile /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

### Étape 14: Configuration des permissions

```bash
sudo chown -R www-data:www-data /var/www/mobile
sudo find /var/www/mobile -type d -exec chmod 755 {} \;
sudo find /var/www/mobile -type f -exec chmod 644 {} \;
sudo chmod -R 755 /var/www/mobile/uploads
```

### Étape 15: Installation du certificat SSL

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d votre-domaine.com
```

---

## Méthode 3: Docker Compose

### Étape 1: Installation de Docker et Docker Compose

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
sudo apt install -y docker-compose-plugin
```

### Étape 2: Configuration de l'environnement

```bash
cp .env.docker.example .env
nano .env
```

Modifier les valeurs selon votre configuration.

### Étape 3: Lancement des conteneurs

```bash
docker compose up -d
```

### Étape 4: Vérification

```bash
docker compose ps
docker compose logs -f
```

---

## Configuration post-déploiement

### 1. Configuration FCM

```bash
sudo nano config/config.php
```

Ajouter votre clé FCM :
```php
define('FCM_SERVER_KEY', 'votre_cle_fcm');
```

### 2. Configuration des informations de contact

```bash
sudo nano config/config.php
```

Modifier les valeurs :
```php
define('CONTACT_PHONE', '+212 5 28 22 33 44');
define('CONTACT_EMAIL', 'contact@alhanane.ma');
define('CONTACT_ADDRESS', 'Quartier Tilila, Agadir, Maroc');
```

### 3. Test de l'application

Accédez à `https://votre-domaine.com` et testez :
- Connexion admin
- Connexion parent
- Affichage des notes et actualités
- Création de demandes

---

## Sécurisation

### 1. Configuration du pare-feu

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
```

### 2. Protection contre les attaques brute force

```bash
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 3. Mises à jour automatiques

```bash
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

### 4. Sauvegardes automatiques

Créer un script de sauvegarde :

```bash
sudo nano /usr/local/bin/backup-mobile.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
mkdir -p $BACKUP_DIR

# Sauvegarde de la base de données
mysqldump -u mobile_user -p mobile_app_db > $BACKUP_DIR/db_$DATE.sql

# Sauvegarde des fichiers
tar -czf $BACKUP_DIR/files_$DATE.tar.gz /var/www/mobile

# Suppression des sauvegardes de plus de 7 jours
find $BACKUP_DIR -type f -mtime +7 -delete
```

```bash
sudo chmod +x /usr/local/bin/backup-mobile.sh
sudo crontab -e
```

Ajouter :
```
0 2 * * * /usr/local/bin/backup-mobile.sh
```

---

## Maintenance

### Redémarrage des services

```bash
# Nginx
sudo systemctl restart nginx

# PHP-FPM
sudo systemctl restart php8.1-fpm

# MySQL
sudo systemctl restart mysql
```

### Vérification des logs

```bash
# Nginx
sudo tail -f /var/log/nginx/mobile_error.log

# PHP-FPM
sudo tail -f /var/log/php8.1-fpm.log

# MySQL
sudo tail -f /var/log/mysql/error.log
```

### Mise à jour de l'application

```bash
cd /var/www/mobile
git pull  # Si vous utilisez Git
npm install
npm run build
sudo systemctl restart nginx
```

---

## Dépannage

### Erreur 502 Bad Gateway

Vérifiez que PHP-FPM fonctionne :
```bash
sudo systemctl status php8.1-fpm
```

### Erreur de connexion à la base de données

Vérifiez les identifiants dans `config/config.php` et que MySQL fonctionne :
```bash
sudo systemctl status mysql
```

### Erreur de permissions

```bash
sudo chown -R www-data:www-data /var/www/mobile
sudo chmod -R 755 /var/www/mobile
```

---

## Comptes de test

**Admin:**
- Email: `admin@ecole.com`
- Mot de passe: `admin123`

**Parent:**
- Email: `parent@test.com`
- Mot de passe: `parent123`

---

## Support

Pour toute question ou problème, consultez :
- `README_MODE_API.md` - Documentation du mode API
- `GUIDE_DEPloIEMENT.md` - Guide de déploiement détaillé

---

**Bon déploiement ! 🚀**