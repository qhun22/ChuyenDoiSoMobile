CREATE TABLE IF NOT EXISTS password_change_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_email TEXT NOT NULL,
  user_id TEXT,
  changed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ip_address TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_password_history_user_email
  ON password_change_history (user_email, changed_at DESC);