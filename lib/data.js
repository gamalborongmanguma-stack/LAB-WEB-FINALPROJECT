import { query } from './db';

export const demoProducts = [
  {
    id: 1,
    name: 'Studio Headphone One',
    category: 'Elektronik',
    price: 1299000,
    stock: 18,
    description: 'Audio jernih dengan desain minimal dan nyaman digunakan sepanjang hari.',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=85',
    store_name: 'Nexa Studio',
    rating: '4.9',
  },
  {
    id: 2,
    name: 'Everyday Leather Tote',
    category: 'Fashion',
    price: 689000,
    stock: 24,
    description: 'Tas harian dengan siluet bersih, ruang luas, dan material pilihan.',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=900&q=85',
    store_name: 'Form Objects',
    rating: '4.8',
  },
  {
    id: 3,
    name: 'Minimal Ceramic Set',
    category: 'Rumah & Living',
    price: 349000,
    stock: 12,
    description: 'Set keramik handmade untuk ritual kopi dan meja makan sehari-hari.',
    image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=900&q=85',
    store_name: 'Clay House',
    rating: '4.9',
  },
  {
    id: 4,
    name: 'Classic Runner Sneakers',
    category: 'Fashion',
    price: 899000,
    stock: 9,
    description: 'Sneakers serbaguna dengan bantalan ringan dan bentuk timeless.',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85',
    store_name: 'North Supply',
    rating: '4.7',
  },
  {
    id: 5,
    name: 'Desk Lamp No. 02',
    category: 'Rumah & Living',
    price: 579000,
    stock: 15,
    description: 'Pencahayaan hangat untuk ruang kerja dengan bentuk modern.',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=85',
    store_name: 'Nexa Studio',
    rating: '4.8',
  },
  {
    id: 6,
    name: 'Daily Carry Watch',
    category: 'Aksesori',
    price: 1149000,
    stock: 7,
    description: 'Jam tangan minimalis yang memadukan fungsi dan estetika.',
    image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=900&q=85',
    store_name: 'Form Objects',
    rating: '4.9',
  },
  {
    id: 7,
    name: 'Essential Skin Set',
    category: 'Kecantikan',
    price: 259000,
    stock: 30,
    description: 'Rangkaian perawatan sederhana untuk rutinitas harian.',
    image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=900&q=85',
    store_name: 'Kindred Care',
    rating: '4.8',
  },
  {
    id: 8,
    name: 'Analog Camera Mini',
    category: 'Elektronik',
    price: 1799000,
    stock: 5,
    description: 'Kamera ringkas untuk mengabadikan momen dengan karakter analog.',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=85',
    store_name: 'North Supply',
    rating: '4.9',
  },
];

const PRODUCT_BASE_QUERY = `
  SELECT
    p.id,
    p.name,
    p.description,
    p.price,
    p.stock,
    p.image_url AS image,
    c.name AS category,
    s.name AS store_name,
    COALESCE(ROUND(AVG(rv.rating)::numeric, 1), 0)::text AS rating
  FROM products p
  LEFT JOIN categories c ON c.id = p.category_id
  LEFT JOIN stores s ON s.id = p.store_id
  LEFT JOIN reviews rv ON rv.product_id = p.id
`;

export async function getProducts() {
  try {
    const result = await query(`
      ${PRODUCT_BASE_QUERY}
      WHERE p.is_active = true
      GROUP BY p.id, c.name, s.name
      ORDER BY p.created_at DESC
    `);
    return result.rows.length ? result.rows : demoProducts;
  } catch {
    return demoProducts;
  }
}

export async function getProduct(id) {
  try {
    const result = await query(
      `
      ${PRODUCT_BASE_QUERY}
      WHERE p.id = $1
      GROUP BY p.id, c.name, s.name
      `,
      [id]
    );
    return result.rows[0] || demoProducts.find((p) => String(p.id) === String(id));
  } catch {
    return demoProducts.find((p) => String(p.id) === String(id));
  }
}

export function money(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));
}