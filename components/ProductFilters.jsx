'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SlidersHorizontal } from 'lucide-react';

const CATEGORIES = ['Elektronik', 'Fashion', 'Rumah & Living', 'Aksesori', 'Kecantikan'];

export default function ProductFilters({ initialQ = '', initialCat = '', initialSort = 'newest' }) {
  const router = useRouter();
  const [q, setQ] = useState(initialQ);
  const [category, setCategory] = useState(initialCat);
  const [sort, setSort] = useState(initialSort);

  function handleSubmit(e) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set('q', q.trim());
    if (category) params.set('category', category);
    if (sort && sort !== 'newest') params.set('sort', sort);

    const queryString = params.toString();
    router.push(queryString ? `/products?${queryString}` : '/products', { scroll: false });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 grid gap-3 sm:grid-cols-[1fr_220px_180px]">
      <div>
        <input
          name="q"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search products or stores..."
          className="input"
        />
      </div>
      <select
        name="category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="input"
      >
        <option value="">All categories</option>
        {CATEGORIES.map((x) => (
          <option key={x} value={x}>
            {x}
          </option>
        ))}
      </select>
      <select
        name="sort"
        value={sort}
        onChange={(e) => setSort(e.target.value)}
        className="input"
      >
        <option value="newest">Newest</option>
        <option value="low">Price: low to high</option>
        <option value="high">Price: high to low</option>
      </select>
      <button type="submit" className="btn-primary sm:col-span-3 sm:justify-self-end">
        Apply filters <SlidersHorizontal className="ml-2 inline" size={14} />
      </button>
    </form>
  );
}