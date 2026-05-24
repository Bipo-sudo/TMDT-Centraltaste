'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, Search, X, ChevronDown } from 'lucide-react';
import api from '../../../lib/api';
import ProductCard from '../../../components/shop/ProductCard';

// ─── Categories ───────────────────────────────────────────────
const CATEGORIES = [
  { slug: 'all',              label: 'Tất cả' },
  { slug: 'mat-ong-siro',     label: 'Mật ong & Siro' },
  { slug: 'dau-gia-vi',       label: 'Dầu & Gia vị' },
  { slug: 'cafe-tra',         label: 'Café & Trà' },
  { slug: 'banh-keo-so-co-la',label: 'Bánh kẹo' },
  { slug: 'nuoc-sot-tuong',   label: 'Nước sốt & Tương' },
  { slug: 'hop-qua',          label: 'Hộp quà' },
  { slug: 'ruou-do-uong',     label: 'Rượu & Đồ uống' },
];

const SORT_OPTIONS = [
  { value: 'default',    label: 'Mặc định' },
  { value: 'price-asc',  label: 'Giá tăng dần' },
  { value: 'price-desc', label: 'Giá giảm dần' },
  { value: 'name-asc',   label: 'Tên A → Z' },
];

const PAGE_SIZE = 12;

// ─── Animation variants ───────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.06 } },
};

// ─── Card skeleton ────────────────────────────────────────────
function CardSkeleton() {
  return (
    <div style={{
      borderRadius: 16,
      overflow: 'hidden',
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(201,168,76,0.08)',
    }}>
      <div style={{
        aspectRatio: '3/4',
        background: 'rgba(201,168,76,0.06)',
        animation: 'skeleton-pulse 1.4s ease infinite',
      }} />
      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ height: 10, width: '50%', borderRadius: 4, background: 'rgba(201,168,76,0.08)', animation: 'skeleton-pulse 1.4s ease infinite' }} />
        <div style={{ height: 16, width: '80%', borderRadius: 4, background: 'rgba(201,168,76,0.08)', animation: 'skeleton-pulse 1.4s ease infinite' }} />
        <div style={{ height: 12, width: '35%', borderRadius: 4, background: 'rgba(201,168,76,0.08)', animation: 'skeleton-pulse 1.4s ease infinite' }} />
        <div style={{ height: 36, borderRadius: 999, background: 'rgba(201,168,76,0.06)', animation: 'skeleton-pulse 1.4s ease infinite', marginTop: 4 }} />
      </div>
    </div>
  );
}

// ─── Sort dropdown ────────────────────────────────────────────
function SortDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const current = SORT_OPTIONS.find((o) => o.value === value);

  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '9px 16px',
          borderRadius: 999,
          border: '1px solid rgba(201,168,76,0.22)',
          background: 'rgba(255,255,255,0.03)',
          color: 'rgba(240,235,224,0.75)',
          fontSize: 13, cursor: 'pointer', transition: 'all 0.2s',
          fontFamily: 'var(--font-sans)',
          whiteSpace: 'nowrap',
        }}
      >
        {current?.label}
        <ChevronDown size={14} style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: 0,
              minWidth: 180, zIndex: 50,
              background: '#1a1810',
              border: '1px solid rgba(201,168,76,0.2)',
              borderRadius: 14,
              overflow: 'hidden',
              boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
            }}
          >
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false); }}
                style={{
                  display: 'block', width: '100%',
                  padding: '11px 16px',
                  textAlign: 'left',
                  fontSize: 13,
                  color: value === opt.value ? '#c9a84c' : 'rgba(240,235,224,0.65)',
                  background: value === opt.value ? 'rgba(201,168,76,0.08)' : 'transparent',
                  border: 'none', cursor: 'pointer',
                  transition: 'all 0.15s',
                  fontFamily: 'var(--font-sans)',
                }}
                onMouseEnter={(e) => { if (value !== opt.value) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                onMouseLeave={(e) => { if (value !== opt.value) e.currentTarget.style.background = 'transparent'; }}
              >
                {opt.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Gold Rule ────────────────────────────────────────────────
function GoldRule() {
  return (
    <div style={{
      height: 1,
      background: 'linear-gradient(90deg,transparent,rgba(201,168,76,0.35) 30%,rgba(201,168,76,0.35) 70%,transparent)',
    }} />
  );
}

// ─── Main page ────────────────────────────────────────────────
export default function ProductsPage() {
  const [products,         setProducts]         = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy,           setSortBy]           = useState('default');
  const [searchQuery,      setSearchQuery]      = useState('');
  const [isLoading,        setIsLoading]        = useState(true);
  const [errorMessage,     setErrorMessage]     = useState('');
  const [visibleCount,     setVisibleCount]     = useState(PAGE_SIZE);

  // Fetch products
  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    setErrorMessage('');

    api.get('/products')
      .then((res) => { if (mounted) setProducts(res.data?.data || []); })
      .catch(() => { if (mounted) setErrorMessage('Không thể tải danh sách sản phẩm.'); })
      .finally(() => { if (mounted) setIsLoading(false); });

    return () => { mounted = false; };
  }, []);

  // Reset visible count on filter change
  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [selectedCategory, sortBy, searchQuery]);

  // Filter + sort
  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      const matchCat  = selectedCategory === 'all' || p.category_slug === selectedCategory;
      const matchSearch = !searchQuery || p.name_vi?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });

    if (sortBy === 'price-asc')  list = [...list].sort((a, b) => a.price_vnd - b.price_vnd);
    if (sortBy === 'price-desc') list = [...list].sort((a, b) => b.price_vnd - a.price_vnd);
    if (sortBy === 'name-asc')   list = [...list].sort((a, b) => a.name_vi?.localeCompare(b.name_vi));

    return list;
  }, [products, selectedCategory, sortBy, searchQuery]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = filtered.length > visibleCount;

  return (
    <>
      {/* ── Hero banner ────────────────────────────────────── */}
      <section style={{
        position: 'relative',
        minHeight: 340,
        display: 'flex',
        alignItems: 'flex-end',
        overflow: 'hidden',
        background: '#0c0b09',
      }}>
        {/* Background layers */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg,#1e1a0e 0%,#0c0b09 55%,#131008 100%)',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(201,168,76,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(201,168,76,0.05) 1px,transparent 1px)',
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%,black 20%,transparent 80%)',
        }} />
        <div style={{
          position: 'absolute', top: '40%', left: '50%',
          transform: 'translate(-50%,-50%)',
          width: 600, height: 300,
          background: 'radial-gradient(ellipse,rgba(201,168,76,0.13) 0%,transparent 68%)',
          pointerEvents: 'none',
        }} />

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: 'relative', zIndex: 2,
            width: '100%',
            maxWidth: 1280, margin: '0 auto',
            padding: '72px 40px 48px',
          }}
        >
          <p style={{
            fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase',
            color: 'rgba(201,168,76,0.7)', marginBottom: 16,
            fontFamily: 'var(--font-sans)',
          }}>
            DAIF · CentralTaste · Đặc sản miền Trung
          </p>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(36px,5vw,60px)',
            fontWeight: 300,
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
            color: '#f0ebe0',
            margin: '0 0 16px',
          }}>
            Bộ sưu tập <em style={{ fontStyle: 'italic', color: '#c9a84c' }}>Đặc sản</em>
          </h1>
          <p style={{
            fontSize: 15, lineHeight: 1.7,
            color: 'rgba(240,235,224,0.5)',
            maxWidth: 480,
            fontFamily: 'var(--font-sans)',
          }}>
            Tuyển chọn từ làng nghề và vùng nguyên liệu đặc trưng — rõ nguồn gốc, đúng hương vị.
          </p>

          {/* Breadcrumb */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            marginTop: 32,
            fontSize: 12, color: 'rgba(240,235,224,0.3)',
            fontFamily: 'var(--font-sans)',
          }}>
            <Link href="/" style={{ color: 'rgba(240,235,224,0.4)', transition: 'color 0.2s' }}>Trang chủ</Link>
            <span>/</span>
            <span style={{ color: '#c9a84c' }}>Sản phẩm</span>
          </div>
        </motion.div>
      </section>

      {/* ── Filter bar ─────────────────────────────────────── */}
      <div style={{
        position: 'sticky', top: 60, zIndex: 40,
        background: 'rgba(12,11,9,0.95)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(201,168,76,0.12)',
      }}>
        <div style={{
          maxWidth: 1280, margin: '0 auto',
          padding: '0 40px',
          display: 'flex', alignItems: 'center',
          gap: 16, height: 64,
          overflowX: 'auto',
        }}>
          {/* Category pills */}
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.slug;
              return (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => setSelectedCategory(cat.slug)}
                  style={{
                    whiteSpace: 'nowrap',
                    padding: '7px 16px',
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 400,
                    letterSpacing: '0.06em',
                    border: active ? '1px solid #c9a84c' : '1px solid rgba(255,255,255,0.1)',
                    background: active ? '#c9a84c' : 'rgba(255,255,255,0.02)',
                    color: active ? '#1a1208' : 'rgba(240,235,224,0.7)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Spacer */}
          <div style={{ flex: 1, minWidth: 24 }} />

          {/* Search */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '7px 14px',
            borderRadius: 999,
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.03)',
            flexShrink: 0,
          }}>
            <Search size={14} style={{ color: 'rgba(201,168,76,0.5)', flexShrink: 0 }} />
            <input
              type="search"
              placeholder="Tìm sản phẩm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'transparent', border: 'none', outline: 'none',
                fontSize: 13, color: '#f0ebe0', width: 160,
                fontFamily: 'var(--font-sans)',
              }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(240,235,224,0.4)', display: 'flex' }}>
                <X size={13} />
              </button>
            )}
          </div>

          {/* Sort */}
          <SortDropdown value={sortBy} onChange={setSortBy} />
        </div>
      </div>

      {/* ── Products grid ───────────────────────────────────── */}
      <div style={{ background: '#0c0b09', minHeight: '60vh' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 40px 80px' }}>

          {/* Result count + active filter */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 28, flexWrap: 'wrap', gap: 12,
          }}>
            <div>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(22px,2.5vw,30px)',
                fontWeight: 300,
                color: '#f0ebe0',
                margin: '0 0 4px',
              }}>
                {selectedCategory === 'all'
                  ? 'Tất cả sản phẩm'
                  : CATEGORIES.find((c) => c.slug === selectedCategory)?.label}
              </h2>
              <p style={{ fontSize: 13, color: 'rgba(240,235,224,0.4)', fontFamily: 'var(--font-sans)' }}>
                {isLoading ? 'Đang tải...' : `${filtered.length} sản phẩm`}
              </p>
            </div>

            {/* Active filters tags */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {selectedCategory !== 'all' && (
                <button
                  onClick={() => setSelectedCategory('all')}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '5px 12px', borderRadius: 999,
                    border: '1px solid rgba(201,168,76,0.3)',
                    background: 'rgba(201,168,76,0.08)',
                    color: '#c9a84c', fontSize: 12, cursor: 'pointer',
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  {CATEGORIES.find((c) => c.slug === selectedCategory)?.label}
                  <X size={11} />
                </button>
              )}
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '5px 12px', borderRadius: 999,
                    border: '1px solid rgba(201,168,76,0.3)',
                    background: 'rgba(201,168,76,0.08)',
                    color: '#c9a84c', fontSize: 12, cursor: 'pointer',
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  "{searchQuery}" <X size={11} />
                </button>
              )}
            </div>
          </div>

          <GoldRule />

          <div style={{ marginTop: 32 }}>
            {isLoading ? (
              /* Skeleton grid */
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: 24,
              }}>
                {[1,2,3,4,5,6,7,8].map((n) => <CardSkeleton key={n} />)}
              </div>

            ) : errorMessage ? (
              <div style={{
                textAlign: 'center', padding: '64px 24px',
                color: 'rgba(240,235,224,0.45)',
                fontFamily: 'var(--font-sans)', fontSize: 14,
              }}>
                {errorMessage}
              </div>

            ) : filtered.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '80px 24px',
                color: 'rgba(240,235,224,0.4)',
              }}>
                <p style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 24, fontWeight: 300,
                  color: 'rgba(240,235,224,0.6)',
                  marginBottom: 8,
                }}>
                  Không tìm thấy sản phẩm
                </p>
                <p style={{ fontSize: 13, fontFamily: 'var(--font-sans)' }}>
                  Thử thay đổi bộ lọc hoặc từ khoá tìm kiếm.
                </p>
                <button
                  onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
                  style={{
                    marginTop: 20, padding: '9px 22px', borderRadius: 999,
                    background: '#c9a84c', color: '#1a1208',
                    fontSize: 12, fontWeight: 500,
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    border: 'none', cursor: 'pointer',
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  Xem tất cả
                </button>
              </div>

            ) : (
              <>
                {/* ── Product grid ── */}
                <motion.div
                  variants={stagger}
                  initial="hidden"
                  animate="show"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                    gap: 24,
                  }}
                >
                  <AnimatePresence mode="popLayout">
                    {visible.map((product) => (
                      <motion.div
                        key={product.id}
                        variants={fadeUp}
                        layout
                        exit={{ opacity: 0, scale: 0.95 }}
                      >
                        <ProductCard product={product} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>

                {/* ── Load more ── */}
                {hasMore && (
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: 48 }}>
                    <button
                      onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        padding: '12px 32px', borderRadius: 999,
                        border: '1px solid rgba(201,168,76,0.35)',
                        background: 'transparent',
                        color: 'rgba(240,235,224,0.75)',
                        fontSize: 12, letterSpacing: '0.15em', textTransform: 'uppercase',
                        cursor: 'pointer', transition: 'all 0.25s',
                        fontFamily: 'var(--font-sans)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#c9a84c';
                        e.currentTarget.style.color = '#c9a84c';
                        e.currentTarget.style.background = 'rgba(201,168,76,0.06)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(201,168,76,0.35)';
                        e.currentTarget.style.color = 'rgba(240,235,224,0.75)';
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      Xem thêm ({filtered.length - visibleCount} sản phẩm)
                      <ChevronDown size={15} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
