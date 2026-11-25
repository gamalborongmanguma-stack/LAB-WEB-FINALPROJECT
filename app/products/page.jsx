import { getProducts } from '@/lib/data';
import ProductCard from '@/components/ProductCard';
import ProductFilters from '@/components/ProductFilters';

function filterAndSortProducts(items, { q, category, sort }) {
  let result = [...items];

  if (q) {
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        String(p.store_name).toLowerCase().includes(q)
    );
  }

  if (category) {
    result = result.filter((p) => p.category === category);
  }

  if (sort === 'low') {
    result.sort((a, b) => a.price - b.price);
  } else if (sort === 'high') {
    result.sort((a, b) => b.price - a.price);
  }

  return result;
}

export default async function Products({ searchParams }) {
  const params = await searchParams;
  const rawQ = String(params?.q || '');
  const category = String(params?.category || '');
  const sort = String(params?.sort || 'newest');

  const allProducts = await getProducts();
  const products = filterAndSortProducts(allProducts, {
    q: rawQ.toLowerCase(),
    category,
    sort,
  });

  return (
    <div className="container-x py-14">
      <div className="border-b pb-9" style={{ borderColor: 'var(--line)' }}>
        <p className="muted text-[10px] font-bold uppercase tracking-[.25em]">
          The NEXA selection
        </p>
        <h1 className="mt-3 text-5xl font-semibold tracking-[-.06em]">
          All <span className="font-serif italic font-normal">products.</span>
        </h1>
        <p className="muted mt-3 text-sm">
          Thoughtful finds for every part of your everyday.
        </p>
      </div>

      <ProductFilters
        key={`${rawQ}-${category}-${sort}`}
        initialQ={rawQ}
        initialCat={category}
        initialSort={sort}
      />

      <p className="muted mt-8 text-xs">Showing {products.length} products</p>

      <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-4 md:gap-x-6">
        {products.map((product, index) => (
          <ProductCard key={product.id} product={product} index={index} />
        ))}
      </div>

      {!products.length && (
        <p className="muted py-24 text-center">
          No products found. Try another search.
        </p>
      )}
    </div>
  );
}