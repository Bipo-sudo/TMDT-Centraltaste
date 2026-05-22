'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import api from '../../../lib/api';
import ProductCard from '../../../components/shop/ProductCard';

const presetCategories = [
  { slug: 'me-xung', label: 'Mè xửng' },
  { slug: 'tra', label: 'Trà' },
  { slug: 'ca-phe', label: 'Cà phê' },
];

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadProducts() {
      try {
        setIsLoading(true);
        setErrorMessage('');
        const response = await api.get('/products');
        if (isMounted) {
          setProducts(response.data?.data || []);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage('Không thể tải danh sách sản phẩm.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  const availableCategories = useMemo(() => {
    const categoryMap = new Map();

    presetCategories.forEach((category) => {
      categoryMap.set(category.slug, category.label);
    });

    products.forEach((product) => {
      if (!product.category_slug) {
        return;
      }

      if (!categoryMap.has(product.category_slug)) {
        categoryMap.set(product.category_slug, product.category_name_vi || product.category_slug);
      }
    });

    return Array.from(categoryMap.entries()).map(([slug, label]) => ({ slug, label }));
  }, [products]);

  const filteredProducts = useMemo(() => {
    const query = normalizeText(searchQuery);

    return products.filter((product) => {
      const matchesCategory = selectedCategory === 'all' || product.category_slug === selectedCategory;

      if (!matchesCategory) {
        return false;
      }

      if (!query) {
        return true;
      }

      return [product.name_vi, product.name_en, product.tagline_vi, product.tagline_en, product.summary_vi, product.summary_en]
        .some((field) => normalizeText(field).includes(query));
    });
  }, [products, searchQuery, selectedCategory]);

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="max-w-3xl space-y-5">
        <p className="text-[11px] uppercase tracking-[0.42em] text-neutral-400">Shop</p>
        <h1 className="text-4xl font-light tracking-[-0.06em] text-neutral-950 sm:text-5xl lg:text-6xl">
          Tinh hoa Đặc sản
        </h1>
        <p className="max-w-2xl text-base leading-8 text-neutral-500 sm:text-lg">
          Bộ sưu tập được trình bày theo tinh thần light, gọn và thanh lịch, tập trung vào khoảng trắng và nhịp nhìn.
        </p>
      </div>

      <div className="mt-10 space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <label className="flex w-full max-w-xl items-center gap-3 border-b border-neutral-200 pb-3">
            <Search className="h-4 w-4 shrink-0 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Tìm sản phẩm, hương vị, hoặc mô tả..."
              className="w-full bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-400"
            />
          </label>

          <div className="flex flex-wrap gap-2">
            {[{ slug: 'all', label: 'Tất cả' }, ...availableCategories].map((category) => {
              const isActive = selectedCategory === category.slug;

              return (
                <button
                  key={category.slug}
                  type="button"
                  onClick={() => setSelectedCategory(category.slug)}
                  className={`rounded-full px-4 py-2 text-sm transition ${
                    isActive
                      ? 'bg-neutral-900 text-white'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900'
                  }`}
                >
                  {category.label}
                </button>
              );
            })}
          </div>
        </div>

        {isLoading ? (
          <div className="py-16 text-sm text-neutral-500">Đang tải danh sách sản phẩm...</div>
        ) : errorMessage ? (
          <div className="rounded-[24px] border border-dashed border-neutral-200 bg-white p-8 text-sm text-neutral-500">
            {errorMessage}
          </div>
        ) : (
          <>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {filteredProducts.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-neutral-200 bg-white p-8 text-sm text-neutral-500">
                Không tìm thấy sản phẩm phù hợp với bộ lọc hiện tại.
              </div>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}
