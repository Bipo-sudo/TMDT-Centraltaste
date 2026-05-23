'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Search, Sparkles, Wheat } from 'lucide-react';
import { motion } from 'framer-motion';
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

  const PAGE_SIZE = 12;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const visibleProducts = useMemo(() => filteredProducts.slice(0, visibleCount), [filteredProducts, visibleCount]);

  function handleLoadMore() {
    setVisibleCount((c) => c + PAGE_SIZE);
  }

  return (
    <div className="bg-[#0c0b09] text-[#f0ebe0]">
      <section className="relative overflow-hidden border-b border-[rgba(201,168,76,0.14)]">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg,#16130e 0%,#0c0b09 100%)' }} />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg,transparent,transparent 40px,rgba(201,168,76,0.32) 40px,rgba(201,168,76,0.32) 41px),repeating-linear-gradient(90deg,transparent,transparent 40px,rgba(201,168,76,0.32) 40px,rgba(201,168,76,0.32) 41px)',
          }}
        />
        <div
          className="absolute left-1/2 top-1/2 h-[260px] w-[440px] -translate-x-1/2 -translate-y-[58%] rounded-full opacity-80"
          style={{ background: 'radial-gradient(ellipse,rgba(201,168,76,0.12) 0%,transparent 70%)' }}
        />

        <div className="relative mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 py-12 lg:grid-cols-1 lg:py-16">
              <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-[720px]"
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(201,168,76,0.28)] bg-[rgba(201,168,76,0.06)] px-4 py-2 text-[10px] uppercase tracking-[0.24em] text-[rgba(240,235,224,0.76)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#c9a84c]" />
                Bộ sưu tập sản phẩm
              </span>

              <h1 className="mt-5 text-[3rem] leading-[1.03] tracking-[0.03em] sm:text-6xl lg:text-7xl" style={{ fontFamily: 'var(--font-display)', fontWeight: 300 }}>
                Đặc sản <em className="not-italic text-[#c9a84c]">miền Trung</em>
              </h1>

              <p className="mt-5 max-w-[560px] text-[15px] leading-8 text-[rgba(240,235,224,0.62)]">
                Danh sách sản phẩm được trình bày cùng ngôn ngữ thị giác với homepage mới: tối, sang, rõ nhịp và tập trung vào sản phẩm thật.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/#story" className="inline-flex items-center gap-2 rounded-full bg-[#c9a84c] px-6 py-3 text-[13px] font-semibold text-[#1a1208] transition hover:opacity-90">
                  Xem câu chuyện <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-[rgba(240,235,224,0.78)] transition hover:text-[#c9a84c]">
                  Về trang chủ
                </Link>
              </div>
            </motion.div>
            {/* promotional/info card removed to keep storefront clean */}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-4 pb-16 pt-10 sm:px-6 lg:px-8 lg:pb-20 lg:pt-14">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-6">
              <div>
                <p className="text-[10px] uppercase tracking-[0.28em] text-[rgba(201,168,76,0.72)]">Danh mục</p>
                <div className="mt-4 space-y-2">
                  {[{ slug: 'all', label: 'Tất cả' }, ...availableCategories].map((category) => (
                    <div key={category.slug} className="flex items-center gap-3">
                      <input
                        id={`cat-${category.slug}`}
                        name="category"
                        type="radio"
                        checked={selectedCategory === category.slug}
                        onChange={() => setSelectedCategory(category.slug)}
                        className="h-4 w-4 accent-[#c9a84c]"
                      />
                      <label htmlFor={`cat-${category.slug}`} className="text-sm text-[rgba(240,235,224,0.78)]">
                        {category.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-[0.28em] text-[rgba(201,168,76,0.72)]">Tìm kiếm</p>
                <label className="mt-2 flex w-full items-center gap-3 rounded px-3 py-2 bg-[rgba(255,255,255,0.02)]">
                  <Search className="h-4 w-4 shrink-0 text-[rgba(240,235,224,0.5)]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Tìm sản phẩm, hương vị, hoặc mô tả..."
                    className="w-full bg-transparent text-sm text-[#f0ebe0] outline-none placeholder:text-[rgba(240,235,224,0.32)]"
                  />
                </label>
              </div>
            </div>
          </aside>

          <main>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.28em] text-[rgba(201,168,76,0.72)]">Bộ lọc</p>
                <h2 className="mt-3 text-[1.45rem] leading-[1.12] tracking-[-0.03em] text-[#f0ebe0] sm:text-[1.65rem]" style={{ fontFamily: 'var(--font-display)', fontWeight: 400 }}>
                  Tìm nhanh sản phẩm bạn đang <em className="italic text-[#c9a84c]">quan tâm</em>.
                </h2>
              </div>

              <div className="mt-4 lg:mt-0">
                <div className="flex flex-wrap gap-2">
                  {[{ slug: 'all', label: 'Tất cả' }, ...availableCategories].map((category) => {
                    const isActive = selectedCategory === category.slug;

                    return (
                      <button
                        key={category.slug}
                        type="button"
                        onClick={() => setSelectedCategory(category.slug)}
                        className={`rounded-full px-3 py-1.5 text-[12px] transition ${
                          isActive
                            ? 'bg-[rgba(201,168,76,0.14)] text-[#c9a84c]'
                            : 'text-[rgba(240,235,224,0.62)] hover:text-[#c9a84c]'
                        }`}
                      >
                        {category.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-6">
              {isLoading ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {[1, 2, 3, 4].map((key) => (
                    <div key={key} className="overflow-hidden rounded-[12px] bg-[rgba(255,255,255,0.02)]">
                      <div className="h-44 animate-pulse bg-[rgba(201,168,76,0.08)]" />
                      <div className="space-y-3 p-4">
                        <div className="h-2.5 w-20 animate-pulse rounded bg-[rgba(201,168,76,0.12)]" />
                        <div className="h-5 w-4/5 animate-pulse rounded bg-[rgba(201,168,76,0.12)]" />
                        <div className="h-3 w-full animate-pulse rounded bg-[rgba(201,168,76,0.08)]" />
                        <div className="h-9 w-full animate-pulse rounded-full bg-[rgba(201,168,76,0.08)]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : errorMessage ? (
                <div className="rounded-[12px] bg-[rgba(255,255,255,0.03)] p-8 text-sm text-[rgba(240,235,224,0.6)]">
                  {errorMessage}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="rounded-[12px] bg-[rgba(255,255,255,0.03)] p-8 text-sm text-[rgba(240,235,224,0.6)]">
                  Không tìm thấy sản phẩm phù hợp với bộ lọc hiện tại.
                </div>
              ) : (
                <>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {visibleProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>

                  {filteredProducts.length > visibleCount && (
                    <div className="mt-6 flex justify-center">
                      <button onClick={handleLoadMore} className="rounded-full bg-[#c9a84c] px-6 py-2 font-semibold text-[#1a1208]">
                        Xem thêm
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </main>
        </div>
      </section>
    </div>
  );
}
