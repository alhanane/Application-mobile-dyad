# API Backend - Institution AL HANANE
## Documentation des Endpoints

### 📁 Structure des fichiers

```
/api/
├── crud.php                    # API CRUD générique
├── auth/
│   ├── login.php              # Connexion parent
│   ├── logout.php             # Déconnexion
│   └── me.php                 # Infos du parent connecté
├── info/
│   ├── list.php               # Liste des notes d'information
│   └── mark-read.php          # Marquer une note comme lue
├── news/
│   ├── list.php               # Liste des actualités
│   └── mark-read.php          # Marquer une actualité comme lue
├── requests/
│   ├── list.php               # Liste des demandes du parent
│   ├── create.php             # Créer une nouvelle demande
│   ├── detail.php             # Détails d'une demande
│   └── types.php              # Types de demandes disponibles
├── device/
│   ├── register.php           # Enregistrer un token FCM
│   └── unregister.php         # Désenregistrer un token FCM
├── students/
│   └── my.php                 # Liste des enfants du parent
└── contact/
    └── get.php                # Informations de contact de l'école

/config/
├── config.php                 # Configuration générale
└── db.php                     # Connexion base de données

/lib/
├── auth.php                   # Fonctions d'authentification
├── fcm.php                    # Fonctions Firebase Cloud Messaging
└── utils.php                  # Fonctions utilitaires
```

---

## 🔐 Authentification

### POST /api/auth/login.php
Connexion d'un parent.

**Request:**
```json
{
  "login": "parent.pere",
  "password": "123456"
}
```

**Response (succès):**
```json
{
  "success": true,
  "data": {
    "parent": {
      "id": 1,
      "login": "parent.pere",
      "first_name": "Jean",
      "last_name": "Martin",
      "email": "jean.martin@email.com",
      "gsm": "06 12 34 56 78"
    },
    "children": [
      {
        "id": 1,
        "first_name": "Lucas",
        "last_name": "Martin",
        "level_code": "CE2",
        "class_code": "A",
        "full_class": "CE2/A"
      }
    ]
  }
}
```

### POST /api/auth/logout.php
Déconnexion du parent connecté.

### GET /api/auth/me.php
Récupère les informations du parent connecté (nécessite authentification).

---

## 📄 Notes d'Information

### GET /api/info/list.php
Liste des notes d'information visibles par le parent connecté.

**Response:**
```json
{
  "success": true,
  "data": {
    "notes": [
      {
        "id": 1,
        "title": "Règlement Intérieur 2024-2025",
        "description": "...",
        "image_url": "/uploads/...",
        "pdf_url": "/uploads/info_pdfs/...",
        "link_url": null,
        "category_label": "Administratif",
        "category_color": "#4F46E5",
        "published_at": 1725148800000,
        "is_read": false
      }
    ]
  }
}
```

### POST /api/info/mark-read.php
Marquer une note comme lue.

**Request:**
```json
{
  "info_note_id": 1
}
```

---

## 📰 Actualités

### GET /api/news/list.php
Liste des actualités visibles par le parent connecté.

### POST /api/news/mark-read.php
Marquer une actualité comme lue.

---

## 📋 Demandes

### GET /api/requests/list.php
Liste des demandes du parent connecté.

### POST /api/requests/create.php
Créer une nouvelle demande.

**Request:**
```json
{
  "student_id": 1,
  "request_type_id": 1,
  "subject": "Demande d'attestation",
  "message": "Je souhaite obtenir une attestation de scolarité..."
}
```

### GET /api/requests/detail.php?id=1
Détails d'une demande avec ses réponses.

### GET /api/requests/types.php
Liste des types de demandes disponibles.

---

## 📱 Appareils (FCM)

### POST /api/device/register.php
Enregistrer un token FCM pour les notifications push.

**Request:**
```json
{
  "token": "fcm_token_here",
  "platform": "android",
  "device_name": "Samsung Galaxy",
  "device_model": "SM-G991B",
  "os_version": "13",
  "app_version": "2.0.0"
}
```

### POST /api/device/unregister.php
Désenregistrer un token FCM.

---

## 👨‍🎓 Élèves

### GET /api/students/my.php
Liste des enfants associés au parent connecté.

---

## 📞 Contact

### GET /api/contact/get.php
Informations de contact de l'école (public).

---

## 🔧 API CRUD Générique

### POST /api/crud.php
API générique pour les opérations CRUD.

**Actions disponibles:** `list`, `insert`, `update`, `delete`, `raw`

**Exemple - Liste:**
```json
{
  "action": "list",
  "table": "levels",
  "select": ["id", "code", "name"],
  "order_by": [{"column": "sort_order", "direction": "ASC"}]
}
```

**Exemple - Insert:**
```json
{
  "action": "insert",
  "table": "info_notes",
  "data": {
    "title": "Nouvelle note",
    "description": "Contenu...",
    "target_type": "all"
  }
}
```

---

## 📊 Tables MySQL Autorisées

| Catégorie | Tables |
|-----------|--------|
| Référence | `school_years`, `levels`, `classes`, `request_types`, `info_note_categories`, `news_categories` |
| Utilisateurs | `parents`, `students`, `parent_student` |
| Contenus | `info_notes`, `news`, `info_note_reads`, `news_reads` |
| Demandes | `requests`, `request_responses` |
| Notifications | `device_tokens`, `fcm_topic_subscriptions`, `notifications_log` |
| Admin | `admins`, `admin_actions` |
| Config | `contact_info`, `app_settings` |

---

## 🔑 Configuration requise

Variables d'environnement ou modification de `/config/config.php`:

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'alhanane_db');
define('DB_USER', 'root');
define('DB_PASS', '');
define('FCM_SERVER_KEY', 'your_fcm_server_key');
define('BASE_URL', 'https://your-domain.com');
```

---

## 🚀 Étapes suivantes

1. **Importer le schéma MySQL** (`schema_alhanane_db_v2.sql`)
2. **Configurer les identifiants** dans `config/config.php`
3. **Adapter le frontend React** pour appeler ces API
4. **Configurer FCM** pour les notifications push
5. **Créer les fichiers PWA** (manifest.json, service-worker.js)
