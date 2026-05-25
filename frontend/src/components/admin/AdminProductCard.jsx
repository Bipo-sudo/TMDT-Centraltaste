'use client';

/**
 * components/admin/AdminProductCard.jsx
 *
 * Card sản phẩm dùng trong trang /admin/products.
 * Props:
 *   product     — object từ API
 *   onEdit      — (product) => void
 *   onDelete    — (id) => void
 *   selected    — boolean (bulk select)
 *   onSelect    — (id, checked) => void
 *   dragHandleProps — spread vào drag handle (dnd-kit)
 *   isDragging  — boolean
 */

import Link from 'next/link';
import { GripVertical, PencilLine, Trash2, Eye, EyeOff } from 'lucide-react';

function fmtVnd(v) {
  return Number(v || 0).toLocaleString('vi-VN');
}

/* Dot màu theo stock */
function StockDot({ stock }) {
  const n = Number(stock || 0);
  if (n === 0)  return <span className="h-[7px] w-[7px] rounded-full bg-[rgba(248,113,113,0.75)] shrink-0" title="Hết kho" />;
  if (n <= 10)  return <span className="h-[7px] w-[7px] rounded-full bg-[rgba(250,204,21,0.75)] shrink-0"  title="Sắp hết" />;
  return              <span className="h-[7px] w-[7px] rounded-full bg-[rgba(134,239,172,0.7)] shrink-0"  title="Còn hàng" />;
}

export default function AdminProductCard({
  product,
  onEdit,
  onDelete,
  selected = false,
  onSelect,
  dragHandleProps = {},
  isDragging = false,
}) {
  const stock = Number(product.stock || 0);
  const isOutOfStock = stock === 0;

  return (
    <article
      className={[
        'group relative flex flex-col overflow-hidden rounded-[18px] border',
        'bg-[rgba(255,255,255,0.025)] backdrop-blur-sm',
        'transition-all duration-300',
        isDragging
          ? 'rotate-[1.5deg] scale-[1.02] border-[rgba(201,168,76,0.55)] shadow-[0_20px_50px_rgba(0,0,0,0.4)] opacity-90 z-50'
          : selected
          ? 'border-[rgba(201,168,76,0.45)] shadow-[0_0_0_1px_rgba(201,168,76,0.2)]'
          : isOutOfStock
          ? 'border-[rgba(248,113,113,0.18)] hover:border-[rgba(248,113,113,0.35)]'
          : 'border-[rgba(201,168,76,0.12)] hover:-translate-y-[4px] hover:border-[rgba(201,168,76,0.4)]',
      ].join(' ')}
    >
      {/* ── Image area ── */}
      <div
        className={[
          'relative aspect-[4/3] overflow-hidden',
          isOutOfStock ? 'bg-[linear-gradient(135deg,#1d1010,#261515)]' : 'bg-[linear-gradient(135deg,#1c1810,#231e13)]',
        ].join(' ')}
      >
        {/* Checkbox — top-left */}
        <button
          type="button"
          aria-label={selected ? 'Bỏ chọn' : 'Chọn sản phẩm'}
          onClick={() => onSelect?.(product.id, !selected)}
          className={[
            'absolute left-[10px] top-[10px] z-10 flex h-[18px] w-[18px] items-center justify-center rounded-[4px] border',
            'transition-all duration-150',
            selected
              ? 'border-[rgba(201,168,76,0.7)] bg-[rgba(201,168,76,0.2)]'
              : 'border-[rgba(240,235,224,0.2)] bg-[rgba(0,0,0,0.35)] opacity-0 group-hover:opacity-100',
          ].join(' ')}
        >
          {selected && (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 5l2 2 4-4" stroke="var(--gold)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>

        {/* Category tag */}
        <span className="absolute left-[10px] top-[34px] z-10 rounded-full border border-[rgba(201,168,76,0.28)] bg-[rgba(201,168,76,0.1)] px-[8px] py-[2px] text-[8px] uppercase tracking-[0.14em] text-[var(--gold)]">
          {product.category_name_vi || product.category_slug || 'Đặc sản'}
        </span>

        {/* Product image / placeholder */}
        {product.main_image_url ? (
          <img
            src={product.main_image_url}
            alt={product.name_vi}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[rgba(201,168,76,0.2)]">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect x="4" y="8" width="24" height="18" rx="2" stroke="currentColor" strokeWidth="1.2" />
              <circle cx="12" cy="15" r="3" stroke="currentColor" strokeWidth="1.2" />
              <path d="M4 22l6-5 5 4 5-7 8 9" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
            </svg>
          </div>
        )}

        {/* Out-of-stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-[rgba(12,11,9,0.45)]">
            <span className="rounded-full border border-[rgba(248,113,113,0.4)] bg-[rgba(248,113,113,0.12)] px-[10px] py-[3px] text-[9px] uppercase tracking-[0.16em] text-[rgba(248,113,113,0.85)]">
              Hết kho
            </span>
          </div>
        )}

        {/* Action buttons — top-right */}
        <div className="absolute right-[8px] top-[8px] z-10 flex flex-col gap-[5px] opacity-0 transition-opacity duration-150 group-hover:opacity-100">
          <button
            type="button"
            aria-label="Chỉnh sửa"
            onClick={(e) => { e.preventDefault(); onEdit?.(product); }}
            className="flex h-[26px] w-[26px] items-center justify-center rounded-full border border-[rgba(240,235,224,0.15)] bg-[rgba(12,11,9,0.65)] text-[rgba(240,235,224,0.7)] backdrop-blur-sm transition-all hover:border-[rgba(201,168,76,0.45)] hover:text-[var(--gold)]"
          >
            <PencilLine size={11} strokeWidth={1.8} />
          </button>
          <button
            type="button"
            aria-label="Xóa"
            onClick={(e) => { e.preventDefault(); onDelete?.(product.id); }}
            className="flex h-[26px] w-[26px] items-center justify-center rounded-full border border-[rgba(240,235,224,0.15)] bg-[rgba(12,11,9,0.65)] text-[rgba(240,235,224,0.5)] backdrop-blur-sm transition-all hover:border-[rgba(248,113,113,0.4)] hover:text-[rgba(248,113,113,0.85)]"
          >
            <Trash2 size={11} strokeWidth={1.8} />
          </button>
        </div>

        {/* Drag handle — bottom center */}
        <div
          {...dragHandleProps}
          className="absolute bottom-[6px] left-1/2 flex -translate-x-1/2 cursor-grab items-center gap-[2px] rounded-full px-[8px] py-[2px] opacity-0 transition-opacity duration-150 group-hover:opacity-100 active:cursor-grabbing"
          aria-label="Kéo để sắp xếp"
        >
          <GripVertical size={14} strokeWidth={1.4} className="text-[rgba(201,168,76,0.45)]" />
        </div>

        {/* Bottom gradient + name overlay */}
        <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(180deg,transparent,rgba(12,11,9,0.88))] p-[12px_14px_10px]">
          <p className="text-[8px] uppercase tracking-[0.18em] text-[rgba(240,235,224,0.4)]">Miền Trung</p>
          <h3
            className="mt-[2px] truncate text-[15px] font-normal leading-snug text-[var(--ink)] transition-colors group-hover:text-[var(--gold)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {product.name_vi}
          </h3>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-col gap-[10px] p-[12px_14px]">
        {/* Summary */}
        {product.summary_vi && (
          <p className="line-clamp-2 text-[11px] leading-[1.6] text-[rgba(240,235,224,0.45)]">
            {product.summary_vi}
          </p>
        )}

        {/* Price + stock row */}
        <div className="flex items-center justify-between border-t border-[rgba(201,168,76,0.1)] pt-[10px]">
          <div>
            <p className="text-[14px] font-semibold leading-none text-[var(--ink)]">
              {fmtVnd(product.price_vnd)}
              <span className="ml-[3px] text-[10px] font-normal text-[rgba(240,235,224,0.38)]">₫</span>
            </p>
            <div className="mt-[4px] flex items-center gap-[5px]">
              <StockDot stock={product.stock} />
              <span className="text-[10px] text-[rgba(240,235,224,0.45)]">
                Kho: {stock}
              </span>
            </div>
          </div>

          <Link
            href={`/admin/products/${product.id}`}
            className="flex items-center gap-[5px] rounded-full border border-[rgba(240,235,224,0.1)] px-[10px] py-[5px] text-[10px] uppercase tracking-[0.1em] text-[rgba(240,235,224,0.5)] transition-all hover:border-[rgba(201,168,76,0.35)] hover:text-[var(--gold)]"
          >
            Chi tiết
          </Link>
        </div>
      </div>
    </article>
  );
}