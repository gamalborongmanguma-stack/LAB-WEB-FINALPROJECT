import { notFound } from 'next/navigation';
import { query } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { updateProduct } from '@/actions/seller';
import ProductForm from '@/components/ProductForm';
import { Flash, Title } from '@/components/ui';

export default async function EditProduct({ params, searchParams }) {
  const u = await requireRole('seller');
  const [p] = await query('SELECT p.* FROM products p JOIN stores s ON s.id=p.store_id WHERE p.id=$1 AND s.user_id=$2', [Number(params.id) || 0, u.id]);
  if (!p) notFound();
  const categories = await query('SELECT * FROM categories ORDER BY name');
  return (<><Title>Edit produk</Title><div className="mx-auto max-w-xl"><Flash sp={searchParams} /></div><ProductForm action={updateProduct} categories={categories} product={p} label="Simpan perubahan" /></>);
}
