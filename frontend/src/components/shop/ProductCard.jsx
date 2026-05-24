'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star, ShoppingBag } from 'lucide-react';
import useStore from '../../store/useStore';

// ─── Helpers ──────────────────────────────────────────────────
function formatVnd(v) {
  return Number(v || 0).toLocaleString('vi-VN');
}

function getDisplayRating(product) {
  const seed = Number(product?.sales_count || product?.view_count || 0);
  return (4.5 + (seed % 6) * 0.1).toFixed(1);
}

function getDisplayReviews(product) {
  const seed = Number(product?.sales_count || product?.view_count || 0);
  return Math.max(12, (seed % 180) + 18);
}

// ─── Product Card ─────────────────────────────────────────────
export default function ProductCard({ product }) {
  const addToCart   = useStore((s) => s.addToCart);
  const [imgFailed, setImgFailed] = useState(false);
  const [added,     setAdded]     = useState(false);
  const [hovered,   setHovered]   = useState(false);

  const rating      = getDisplayRating(product);
  const reviewCount = getDisplayReviews(product);
  const primaryTag  = product.category_name_vi || product.category_slug || 'Đặc sản';
  const isBestSeller = Number(product.sales_count || 0) > 5000;
  const hasDiscount = product.original_price_vnd && product.original_price_vnd > product.price_vnd;
  const discountPct = hasDiscount
    ? Math.round((1 - product.price_vnd / product.original_price_vnd) * 100)
    : 0;

  function handleAddToCart(e) {
    e.preventDefault();
    e.stopPropagation();
    if (addToCart) addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 16,
        overflow: 'hidden',
        background: 'rgba(255,255,255,0.02)',
        border: `1px solid ${hovered ? 'rgba(201,168,76,0.35)' : 'rgba(201,168,76,0.1)'}`,
        transition: 'border-color 0.3s, transform 0.35s cubic-bezier(0.22,1,0.36,1), box-shadow 0.35s',
        transform: hovered ? 'translateY(-5px)' : 'translateY(0)',
        boxShadow: hovered
          ? '0 16px 48px rgba(0,0,0,0.45), 0 0 0 1px rgba(201,168,76,0.15)'
          : '0 2px 12px rgba(0,0,0,0.2)',
        cursor: 'pointer',
        height: '100%',
      }}
    >
      {/* ── Image ─────────────────────────────────────────── */}
      <Link href={`/products/${product.id}`} style={{ display: 'block', flexShrink: 0 }}>
        <div style={{
          position: 'relative',
          aspectRatio: '3/4',          /* ← key fix: portrait ratio like Figma */
          overflow: 'hidden',
          background: 'linear-gradient(135deg,#1e1a10,#2a2318)',
        }}>
          {/* Product image */}
          {product.main_image_url && !imgFailed ? (
            <img
              src={product.main_image_url}
              alt={product.name_vi}
              loading="lazy"
              onError={() => setImgFailed(true)}
              style={{
                width: '100%', height: '100%', objectFit: 'cover',
                transition: 'transform 0.6s cubic-bezier(0.22,1,0.36,1)',
                transform: hovered ? 'scale(1.06)' : 'scale(1)',
              }}
            />
          ) : (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 10, color: 'rgba(201,168,76,0.3)',
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" aria-hidden="true">
                <rect x="2" y="7" width="20" height="14" rx="2"/>
                <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
              </svg>
              <span style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', opacity: 0.7 }}>
                Ảnh sản phẩm
              </span>
            </div>
          )}

          {/* Top-left: category + bestseller tags */}
          <div style={{
            position: 'absolute', top: 10, left: 10,
            display: 'flex', flexDirection: 'column', gap: 6, zIndex: 2,
          }}>
            <span style={{
              display: 'inline-flex',
              padding: '3px 10px', borderRadius: 999,
              fontSize: 10, fontWeight: 400, letterSpacing: '0.12em',
              background: 'rgba(12,11,9,0.7)',
              border: '1px solid rgba(201,168,76,0.25)',
              color: '#c9a84c',
              backdropFilter: 'blur(6px)',
              fontFamily: 'var(--font-sans)',
            }}>
              {primaryTag}
            </span>
            {isBestSeller && (
              <span style={{
                display: 'inline-flex',
                padding: '3px 10px', borderRadius: 999,
                fontSize: 10, letterSpacing: '0.12em',
                background: 'rgba(201,168,76,0.18)',
                border: '1px solid rgba(201,168,76,0.4)',
                color: '#e8d49a',
                backdropFilter: 'blur(6px)',
                fontFamily: 'var(--font-sans)',
              }}>
                Best Seller
              </span>
            )}
          </div>

          {/* Top-right: discount badge */}
          {hasDiscount && (
            <div style={{
              position: 'absolute', top: 10, right: 10, zIndex: 2,
              background: '#c9a84c', color: '#1a1208',
              borderRadius: 999, padding: '3px 9px',
              fontSize: 10, fontWeight: 700,
              fontFamily: 'var(--font-sans)',
            }}>
              -{discountPct}%
            </div>
          )}

          {/* Hover overlay — show on desktop */}
          <div style={{
            position: 'absolute', inset: 0, zIndex: 3,
            background: 'linear-gradient(180deg,transparent 40%,rgba(0,0,0,0.78) 100%)',
            display: 'flex', alignItems: 'flex-end',
            padding: '0 14px 14px',
            opacity: hovered ? 1 : 0,
            transition: 'opacity 0.3s',
          }}>
            <button
              type="button"
              onClick={handleAddToCart}
              style={{
                width: '100%',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '10px 16px', borderRadius: 10,
                background: added ? 'rgba(201,168,76,0.9)' : '#c9a84c',
                color: '#1a1208',
                fontSize: 11, fontWeight: 600,
                letterSpacing: '0.14em', textTransform: 'uppercase',
                border: 'none', cursor: 'pointer',
                transition: 'all 0.25s',
                fontFamily: 'var(--font-sans)',
              }}
            >
              <ShoppingBag size={13} aria-hidden="true" />
              {added ? '✓ Đã thêm vào giỏ' : 'Thêm vào giỏ hàng'}
            </button>
          </div>
        </div>
      </Link>

      {/* ── Info block ────────────────────────────────────── */}
      <Link
        href={`/products/${product.id}`}
        style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '14px 16px 16px' }}
      >
        {/* Region / origin */}
        {product.region && (
          <p style={{
            fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase',
            color: 'rgba(201,168,76,0.6)', marginBottom: 5,
            fontFamily: 'var(--font-sans)',
          }}>
            {product.region}
          </p>
        )}

        {/* Product name */}
        <h3 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 17, fontWeight: 400,
          lineHeight: 1.25, margin: '0 0 8px',
          color: hovered ? '#c9a84c' : '#f0ebe0',
          transition: 'color 0.25s',
        }}>
          {product.name_vi}
        </h3>

        {/* Rating */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4,
          marginBottom: 10, flexWrap: 'wrap',
        }}>
          {[1,2,3,4,5].map((s) => (
            <Star
              key={s}
              size={11}
              fill={s <= Math.round(rating) ? '#c9a84c' : 'none'}
              stroke={s <= Math.round(rating) ? '#c9a84c' : 'rgba(201,168,76,0.3)'}
              aria-hidden="true"
            />
          ))}
          <span style={{ fontSize: 11, color: '#c9a84c', fontWeight: 600, marginLeft: 4, fontFamily: 'var(--font-sans)' }}>
            {rating}
          </span>
          <span style={{ fontSize: 11, color: 'rgba(240,235,224,0.35)', fontFamily: 'var(--font-sans)' }}>
            ({reviewCount})
          </span>
        </div>

        {/* Price row — pinned to bottom */}
        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
          <span style={{
            fontSize: 18, fontWeight: 600,
            color: '#c9a84c',
            fontFamily: 'var(--font-sans)',
          }}>
            {formatVnd(product.price_vnd)}
            <span style={{ fontSize: 13, fontWeight: 400 }}>đ</span>
          </span>
          {hasDiscount && (
            <span style={{
              fontSize: 12, color: 'rgba(240,235,224,0.3)',
              textDecoration: 'line-through',
              fontFamily: 'var(--font-sans)',
            }}>
              {formatVnd(product.original_price_vnd)}đ
            </span>
          )}
        </div>
      </Link>

      {/* ── Mobile add-to-cart (always visible) ──────────── */}
      <div style={{ padding: '0 16px 14px' }}>
        <button
          type="button"
          onClick={handleAddToCart}
          style={{
            width: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            padding: '9px', borderRadius: 999,
            border: `1px solid ${added ? '#c9a84c' : 'rgba(201,168,76,0.2)'}`,
            background: added ? 'rgba(201,168,76,0.15)' : 'transparent',
            color: added ? '#c9a84c' : 'rgba(240,235,224,0.55)',
            fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase',
            cursor: 'pointer', transition: 'all 0.25s',
            fontFamily: 'var(--font-sans)',
          }}
          onMouseEnter={(e) => {
            if (!added) {
              e.currentTarget.style.borderColor = 'rgba(201,168,76,0.5)';
              e.currentTarget.style.color = '#c9a84c';
              e.currentTarget.style.background = 'rgba(201,168,76,0.08)';
            }
          }}
          onMouseLeave={(e) => {
            if (!added) {
              e.currentTarget.style.borderColor = 'rgba(201,168,76,0.2)';
              e.currentTarget.style.color = 'rgba(240,235,224,0.55)';
              e.currentTarget.style.background = 'transparent';
            }
          }}
        >
          <ShoppingBag size={12} aria-hidden="true" />
          {added ? '✓ Đã thêm' : '+ Thêm vào giỏ'}
        </button>
      </div>
    </article>
  );
}
