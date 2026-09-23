ALTER TABLE addresses ADD COLUMN user_email TEXT;
ALTER TABLE addresses ADD COLUMN name TEXT;

UPDATE addresses
SET user_email = (SELECT email FROM users WHERE users.id = addresses.user_id)
WHERE user_email IS NULL;

UPDATE addresses
SET name = full_name
WHERE name IS NULL;

CREATE INDEX IF NOT EXISTS idx_addresses_user_email
  ON addresses (user_email);