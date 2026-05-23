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
          <div className="grid items-center gap-10 py-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.8fr)] lg:py-16">
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
                <Link href="/#story" className="inline-flex items-center gap-2 rounded-full bg-[#c9a84c] px-6 py-3 text-[13px] font-semibold text-[#1a1208] transition hover:gap-3 hover:opacity-90">
                  Xem câu chuyện <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-[rgba(240,235,224,0.22)] px-6 py-3 text-[13px] font-medium text-[rgba(240,235,224,0.78)] transition hover:border-[rgba(201,168,76,0.55)] hover:text-[#c9a84c]">
                  Về trang chủ
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 36 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
              className="relative mx-auto w-full max-w-[440px]"
            >
              <div className="relative overflow-hidden rounded-[32px] border border-[rgba(201,168,76,0.16)] bg-[linear-gradient(135deg,#1f1911,#312718)] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.24)]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(201,168,76,0.18),transparent_60%)]" />
                <div className="relative space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="grid h-12 w-12 place-items-center rounded-full bg-[linear-gradient(135deg,#c9a84c,#e8d49a)] text-[#2a1f08]">
                      <Wheat className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.26em] text-[rgba(240,235,224,0.4)]">CentralTaste</p>
                      <p className="text-[11px] uppercase tracking-[0.2em] text-[rgba(240,235,224,0.42)]">Premium Vietnamese Specialties</p>
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] p-4 backdrop-blur-sm">
                    <div className="flex items-center gap-3 text-[rgba(240,235,224,0.74)]">
                      <Sparkles className="h-4 w-4 text-[#c9a84c]" />
                      <p className="text-[10px] uppercase tracking-[0.26em]">Lọc theo vùng, hương vị và mô tả</p>
                    </div>
                    <p className="mt-3 text-[13px] leading-7 text-[rgba(240,235,224,0.56)]">
                      Những sản phẩm bên dưới được giữ trong một lưới tối, thoáng và thống nhất với homepage để người dùng thấy cùng một hệ thiết kế.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-4 pb-16 pt-10 sm:px-6 lg:px-8 lg:pb-20 lg:pt-14">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-[10px] uppercase tracking-[0.28em] text-[rgba(201,168,76,0.72)]">Bộ lọc</p>
            <h2 className="mt-3 text-[1.7rem] leading-[1.12] tracking-[-0.03em] text-[#f0ebe0] sm:text-[2rem]" style={{ fontFamily: 'var(--font-display)', fontWeight: 400 }}>
              Tìm nhanh sản phẩm bạn đang <em className="italic text-[#c9a84c]">quan tâm</em>.
            </h2>
          </div>

          <label className="flex w-full max-w-xl items-center gap-3 rounded-full border border-[rgba(201,168,76,0.18)] bg-[rgba(255,255,255,0.03)] px-4 py-3">
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

        <div className="mt-5 flex flex-wrap gap-2">
          {[{ slug: 'all', label: 'Tất cả' }, ...availableCategories].map((category) => {
            const isActive = selectedCategory === category.slug;

            return (
              <button
                key={category.slug}
                type="button"
                onClick={() => setSelectedCategory(category.slug)}
                className={`rounded-full px-4 py-2 text-[12px] transition ${
                  isActive
                    ? 'border border-[rgba(201,168,76,0.45)] bg-[rgba(201,168,76,0.14)] text-[#c9a84c]'
                    : 'border border-[rgba(240,235,224,0.12)] bg-[rgba(255,255,255,0.02)] text-[rgba(240,235,224,0.62)] hover:border-[rgba(201,168,76,0.3)] hover:text-[#c9a84c]'
                }`}
              >
                {category.label}
              </button>
            );
          })}
        </div>

        <div className="mt-10">
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4].map((key) => (
                <div key={key} className="overflow-hidden rounded-[24px] border border-[rgba(201,168,76,0.14)] bg-[rgba(255,255,255,0.03)]">
                  <div className="h-[260px] animate-pulse bg-[rgba(201,168,76,0.08)]" />
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
            <div className="rounded-[24px] border border-dashed border-[rgba(201,168,76,0.2)] bg-[rgba(255,255,255,0.03)] p-8 text-sm text-[rgba(240,235,224,0.6)]">
              {errorMessage}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-[rgba(201,168,76,0.2)] bg-[rgba(255,255,255,0.03)] p-8 text-sm text-[rgba(240,235,224,0.6)]">
              Không tìm thấy sản phẩm phù hợp với bộ lọc hiện tại.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
