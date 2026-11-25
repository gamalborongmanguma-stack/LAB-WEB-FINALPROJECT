-- Silvera E-Commerce | PostgreSQL
-- Jalankan file ini di pgAdmin (Query Tool) pada database kosong, mis. "silvera".
-- Akun demo (password): admin@silvera.test / admin123 , seller@silvera.test / seller123 , buyer@silvera.test / buyer123
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DROP TABLE IF EXISTS reviews, order_items, orders, cart_items, products, stores, categories, users CASCADE;

CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(150) NOT NULL UNIQUE,
  password      TEXT NOT NULL,
  role          VARCHAR(10) NOT NULL CHECK (role IN ('admin','seller','buyer')),
  seller_status VARCHAR(10) CHECK (seller_status IN ('pending','approved','rejected')),
  phone         VARCHAR(30),
  address       TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE stores (
  id          SERIAL PRIMARY KEY,
  user_id     INT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  name        VARCHAR(120) NOT NULL,
  description TEXT,
  image_url   TEXT
);

CREATE TABLE categories (
  id   SERIAL PRIMARY KEY,
  name VARCHAR(80) NOT NULL UNIQUE
);

CREATE TABLE products (
  id          SERIAL PRIMARY KEY,
  store_id    INT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  category_id INT REFERENCES categories(id) ON DELETE SET NULL,
  name        VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  price       INT NOT NULL CHECK (price >= 0),
  stock       INT NOT NULL CHECK (stock >= 0),
  image_url   TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE cart_items (
  id         SERIAL PRIMARY KEY,
  user_id    INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity   INT NOT NULL CHECK (quantity > 0),
  UNIQUE (user_id, product_id)
);

CREATE TABLE orders (
  id         SERIAL PRIMARY KEY,
  buyer_id   INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total      INT NOT NULL,
  address    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Status disimpan per item agar tiap toko mengelola pesanannya sendiri.
CREATE TABLE order_items (
  id           SERIAL PRIMARY KEY,
  order_id     INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id   INT REFERENCES products(id) ON DELETE SET NULL,
  store_id     INT REFERENCES stores(id) ON DELETE SET NULL,
  product_name VARCHAR(150) NOT NULL,
  price        INT NOT NULL,
  quantity     INT NOT NULL CHECK (quantity > 0),
  status       VARCHAR(30) NOT NULL DEFAULT 'Menunggu Pembayaran'
               CHECK (status IN ('Menunggu Pembayaran','Diproses','Dikirim','Selesai'))
);

CREATE TABLE reviews (
  id         SERIAL PRIMARY KEY,
  product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id    INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating     INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (product_id, user_id)
);

-- ===== Data awal =====
INSERT INTO users (name,email,password,role,seller_status) VALUES
 ('Administrator','admin@silvera.test', crypt('admin123', gen_salt('bf')), 'admin', NULL),
 ('Toko Demo','seller@silvera.test',   crypt('seller123', gen_salt('bf')), 'seller','approved'),
 ('Budi Pembeli','buyer@silvera.test', crypt('buyer123', gen_salt('bf')), 'buyer', NULL);

INSERT INTO stores (user_id,name,description,image_url) VALUES
 (2,'Silver Lab','Gadget dan aksesori bergaya minimalis.',NULL);

INSERT INTO categories (name) VALUES ('Elektronik'),('Fashion'),('Buku'),('Rumah Tangga');

INSERT INTO products (store_id,category_id,name,description,price,stock,image_url) VALUES
 (1,1,'Headphone Nirkabel Graphite','Headphone over-ear dengan peredam bising dan baterai 40 jam.',1250000,20,'https://picsum.photos/seed/headphone/600/600'),
 (1,1,'Keyboard Mekanik Silver','Keyboard 75% hot-swap dengan casing aluminium.',980000,15,'https://picsum.photos/seed/keyboard/600/600'),
 (1,2,'Jaket Bomber Hitam','Jaket ringan tahan angin untuk harian.',450000,30,'https://picsum.photos/seed/jacket/600/600'),
 (1,3,'Buku Desain Minimalis','Panduan membangun antarmuka yang bersih dan fungsional.',150000,50,'https://picsum.photos/seed/book/600/600'),
 (1,4,'Lampu Meja Aluminium','Lampu meja LED dengan tiga mode cahaya.',320000,25,'https://picsum.photos/seed/lamp/600/600'),
 (1,1,'Smartwatch Steel','Jam pintar dengan body stainless dan GPS.',1750000,10,'https://picsum.photos/seed/watch/600/600');
