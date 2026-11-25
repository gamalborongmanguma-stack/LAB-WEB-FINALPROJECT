-- NEXA E-Commerce database | PostgreSQL | Jalankan file ini di pgAdmin Query Tool
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(180) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin','seller','buyer')),
  status VARCHAR(20) NOT NULL DEFAULT 'approved' CHECK (status IN ('pending','approved','rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS stores (
  id BIGSERIAL PRIMARY KEY,
  owner_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(140) NOT NULL,
  description TEXT DEFAULT '',
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS categories (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(80) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS products (
  id BIGSERIAL PRIMARY KEY,
  store_id BIGINT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  category_id BIGINT NOT NULL REFERENCES categories(id),
  name VARCHAR(180) NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(14,2) NOT NULL CHECK(price > 0),
  stock INTEGER NOT NULL DEFAULT 0 CHECK(stock >= 0),
  image_url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS cart_items (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK(quantity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id,product_id)
);
CREATE TABLE IF NOT EXISTS orders (
  id BIGSERIAL PRIMARY KEY,
  buyer_id BIGINT NOT NULL REFERENCES users(id),
  total NUMERIC(14,2) NOT NULL CHECK(total >= 0),
  status VARCHAR(40) NOT NULL DEFAULT 'Menunggu Pembayaran',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL REFERENCES products(id),
  store_id BIGINT NOT NULL REFERENCES stores(id),
  quantity INTEGER NOT NULL CHECK(quantity > 0),
  price NUMERIC(14,2) NOT NULL CHECK(price >= 0)
);
CREATE TABLE IF NOT EXISTS reviews (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id,product_id)
);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_store ON products(store_id);
CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_cart_user ON cart_items(user_id);

-- Admin demo: email admin@nexa.local | password Admin123!
INSERT INTO users(name,email,password_hash,role,status)
VALUES('NEXA Administrator','admin@nexa.local',crypt('Admin123!',gen_salt('bf',12)),'admin','approved')
ON CONFLICT(email) DO NOTHING;

INSERT INTO categories(name) VALUES
('Elektronik'),('Fashion'),('Rumah & Living'),('Aksesori'),('Kecantikan')
ON CONFLICT(name) DO NOTHING;

-- Demo store and products so the catalog is populated after schema setup.
INSERT INTO stores(owner_id,name,description)
SELECT id,'NEXA Studio','Official NEXA curated store.' FROM users WHERE email='admin@nexa.local'
ON CONFLICT(owner_id) DO NOTHING;
INSERT INTO products(store_id,category_id,name,description,price,stock,image_url)
SELECT s.id,c.id,v.name,v.description,v.price,v.stock,v.image_url
FROM stores s CROSS JOIN (VALUES
('Elektronik','Studio Headphone One','Audio jernih dengan desain minimal dan nyaman digunakan sepanjang hari.',1299000,18,'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=85'),
('Fashion','Everyday Leather Tote','Tas harian dengan siluet bersih, ruang luas, dan material pilihan.',689000,24,'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=900&q=85'),
('Rumah & Living','Minimal Ceramic Set','Set keramik handmade untuk ritual kopi dan meja makan sehari-hari.',349000,12,'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=900&q=85'),
('Fashion','Classic Runner Sneakers','Sneakers serbaguna dengan bantalan ringan dan bentuk timeless.',899000,9,'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85'),
('Rumah & Living','Desk Lamp No. 02','Pencahayaan hangat untuk ruang kerja dengan bentuk modern.',579000,15,'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=85'),
('Aksesori','Daily Carry Watch','Jam tangan minimalis yang memadukan fungsi dan estetika.',1149000,7,'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=900&q=85'),
('Kecantikan','Essential Skin Set','Rangkaian perawatan sederhana untuk rutinitas harian.',259000,30,'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=900&q=85'),
('Elektronik','Analog Camera Mini','Kamera ringkas untuk mengabadikan momen dengan karakter analog.',1799000,5,'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=85')
) AS v(category,name,description,price,stock,image_url)
JOIN categories c ON c.name=v.category
WHERE s.name='NEXA Studio' AND NOT EXISTS(SELECT 1 FROM products p WHERE p.name=v.name);
