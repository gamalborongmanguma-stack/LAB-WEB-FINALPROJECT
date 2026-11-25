export const rupiah = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');
export const tanggal = (d) => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
export const STATUSES = ['Menunggu Pembayaran', 'Diproses', 'Dikirim', 'Selesai'];
export const PRODUCT_SELECT = `SELECT p.*, c.name AS category, s.name AS store_name,
  (SELECT ROUND(AVG(rating)::numeric,1) FROM reviews r WHERE r.product_id=p.id) AS rating
  FROM products p LEFT JOIN categories c ON c.id=p.category_id JOIN stores s ON s.id=p.store_id`;
