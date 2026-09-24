-- Migration 0004: Create products table
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  brand TEXT NOT NULL,
  image TEXT,
  price INTEGER NOT NULL,
  original_price INTEGER NOT NULL,
  discount_percent INTEGER DEFAULT 0,
  stock INTEGER DEFAULT 0,
  in_stock INTEGER DEFAULT 1,
  specifications TEXT,
  youtube_id TEXT,
  skus TEXT,
  folders TEXT,
  variants TEXT,
  color_images TEXT,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
