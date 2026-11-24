CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(180) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'customer' CHECK (role IN ('customer','admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  slug VARCHAR(180) NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  category VARCHAR(60) NOT NULL,
  price BIGINT NOT NULL CHECK (price >= 0),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  image_url TEXT NOT NULL,
  tag VARCHAR(40),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cart_items (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

CREATE TABLE IF NOT EXISTS orders (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id),
  order_number VARCHAR(40) NOT NULL UNIQUE,
  customer_name VARCHAR(120) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  shipping_address TEXT NOT NULL,
  notes TEXT,
  subtotal BIGINT NOT NULL,
  shipping_cost BIGINT NOT NULL DEFAULT 0,
  total BIGINT NOT NULL,
  payment_method VARCHAR(40) NOT NULL DEFAULT 'manual_transfer',
  payment_status VARCHAR(30) NOT NULL DEFAULT 'pending',
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id BIGINT REFERENCES products(id) ON DELETE SET NULL,
  product_name VARCHAR(160) NOT NULL,
  unit_price BIGINT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  line_total BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Seed products: safe to run repeatedly.
INSERT INTO products (name, slug, description, category, price, stock, image_url, tag)
VALUES
('Studio Headphones','studio-headphones','Headphone over-ear dengan karakter suara seimbang dan desain minimal.','Tech',1249000,12,'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=85','BESTSELLER'),
('Analog Camera','analog-camera','Kamera compact untuk mengabadikan momen sehari-hari.','Tech',2899000,5,'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=85','LIMITED'),
('Everyday Backpack','everyday-backpack','Tas harian dengan ruang terorganisasi dan siluet sederhana.','Lifestyle',879000,20,'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=85','NEW'),
('Minimal Watch','minimal-watch','Jam tangan bergaya clean untuk penggunaan sehari-hari.','Accessories',1599000,8,'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=85',NULL),
('Desk Speaker','desk-speaker','Speaker desktop ringkas untuk ruang kerja.','Tech',749000,14,'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=900&q=85',NULL),
('Ceramic Pour Over','ceramic-pour-over','Peralatan seduh kopi keramik dengan desain sederhana.','Lifestyle',329000,25,'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=85',NULL),
('Leather Cardholder','leather-cardholder','Cardholder ringkas untuk kebutuhan esensial.','Accessories',259000,30,'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=900&q=85',NULL),
('Sculptural Lamp','sculptural-lamp','Lampu meja dengan bentuk modern dan cahaya hangat.','Lifestyle',989000,9,'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=85','NEW')
ON CONFLICT (slug) DO NOTHING;
