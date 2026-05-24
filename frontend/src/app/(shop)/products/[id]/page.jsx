'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ChevronRight,
  Heart,
  Minus,
  Plus,
  Package,
  Share2,
  ShoppingCart,
  Star,
  Shield,
  Truck,
  RotateCcw,
  MapPin,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../../lib/api';
import useStore from '../../../../store/useStore';

// ─── Helpers ──────────────────────────────────────────────────
function formatVnd(v) {
  return Number(v || 0).toLocaleString('vi-VN');
}
function textOrFallback(v, fb = 'Đang cập nhật') {
  return String(v || '').trim() || fb;
}
function splitIngredients(v) {
  if (!v) return [];
  return String(v).split(/\n|;|•|,/).map((s) => s.trim()).filter(Boolean);
}
function resolveImageUrl(url) {
  if (!url) return '';
  const s = String(url);
  return s.includes('example.com') ? '' : s;
}
function buildGallery(product, steps) {
  const imgs = [
    product?.main_image_url,
    ...(steps || []).map((s) => s.step_image_url),
  ]
    .filter(Boolean)
    .map(String)
    .filter((u) => !u.includes('example.com'));
  return [...new Set(imgs)].slice(0, 4);
}
function getDisplayRating(product) {
  const seed = Number(product?.sales_count || product?.view_count || 0);
  return (4.5 + (seed % 6) * 0.1).toFixed(1);
}
function getDisplayReviews(product) {
  const seed = Number(product?.sales_count || product?.view_count || 0);
  return Math.max(18, (seed % 200) + 20);
}

// ─── Subcomponents ────────────────────────────────────────────

// Gold rule
function GoldRule({ my = 0 }) {
  return (
    <div style={{
      height: 1, margin: `${my}px 0`,
      background: 'linear-gradient(90deg,transparent,rgba(201,168,76,0.35) 20%,rgba(201,168,76,0.35) 80%,transparent)',
    }} />
  );
}

// Tab button
function Tab({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        position: 'relative',
        paddingBottom: 16,
        fontSize: 12,
        fontWeight: 500,
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        color: active ? '#c9a84c' : 'rgba(240,235,224,0.45)',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        transition: 'color 0.2s',
        fontFamily: 'var(--font-sans)',
      }}
    >
      {children}
      <span style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: 2, borderRadius: 1,
        background: active ? '#c9a84c' : 'transparent',
        transition: 'background 0.2s',
      }} />
    </button>
  );
}

// Trust badge
function TrustBadge({ Icon, title, sub }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 10,
      padding: '14px 16px',
      borderRadius: 14,
      border: '1px solid rgba(201,168,76,0.12)',
      background: 'rgba(201,168,76,0.04)',
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: '50%',
        background: 'rgba(201,168,76,0.12)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon size={15} style={{ color: '#c9a84c' }} />
      </div>
      <div>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#f0ebe0', marginBottom: 2, fontFamily: 'var(--font-sans)' }}>{title}</p>
        <p style={{ fontSize: 12, color: 'rgba(240,235,224,0.5)', fontFamily: 'var(--font-sans)' }}>{sub}</p>
      </div>
    </div>
  );
}

// Related product card
function RelatedCard({ product }) {
  const img = resolveImageUrl(product.main_image_url);
  return (
    <Link href={`/products/${product.id}`} style={{ display: 'block' }}>
      <article style={{
        borderRadius: 16,
        overflow: 'hidden',
        border: '1px solid rgba(201,168,76,0.1)',
        background: 'rgba(255,255,255,0.02)',
        transition: 'border-color 0.3s, transform 0.3s',
        cursor: 'pointer',
      }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'rgba(201,168,76,0.4)';
          e.currentTarget.style.transform = 'translateY(-4px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(201,168,76,0.1)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        {/* Image */}
        <div style={{
          aspectRatio: '1/1', overflow: 'hidden',
          background: 'linear-gradient(135deg,#1e1a10,#2a2318)',
          position: 'relative',
        }}>
          {img ? (
            <img src={img} alt={product.name_vi} loading="lazy"
              style={{ width: '100%', height: '100%', objectFit: 'cover',
                transition: 'transform 0.5s', }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
            />
          ) : (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(201,168,76,0.3)' }}>
              <Package size={28} />
            </div>
          )}
          {/* Category badge */}
          <span style={{
            position: 'absolute', top: 10, left: 10,
            fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase',
            background: 'rgba(12,11,9,0.72)', border: '1px solid rgba(201,168,76,0.22)',
            color: '#c9a84c', padding: '3px 10px', borderRadius: 999,
            backdropFilter: 'blur(6px)',
            fontFamily: 'var(--font-sans)',
          }}>
            {product.category_name_vi || product.category_slug}
          </span>
        </div>
        {/* Info */}
        <div style={{ padding: '14px 16px' }}>
          <h3 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 17, fontWeight: 400,
            color: '#f0ebe0', lineHeight: 1.3,
            margin: '0 0 10px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {product.name_vi}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <span style={{ fontSize: 17, fontWeight: 600, color: '#c9a84c', fontFamily: 'var(--font-sans)' }}>
              {formatVnd(product.price_vnd)}<span style={{ fontSize: 12, fontWeight: 400 }}>đ</span>
            </span>
            <span style={{
              width: 34, height: 34, borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'rgba(240,235,224,0.6)',
            }}>
              <ShoppingCart size={14} />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

// Loading skeleton
function DetailSkeleton() {
  const box = (w, h, mb = 0) => (
    <div style={{ width: w, height: h, borderRadius: 8, background: 'rgba(201,168,76,0.07)', marginBottom: mb, animation: 'skeleton-pulse 1.4s ease infinite' }} />
  );
  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 40px 80px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48 }}>
      <div>
        <div style={{ aspectRatio: '1/1', borderRadius: 20, background: 'rgba(201,168,76,0.07)', animation: 'skeleton-pulse 1.4s ease infinite' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginTop: 12 }}>
          {[1,2,3,4].map((n) => <div key={n} style={{ aspectRatio: '1/1', borderRadius: 12, background: 'rgba(201,168,76,0.07)', animation: 'skeleton-pulse 1.4s ease infinite' }} />)}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 8 }}>
        {box('60%', 12, 8)}{box('85%', 48, 8)}{box('40%', 36, 16)}{box('100%', 80, 8)}{box('100%', 44)}{box('100%', 44)}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────
export default function ProductDetailPage() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  const incrementCartCount = useStore((s) => s.incrementCartCount);

  const [detail,         setDetail]         = React.useState(null);
  const [related,        setRelated]        = React.useState([]);
  const [isLoading,      setIsLoading]      = React.useState(true);
  const [errorMsg,       setErrorMsg]       = React.useState('');
  const [qty,            setQty]            = React.useState(1);
  const [isAdding,       setIsAdding]       = React.useState(false);
  const [toast,          setToast]          = React.useState('');
  const [activeImg,      setActiveImg]      = React.useState(0);
  const [activeTab,      setActiveTab]      = React.useState('description');
  const [wishlisted,     setWishlisted]     = React.useState(false);

  // Fetch
  React.useEffect(() => {
    if (!id) return;
    let mounted = true;
    setIsLoading(true);
    setErrorMsg('');
    setActiveImg(0);

    Promise.all([api.get(`/products/${id}`), api.get('/products')])
      .then(([detailRes, listRes]) => {
        if (!mounted) return;
        const det = detailRes.data?.data || null;
        const prod = det?.product || null;
        const all = listRes.data?.data || [];
        setDetail(det);
        setRelated(
          all.filter((p) => p.id !== prod?.id && p.category_slug === prod?.category_slug).slice(0, 4)
        );
      })
      .catch(() => { if (mounted) setErrorMsg('Không thể tải thông tin sản phẩm.'); })
      .finally(() => { if (mounted) setIsLoading(false); });

    return () => { mounted = false; };
  }, [id]);

  // Toast auto-dismiss
  React.useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 2400);
    return () => clearTimeout(t);
  }, [toast]);

  const product       = detail?.product;
  const story         = detail?.story || null;
  const steps         = detail?.productionSteps || [];
  const ingredients   = React.useMemo(() => splitIngredients(product?.ingredients_vi), [product?.ingredients_vi]);
  const gallery       = React.useMemo(() => buildGallery(product, steps), [product, steps]);
  const rating        = product ? getDisplayRating(product) : '5.0';
  const reviewCount   = product ? getDisplayReviews(product) : 0;
  const hasDiscount   = product?.original_price_vnd && product.original_price_vnd > product.price_vnd;
  const discountPct   = hasDiscount ? Math.round((1 - product.price_vnd / product.original_price_vnd) * 100) : 0;
  const inStock       = (product?.stock ?? 1) > 0;

  async function handleAddToCart() {
    if (!product || isAdding) return;
    try {
      setIsAdding(true);
      await api.post('/cart', { product_id: product.id, quantity: qty });
      incrementCartCount(qty);
      setToast(`Đã thêm ${qty} sản phẩm vào giỏ hàng ✓`);
    } catch (err) {
      if (err?.response?.status === 401) { router.push('/login'); return; }
      setToast('Thêm vào giỏ thất bại');
    } finally {
      setIsAdding(false);
    }
  }

  // ── Render ─────────────────────────────────────────────────
  return (
    <>
      <div style={{ background: '#0c0b09', color: '#f0ebe0', minHeight: '100vh' }}>

        {isLoading ? <DetailSkeleton /> : errorMsg ? (
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '80px 40px', textAlign: 'center', color: 'rgba(240,235,224,0.5)', fontFamily: 'var(--font-sans)' }}>
            {errorMsg}
          </div>
        ) : !product ? (
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '80px 40px', textAlign: 'center', color: 'rgba(240,235,224,0.5)', fontFamily: 'var(--font-sans)' }}>
            Sản phẩm không tồn tại.
          </div>
        ) : (
          <>
            {/* ══ MAIN PRODUCT SECTION ══════════════════════ */}
            <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 40px 0' }}>

              {/* Breadcrumb */}
              <nav style={{
                display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap',
                fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase',
                color: 'rgba(240,235,224,0.35)', marginBottom: 32,
                fontFamily: 'var(--font-sans)',
              }}>
                <Link href="/" style={{ color: 'rgba(240,235,224,0.4)', transition: 'color 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#c9a84c'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(240,235,224,0.4)'}
                >Trang chủ</Link>
                <ChevronRight size={12} style={{ opacity: 0.4 }} />
                <Link href="/products" style={{ color: 'rgba(240,235,224,0.4)', transition: 'color 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#c9a84c'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(240,235,224,0.4)'}
                >Sản phẩm</Link>
                {product.category_name_vi && (
                  <>
                    <ChevronRight size={12} style={{ opacity: 0.4 }} />
                    <Link href="/products" style={{ color: 'rgba(240,235,224,0.4)', transition: 'color 0.2s' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#c9a84c'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(240,235,224,0.4)'}
                    >{product.category_name_vi}</Link>
                  </>
                )}
                <ChevronRight size={12} style={{ opacity: 0.4 }} />
                <span style={{ color: '#c9a84c', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {product.name_vi}
                </span>
              </nav>

              {/* ── 2-COLUMN LAYOUT ─────────────────────── */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',   /* ← key: equal 2 columns */
                gap: 56,
                alignItems: 'start',
              }}>

                {/* ── LEFT: Image gallery ──────────────── */}
                <div>
                  {/* Main image */}
                  <div style={{
                    position: 'relative',
                    aspectRatio: '1/1',             /* ← square main image like Figma */
                    borderRadius: 20,
                    overflow: 'hidden',
                    background: 'linear-gradient(135deg,#1e1a10,#2a2318)',
                    border: '1px solid rgba(201,168,76,0.12)',
                  }}>
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeImg}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ position: 'absolute', inset: 0 }}
                      >
                        {gallery[activeImg] || product.main_image_url ? (
                          <img
                            src={gallery[activeImg] || product.main_image_url}
                            alt={product.name_vi}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        ) : (
                          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(201,168,76,0.25)' }}>
                            <Package size={48} />
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>

                    {/* Category label */}
                    <div style={{
                      position: 'absolute', top: 14, left: 14, zIndex: 2,
                      fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase',
                      background: 'rgba(12,11,9,0.75)', border: '1px solid rgba(201,168,76,0.3)',
                      color: '#c9a84c', padding: '4px 12px', borderRadius: 999,
                      backdropFilter: 'blur(8px)',
                      fontFamily: 'var(--font-sans)',
                    }}>
                      {product.category_name_vi || product.category_slug || 'Đặc sản'}
                    </div>

                    {/* Image counter */}
                    {gallery.length > 1 && (
                      <div style={{
                        position: 'absolute', bottom: 14, right: 14, zIndex: 2,
                        fontSize: 11, color: 'rgba(240,235,224,0.7)',
                        background: 'rgba(12,11,9,0.72)', border: '1px solid rgba(255,255,255,0.1)',
                        padding: '4px 10px', borderRadius: 999,
                        backdropFilter: 'blur(6px)',
                        fontFamily: 'var(--font-sans)',
                      }}>
                        {activeImg + 1} / {gallery.length}
                      </div>
                    )}
                  </div>

                  {/* Thumbnail strip — 4 columns below */}
                  {gallery.length > 1 && (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: `repeat(${Math.min(gallery.length, 4)}, 1fr)`,
                      gap: 10,
                      marginTop: 12,
                    }}>
                      {gallery.map((img, i) => (
                        <button
                          key={`${img}-${i}`}
                          type="button"
                          onClick={() => setActiveImg(i)}
                          style={{
                            aspectRatio: '1/1',
                            overflow: 'hidden',
                            borderRadius: 12,
                            border: i === activeImg
                              ? '2px solid #c9a84c'
                              : '1px solid rgba(255,255,255,0.08)',
                            background: '#1a1810',
                            padding: 0, cursor: 'pointer',
                            transition: 'border-color 0.2s',
                            outline: i === activeImg ? '2px solid rgba(201,168,76,0.2)' : 'none',
                            outlineOffset: 2,
                          }}
                        >
                          <img
                            src={img}
                            alt={`${product.name_vi} ${i + 1}`}
                            loading="lazy"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => { e.currentTarget.closest('button').style.display = 'none'; }}
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* ── RIGHT: Product info ──────────────── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

                  {/* Tags row */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                    {[
                      product.category_name_vi || product.category_slug,
                      Number(product.sales_count || 0) > 5000 ? 'Best Seller' : null,
                      product.weight_gram ? `${product.weight_gram}${product.unit || 'g'}` : null,
                    ].filter(Boolean).map((tag) => (
                      <span key={tag} style={{
                        padding: '4px 12px', borderRadius: 999,
                        fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase',
                        border: tag === 'Best Seller'
                          ? '1px solid rgba(201,168,76,0.45)'
                          : '1px solid rgba(255,255,255,0.1)',
                        background: tag === 'Best Seller'
                          ? 'rgba(201,168,76,0.12)'
                          : 'rgba(255,255,255,0.03)',
                        color: tag === 'Best Seller' ? '#c9a84c' : 'rgba(240,235,224,0.65)',
                        fontFamily: 'var(--font-sans)',
                      }}>
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Product name */}
                  <h1 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(30px,3vw,44px)',
                    fontWeight: 300,
                    lineHeight: 1.1,
                    letterSpacing: '-0.02em',
                    color: '#f0ebe0',
                    margin: '0 0 6px',
                  }}>
                    {product.name_vi}
                  </h1>

                  {/* Brand sub-line */}
                  <p style={{
                    fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase',
                    color: 'rgba(240,235,224,0.35)', marginBottom: 16,
                    fontFamily: 'var(--font-sans)',
                  }}>
                    DAIF · PREMIUM VIETNAMESE SPECIALTIES
                  </p>

                  {/* Rating row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
                    {[1,2,3,4,5].map((s) => (
                      <Star key={s} size={14}
                        fill={s <= Math.round(rating) ? '#c9a84c' : 'none'}
                        stroke={s <= Math.round(rating) ? '#c9a84c' : 'rgba(201,168,76,0.3)'}
                      />
                    ))}
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#c9a84c', marginLeft: 4, fontFamily: 'var(--font-sans)' }}>{rating}</span>
                    <span style={{ fontSize: 13, color: 'rgba(240,235,224,0.4)', fontFamily: 'var(--font-sans)' }}>({reviewCount} đánh giá)</span>
                  </div>

                  <GoldRule my={0} />

                  {/* Price */}
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, margin: '20px 0' }}>
                    <span style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: 'clamp(28px,3vw,38px)',
                      fontWeight: 600, color: '#c9a84c',
                    }}>
                      {formatVnd(product.price_vnd)}
                      <span style={{ fontSize: 18, fontWeight: 400 }}> đ</span>
                    </span>
                    {hasDiscount && (
                      <>
                        <span style={{ fontSize: 18, color: 'rgba(240,235,224,0.3)', textDecoration: 'line-through', fontFamily: 'var(--font-sans)' }}>
                          {formatVnd(product.original_price_vnd)} đ
                        </span>
                        <span style={{
                          padding: '2px 10px', borderRadius: 999,
                          background: '#c9a84c', color: '#1a1208',
                          fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-sans)',
                        }}>
                          -{discountPct}%
                        </span>
                      </>
                    )}
                  </div>

                  {/* Short description */}
                  <p style={{
                    fontSize: 14, lineHeight: 1.8,
                    color: 'rgba(240,235,224,0.65)',
                    margin: '0 0 20px',
                    fontFamily: 'var(--font-sans)',
                  }}>
                    {textOrFallback(product.summary_vi, story?.culture_vi)}
                  </p>

                  {/* Stock status */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    marginBottom: 20, fontSize: 13, fontFamily: 'var(--font-sans)',
                  }}>
                    <span style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: inStock ? '#4ade80' : '#f87171',
                      flexShrink: 0,
                    }} />
                    <span style={{ color: inStock ? 'rgba(240,235,224,0.7)' : '#f87171' }}>
                      {inStock
                        ? `Còn hàng${product.stock ? ` — Giao hàng trong 2–3 ngày` : ''}`
                        : 'Tạm hết hàng'}
                    </span>
                  </div>

                  <GoldRule my={0} />

                  {/* Quantity + Add to cart */}
                  <div style={{ margin: '20px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {/* Qty label */}
                    <p style={{ fontSize: 13, color: 'rgba(240,235,224,0.55)', fontFamily: 'var(--font-sans)' }}>
                      Số lượng:
                    </p>

                    {/* Qty controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        display: 'inline-flex', alignItems: 'center',
                        border: '1px solid rgba(255,255,255,0.12)',
                        background: 'rgba(255,255,255,0.02)',
                        borderRadius: 999, padding: 4,
                      }}>
                        <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))}
                          style={{
                            width: 36, height: 36, borderRadius: '50%',
                            border: 'none', background: 'transparent',
                            color: '#f0ebe0', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'background 0.2s',
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <Minus size={14} />
                        </button>
                        <span style={{
                          minWidth: 40, textAlign: 'center',
                          fontSize: 15, fontWeight: 500,
                          color: '#f0ebe0', fontFamily: 'var(--font-sans)',
                        }}>
                          {qty}
                        </span>
                        <button type="button" onClick={() => setQty((q) => q + 1)}
                          style={{
                            width: 36, height: 36, borderRadius: '50%',
                            border: 'none', background: 'transparent',
                            color: '#f0ebe0', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'background 0.2s',
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    {/* CTA row */}
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      {/* Main CTA — full width gold */}
                      <button
                        type="button"
                        onClick={handleAddToCart}
                        disabled={isAdding || !inStock}
                        style={{
                          flex: 1, minWidth: 180,
                          height: 50,
                          background: isAdding ? 'rgba(201,168,76,0.7)' : '#c9a84c',
                          color: '#1a1208',
                          border: 'none', borderRadius: 999,
                          fontSize: 12, fontWeight: 700,
                          letterSpacing: '0.18em', textTransform: 'uppercase',
                          cursor: isAdding || !inStock ? 'not-allowed' : 'pointer',
                          opacity: !inStock ? 0.5 : 1,
                          transition: 'opacity 0.2s',
                          fontFamily: 'var(--font-sans)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        }}
                      >
                        <ShoppingCart size={15} />
                        {isAdding ? 'Đang thêm...' : 'Thêm vào giỏ hàng'}
                      </button>

                      {/* Wishlist */}
                      <button
                        type="button"
                        onClick={() => setWishlisted((w) => !w)}
                        aria-label="Yêu thích"
                        style={{
                          width: 50, height: 50, borderRadius: '50%',
                          border: `1px solid ${wishlisted ? 'rgba(201,168,76,0.5)' : 'rgba(255,255,255,0.12)'}`,
                          background: wishlisted ? 'rgba(201,168,76,0.12)' : 'transparent',
                          color: wishlisted ? '#c9a84c' : 'rgba(240,235,224,0.7)',
                          cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.25s',
                        }}
                      >
                        <Heart size={17} fill={wishlisted ? '#c9a84c' : 'none'} />
                      </button>

                      {/* Share */}
                      <button
                        type="button"
                        aria-label="Chia sẻ"
                        style={{
                          width: 50, height: 50, borderRadius: '50%',
                          border: '1px solid rgba(255,255,255,0.12)',
                          background: 'transparent',
                          color: 'rgba(240,235,224,0.7)',
                          cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.25s',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.35)'; e.currentTarget.style.color = '#c9a84c'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'rgba(240,235,224,0.7)'; }}
                      >
                        <Share2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Trust badges */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 8 }}>
                    <TrustBadge Icon={Shield}  title="Chất lượng cao cấp"  sub="100% nguyên liệu tự nhiên" />
                    <TrustBadge Icon={Truck}   title="Giao hàng nhanh"     sub="Miễn phí ship từ 500.000đ" />
                    <TrustBadge Icon={RotateCcw} title="Đổi trả dễ dàng"  sub="Hoàn tiền 100% nếu lỗi" />
                    <TrustBadge Icon={MapPin}  title="Nguồn gốc rõ ràng"   sub={textOrFallback(story?.origin_vi, 'Miền Trung Việt Nam')} />
                  </div>
                </div>
              </div>{/* end 2-col grid */}
            </div>

            {/* ══ TABS SECTION ═════════════════════════════ */}
            <div style={{ maxWidth: 1280, margin: '48px auto 0', padding: '0 40px' }}>
              <GoldRule />

              {/* Tab bar */}
              <div style={{
                display: 'flex', gap: 32,
                overflowX: 'auto', borderBottom: '1px solid rgba(255,255,255,0.07)',
                marginBottom: 0,
                scrollbarWidth: 'none',
              }}>
                {[
                  { key: 'description', label: 'Mô tả chi tiết' },
                  { key: 'ingredients', label: 'Thành phần' },
                  { key: 'storage',     label: 'Bảo quản' },
                  { key: 'reviews',     label: 'Đánh giá' },
                ].map((tab) => (
                  <Tab key={tab.key} active={activeTab === tab.key} onClick={() => setActiveTab(tab.key)}>
                    {tab.label}
                  </Tab>
                ))}
              </div>

              {/* Tab content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  style={{ padding: '32px 0 48px' }}
                >
                  {activeTab === 'description' && (
                    <div style={{ maxWidth: 800, display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <p style={{ fontSize: 15, lineHeight: 1.85, color: 'rgba(240,235,224,0.78)', fontFamily: 'var(--font-sans)' }}>
                        {textOrFallback(product.summary_vi, story?.culture_vi)}
                      </p>
                      {story?.culture_vi && (
                        <p style={{ fontSize: 15, lineHeight: 1.85, color: 'rgba(240,235,224,0.78)', fontFamily: 'var(--font-sans)' }}>
                          {story.culture_vi}
                        </p>
                      )}
                      {story?.origin_vi && (
                        <p style={{ fontSize: 15, lineHeight: 1.85, color: 'rgba(240,235,224,0.78)', fontFamily: 'var(--font-sans)' }}>
                          <strong style={{ color: '#f0ebe0' }}>Nguồn gốc:</strong> {story.origin_vi}
                        </p>
                      )}
                    </div>
                  )}

                  {activeTab === 'ingredients' && (
                    <div style={{ maxWidth: 700 }}>
                      <h3 style={{ fontSize: 16, fontWeight: 600, color: '#f0ebe0', marginBottom: 16, fontFamily: 'var(--font-sans)' }}>
                        Thành phần chính
                      </h3>
                      {ingredients.length > 0 ? (
                        <ul style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                          {ingredients.map((item, i) => (
                            <li key={i} style={{
                              display: 'flex', alignItems: 'flex-start', gap: 12,
                              fontSize: 14, lineHeight: 1.7, color: 'rgba(240,235,224,0.75)',
                              fontFamily: 'var(--font-sans)',
                            }}>
                              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#c9a84c', marginTop: 7, flexShrink: 0 }} />
                              {item}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p style={{ fontSize: 14, color: 'rgba(240,235,224,0.5)', fontFamily: 'var(--font-sans)' }}>Đang cập nhật thành phần.</p>
                      )}
                      {product.allergens_vi && (
                        <div style={{
                          padding: '12px 16px', borderRadius: 12,
                          border: '1px solid rgba(201,168,76,0.25)',
                          background: 'rgba(201,168,76,0.07)',
                          fontSize: 13, color: '#c9a84c', fontFamily: 'var(--font-sans)',
                        }}>
                          <strong style={{ color: '#f0ebe0' }}>Lưu ý dị ứng:</strong> {product.allergens_vi}
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'storage' && (
                    <div style={{ maxWidth: 700, display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <p style={{ fontSize: 14, lineHeight: 1.8, color: 'rgba(240,235,224,0.72)', fontFamily: 'var(--font-sans)' }}>
                        {textOrFallback(product.preservation_vi)}
                      </p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        {[
                          { label: 'Bảo quản',      value: textOrFallback(product.preservation_vi) },
                          { label: 'Hạn sử dụng',   value: textOrFallback(product.shelf_life_vi) },
                        ].map((item) => (
                          <div key={item.label} style={{
                            padding: '16px', borderRadius: 14,
                            border: '1px solid rgba(255,255,255,0.07)',
                            background: 'rgba(255,255,255,0.02)',
                          }}>
                            <p style={{ fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.65)', marginBottom: 8, fontFamily: 'var(--font-sans)' }}>
                              {item.label}
                            </p>
                            <p style={{ fontSize: 14, lineHeight: 1.7, color: 'rgba(240,235,224,0.72)', fontFamily: 'var(--font-sans)' }}>
                              {item.value}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'reviews' && (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(240,235,224,0.35)', fontFamily: 'var(--font-sans)', fontSize: 14 }}>
                      Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá sản phẩm này!
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* ══ RELATED PRODUCTS ═════════════════════════ */}
            {related.length > 0 && (
              <section style={{
                maxWidth: 1280, margin: '0 auto',
                padding: '0 40px 80px',
              }}>
                <GoldRule my={0} />
                <div style={{ padding: '40px 0 28px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
                  <div>
                    <p style={{
                      fontSize: 10, letterSpacing: '0.28em', textTransform: 'uppercase',
                      color: 'rgba(201,168,76,0.7)', marginBottom: 8, fontFamily: 'var(--font-sans)',
                    }}>
                      Khám phá thêm
                    </p>
                    <h2 style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 'clamp(24px,2.5vw,34px)',
                      fontWeight: 300, color: '#f0ebe0', margin: 0,
                    }}>
                      Sản Phẩm Liên Quan
                    </h2>
                    <p style={{ fontSize: 13, color: 'rgba(240,235,224,0.4)', marginTop: 6, fontFamily: 'var(--font-sans)' }}>
                      Khám phá thêm các sản phẩm đặc biệt khác
                    </p>
                  </div>
                  <Link href="/products" style={{
                    fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase',
                    color: 'rgba(240,235,224,0.45)', transition: 'color 0.2s',
                    fontFamily: 'var(--font-sans)',
                  }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#c9a84c'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(240,235,224,0.45)'}
                  >
                    Xem toàn bộ →
                  </Link>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                  gap: 20,
                }}>
                  {related.map((p) => <RelatedCard key={p.id} product={p} />)}
                </div>
              </section>
            )}
          </>
        )}
      </div>

      {/* ── Toast notification ─────────────────────────── */}
      <div style={{
        position: 'fixed', bottom: 24, right: 24, zIndex: 80,
        transform: toast ? 'translateY(0)' : 'translateY(12px)',
        opacity: toast ? 1 : 0,
        pointerEvents: toast ? 'auto' : 'none',
        transition: 'all 0.3s cubic-bezier(0.22,1,0.36,1)',
      }}>
        <div style={{
          padding: '12px 20px', borderRadius: 14,
          background: '#131108',
          border: '1px solid rgba(201,168,76,0.25)',
          boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
          fontSize: 13, color: '#f0ebe0',
          fontFamily: 'var(--font-sans)',
        }}>
          {toast}
        </div>
      </div>
    </>
  );
}
