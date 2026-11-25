import { query } from '@/lib/db';
import { createProduct } from '@/actions/seller';
import ProductForm from '@/components/ProductForm';
import { Flash, Title } from '@/components/ui';

export default async function NewProduct({ searchParams }) {
  const categories = await query('SELECT * FROM categories ORDER BY name');
  return (<><Title>Tambah produk</Title><div className="mx-auto max-w-xl"><Flash sp={searchParams} /></div><ProductForm action={createProduct} categories={categories} label="Simpan produk" /></>);
}
