-- Migracion 001: esquema inicial

CREATE TABLE invitations (
  id                  INTEGER PRIMARY KEY,
  code                TEXT    NOT NULL UNIQUE,
  display_name        TEXT    NOT NULL,
  max_guests          INTEGER NOT NULL DEFAULT 1 CHECK (max_guests BETWEEN 1 AND 20),
  email               TEXT,
  status              TEXT    NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'responded')),
  responded_at        TEXT,
  privacy_accepted_at TEXT,
  notes               TEXT,
  created_at          TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at          TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE menu_options (
  id            INTEGER PRIMARY KEY,
  name          TEXT    NOT NULL UNIQUE,
  description   TEXT,
  is_child_menu INTEGER NOT NULL DEFAULT 0 CHECK (is_child_menu IN (0, 1)),
  is_active     INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  sort_order    INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE allergens (
  id         INTEGER PRIMARY KEY,
  name       TEXT    NOT NULL UNIQUE,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE guests (
  id              INTEGER PRIMARY KEY,
  invitation_id   INTEGER NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
  full_name       TEXT    NOT NULL,
  attending       INTEGER CHECK (attending IN (0, 1)),  -- NULL = sin responder
  is_child        INTEGER NOT NULL DEFAULT 0 CHECK (is_child IN (0, 1)),
  menu_option_id  INTEGER REFERENCES menu_options(id) ON DELETE SET NULL,
  other_allergies TEXT,
  created_at      TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_guests_invitation ON guests(invitation_id);

CREATE TABLE guest_allergens (
  guest_id    INTEGER NOT NULL REFERENCES guests(id)    ON DELETE CASCADE,
  allergen_id INTEGER NOT NULL REFERENCES allergens(id) ON DELETE CASCADE,
  PRIMARY KEY (guest_id, allergen_id)
);

CREATE TABLE song_requests (
  id            INTEGER PRIMARY KEY,
  invitation_id INTEGER NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
  song_title    TEXT    NOT NULL
);

CREATE TABLE admins (
  id            INTEGER PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TRIGGER trg_guests_max_guests
BEFORE INSERT on guests
WHEN (SELECT count(*) from guests where invitation_id = NEW.invitation_id) 
  => (SELECT max_guests from invitations where id = NEW.invitation_id)
BEGIN
  SELECT RAISE(ABORT, "Se ha superado el numero de invitados de la invitación")

END;

-- Un invitado nunca puede superar las plazas de su invitacion (control a nivel de BD)
-- CREATE TRIGGER trg_guests_max_guests
-- BEFORE INSERT ON guests
-- WHEN (SELECT COUNT(*) FROM guests WHERE invitation_id = NEW.invitation_id)
--      >= (SELECT max_guests FROM invitations WHERE id = NEW.invitation_id)
-- BEGIN
--   SELECT RAISE(ABORT, 'Se ha superado el numero maximo de invitados de la invitacion');
-- END;
