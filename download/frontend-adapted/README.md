# Institution AL HANANE - Application PWA Parents

Application mobile PWA pour les parents d'élèves de l'Institution AL HANANE.

## 🚀 Fonctionnalités

- ✅ Authentification sécurisée des parents
- ✅ Consultation des notes d'information avec ciblage (tous/niveau/classe)
- ✅ Consultation des actualités de l'école
- ✅ Demandes administratives (attestation, facture, certificat, etc.)
- ✅ Suivi des réponses aux demandes
- ✅ Notifications push FCM
- ✅ Fonctionnement hors ligne (PWA)
- ✅ Installation sur mobile (Android/iOS)

## 📋 Prérequis

- **Serveur Web** : Apache ou Nginx avec PHP 7.4+
- **Base de données** : MySQL 8.0+
- **Node.js** : 18+ (pour le frontend)
- **Firebase** : Projet FCM pour les notifications push

## 📦 Installation

### 1. Cloner le repository

```bash
git clone https://github.com/alhanane/Application-mobile-dyad.git
cd Application-mobile-dyad
```

### 2. Base de données MySQL

```bash
# Importer le schéma
mysql -u root -p < db/schema_alhanane_db_v2.sql
```

### 3. Configuration Backend PHP

Copier et modifier le fichier de configuration :

```bash
# Éditer config/config.php avec vos identifiants
```

Variables à configurer :
- `DB_HOST` : Hôte MySQL
- `DB_NAME` : Nom de la base (alhanane_db)
- `DB_USER` : Utilisateur MySQL
- `DB_PASS` : Mot de passe MySQL
- `FCM_SERVER_KEY` : Clé serveur Firebase
- `BASE_URL` : URL de votre site

### 4. Configuration Frontend React

```bash
# Copier le fichier d'environnement
cp .env.example .env

# Modifier VITE_API_URL avec l'URL de votre API
```

### 5. Installer les dépendances et builder

```bash
npm install
npm run build
```

### 6. Déploiement

Transférer les fichiers vers votre serveur :

**Backend PHP :**
- `/api/` → racine du serveur
- `/config/` → racine du serveur
- `/lib/` → racine du serveur
- `/uploads/` → racine du serveur (créer le dossier)

**Frontend :**
- Contenu du dossier `dist/` → racine du serveur ou sous-dossier

## 📁 Structure des fichiers

```
├── api/                    # API Endpoints PHP
│   ├── auth/              # Authentification
│   ├── info/              # Notes d'information
│   ├── news/              # Actualités
│   ├── requests/          # Demandes
│   ├── device/            # Tokens FCM
│   ├── students/          # Élèves
│   ├── contact/           # Contact école
│   └── crud.php           # API générique
├── config/                 # Configuration PHP
├── lib/                    # Librairies PHP
│   ├── auth.php           # Authentification
│   ├── fcm.php            # Firebase Cloud Messaging
│   └── utils.php          # Utilitaires
├── db/                     # Scripts SQL
├── src/                    # Frontend React
│   ├── auth/              # Contexte d'authentification
│   ├── hooks/             # Hooks personnalisés
│   ├── lib/               # Configuration API
│   ├── pages/             # Pages de l'application
│   └── types/             # Types TypeScript
├── public/                 # Fichiers statiques
│   ├── manifest.json      # Manifest PWA
│   └── service-worker.js  # Service Worker
└── admin/                  # Interface admin (existante)
```

## 🔐 Authentification

### Comptes de test

La base de données contient des comptes de test :

**Parent :**
- Login : `parent.pere`
- Mot de passe : `123456`

**Admin :**
- Login : `admin`
- Mot de passe : `admin123`

## 📱 Notifications FCM

### Configuration Firebase

1. Créer un projet sur [Firebase Console](https://console.firebase.google.com)
2. Activer Cloud Messaging
3. Récupérer la clé serveur (Project Settings > Cloud Messaging)
4. Ajouter la clé dans `config/config.php` : `FCM_SERVER_KEY`

### Topics FCM

L'application utilise des topics pour le ciblage :

- `all` : Tous les parents
- `level.CP` : Parents avec enfants en CP
- `class.CP.A` : Parents avec enfants en CP/A

## 🔧 Développement

```bash
# Mode développement
npm run dev

# Linter
npm run lint

# Build production
npm run build
```

## 📊 Base de données

### Tables principales

| Table | Description |
|-------|-------------|
| `parents` | Comptes parents |
| `students` | Élèves |
| `parent_student` | Relations parent-élève |
| `info_notes` | Notes d'information |
| `news` | Actualités |
| `requests` | Demandes parents |
| `request_responses` | Réponses aux demandes |
| `device_tokens` | Tokens FCM |

## 🆘 Support

Pour toute question technique, contactez le service informatique de l'Institution AL HANANE.

## 📄 Licence

© 2024-2025 Institution AL HANANE. Tous droits réservés.
