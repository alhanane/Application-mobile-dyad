-- Seeds (optionnel)

-- 1) Niveaux
INSERT INTO levels (code, name) VALUES
('CP','Cours Préparatoire'),
('CE1','Cours Élémentaire 1'),
('CE2','Cours Élémentaire 2'),
('CM1','Cours Moyen 1'),
('CM2','Cours Moyen 2'),
('6EME','Sixième')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 2) Classes (exemple A/B pour chaque niveau)
INSERT INTO classes (level_id, code, name)
SELECT l.id, 'A', CONCAT(l.code,'/A') FROM levels l
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO classes (level_id, code, name)
SELECT l.id, 'B', CONCAT(l.code,'/B') FROM levels l
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Comptes (admin/parents) :
-- Le mini back-office crée automatiquement un admin par défaut (admin/admin123) si la table admins est vide.
-- Pour créer des parents de test, générez password_hash() côté PHP puis insérez dans la table parents.
