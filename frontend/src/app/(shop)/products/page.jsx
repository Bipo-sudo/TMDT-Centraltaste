'use client';

import { useEffect, useMemo, useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import api from '../../../lib/api';
import ProductCard from '../../../components/shop/ProductCard';

const presetCategories = [
  { slug: 'all', label: 'Tất cả sản phẩm' },
  { slug: 'mat-ong-siro', label: 'Mật ong & Siro' },
  { slug: 'dau-gia-vi', label: 'Dầu & Gia vị' },
  { slug: 'pho-mai-bo', label: 'Phô mai & Bơ' },
  { slug: 'cafe-tra', label: 'Café & Trà' },
  { slug: 'banh-keo-so-co-la', label: 'Bánh kẹo & Sô-cô-la' },
  { slug: 'nuoc-sot-tuong', label: 'Nước sốt & Tương' },
  { slug: 'hop-qua', label: 'Hộp quà' },
  { slug: 'ruou-do-uong', label: 'Rượu & Đồ uống' },
];

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
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

  const availableCategories = useMemo(() => presetCategories, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => selectedCategory === 'all' || product.category_slug === selectedCategory);
  }, [products, selectedCategory]);

  const PAGE_SIZE = 12;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const visibleProducts = useMemo(() => filteredProducts.slice(0, visibleCount), [filteredProducts, visibleCount]);

  function handleLoadMore() {
    setVisibleCount((c) => c + PAGE_SIZE);
  }

  return (
    <div className="bg-[#0c0b09] text-[#f0ebe0]">
      <section className="mx-auto max-w-[1536px] px-4 pb-16 pt-0 sm:px-6 lg:px-8 lg:pb-20">
        <div className="space-y-6">
          {/* Hero: uses first product image when available, otherwise dark gradient */}
          <div className="ct-hero">
            <div className="ct-hero-bg" />
            <div className="ct-hero-grid" />
            <div className="ct-hero-vignette" />
            <div className="ct-hero-glow" />
            <div
              className="ct-hero-content"
              style={{
                backgroundImage:
                  products && products.length > 0
                    ? `linear-gradient(180deg, rgba(2,2,2,0.35) 0%, rgba(2,2,2,0.6) 60%), url('/figma/image.png')`
                    : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div className="ct-hero-inner">
                <div className="ct-hero-badge">
                  <span className="ct-badge-pulse" /> Tinh hoa · Đặc sản miền Trung · Chính gốc
                </div>
                <div className="ct-hero-emblem">
                  <span className="ct-emblem-ring ct-emblem-ring--outer" />
                  <span className="ct-emblem-ring ct-emblem-ring--inner" />
                  <span className="ct-hero-emblem-core ct-emblem-core" />
                </div>
                <h2 className="ct-hero-title">Thực Phẩm Đặc Sản Cao Cấp</h2>
                <p className="ct-hero-tagline">Tuyển chọn những sản phẩm tinh hoa từ khắp nơi trên thế giới, mang đến trải nghiệm ẩm thực đẳng cấp cho gia đình bạn.</p>
                <div className="ct-hero-cta">
                  <button className="ct-btn-gold">KHÁM PHÁ NGAY</button>
                  <button className="ct-btn-ghost">HỘP QUÀ TẾT</button>
                </div>
              </div>
              <div className="ct-scroll-hint">
                <div className="ct-scroll-line" />
                <div className="text-xs text-[rgba(240,235,224,0.5)]">SCROLL</div>
              </div>
            </div>
          </div>

          <div className="z-30 rounded-[24px] bg-transparent">
            <div className="ct-strip-outer">
              <div className="ct-strip">
                <div className="flex min-w-max items-center gap-3 pr-2">
                {availableCategories.map((category) => {
                  const isActive = selectedCategory === category.slug;

                  return (
                    <button
                      key={category.slug}
                      type="button"
                      onClick={() => setSelectedCategory(category.slug)}
                      className={`whitespace-nowrap rounded-full border px-5 py-2.5 text-[14px] font-medium transition ${
                        isActive
                          ? 'border-[#c9a84c] bg-[#c9a84c] text-[#1a1208] shadow-[0_6px_16px_rgba(201,168,76,0.28)]'
                          : 'border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.02)] text-[rgba(255,255,255,0.88)] hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.04)]'
                      }`}
                    >
                      {category.label}
                    </button>
                  );
                })}
                </div>
                <button
                  type="button"
                  aria-label="Bộ lọc"
                  className="ml-4 inline-flex shrink-0 items-center gap-3 rounded-[14px] border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.02)] px-4 py-3 text-[14px] font-medium text-[rgba(255,255,255,0.92)] transition hover:border-[rgba(201,168,76,0.3)] hover:bg-[rgba(201,168,76,0.08)] hover:text-[#f0ebe0]"
                >
                  <SlidersHorizontal className="h-4 w-4 text-[#c9a84c]" />
                  <span>Bộ lọc</span>
                </button>
              </div>
            </div>
          </div>

          <main>
            <div className="flex items-end justify-between gap-4">
              <div>
                <h1 className="text-[2.2rem] leading-[1.05] tracking-[-0.03em] text-[#f0ebe0] sm:text-[2.8rem] lg:text-[3.3rem]" style={{ fontFamily: 'var(--font-display)', fontWeight: 300 }}>
                  Tất cả sản phẩm
                </h1>
                <p className="mt-2 text-[15px] text-[rgba(240,235,224,0.72)]">{filteredProducts.length} sản phẩm</p>
              </div>
            </div>

            <div className="mt-8">
              {isLoading ? (
                <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
                  {[1, 2, 3, 4].map((key) => (
                    <div key={key} className="overflow-hidden rounded-[22px] bg-[rgba(255,255,255,0.02)]">
                      <div className="aspect-[1/1] animate-pulse bg-[rgba(201,168,76,0.08)]" />
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
                <div className="mx-auto max-w-[560px] rounded-[20px] bg-[rgba(255,255,255,0.03)] p-8 text-center text-sm text-[rgba(240,235,224,0.6)]">
                  {errorMessage}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="mx-auto max-w-[560px] rounded-[20px] bg-[rgba(255,255,255,0.03)] p-8 text-center text-sm text-[rgba(240,235,224,0.6)]">
                  Không tìm thấy sản phẩm phù hợp với bộ lọc hiện tại.
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {visibleProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>

                  {filteredProducts.length > visibleCount && (
                    <div className="mt-8 flex justify-center">
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
