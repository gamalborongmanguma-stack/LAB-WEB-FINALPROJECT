export default function ProductForm({ action, categories, product, label }) {
  const p = product || {};
  return (
    <form action={action} className="card mx-auto max-w-xl space-y-4">
      {p.id && <input type="hidden" name="id" value={p.id} />}
      <div><label className="label" htmlFor="name">Nama produk</label><input id="name" name="name" defaultValue={p.name} required minLength={3} className="input" /></div>
      <div><label className="label" htmlFor="description">Deskripsi</label><textarea id="description" name="description" rows={4} defaultValue={p.description} required className="input" /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="label" htmlFor="price">Harga (Rp)</label><input id="price" name="price" type="number" min="0" defaultValue={p.price} required className="input" /></div>
        <div><label className="label" htmlFor="stock">Stok</label><input id="stock" name="stock" type="number" min="0" defaultValue={p.stock} required className="input" /></div>
      </div>
      <div><label className="label" htmlFor="category_id">Kategori</label>
        <select id="category_id" name="category_id" defaultValue={p.category_id || ''} required className="input">
          <option value="" disabled>Pilih kategori</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select></div>
      <div><label className="label" htmlFor="image_url">URL gambar</label><input id="image_url" name="image_url" type="url" defaultValue={p.image_url} required placeholder="https://" className="input" /></div>
      <button className="btn w-full">{label}</button>
    </form>
  );
}
