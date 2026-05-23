import Link from 'next/link';
import { PencilLine, Trash2 } from 'lucide-react';

function formatVnd(value) {
  return Number(value || 0).toLocaleString('vi-VN');
}

export default function AdminProductCard({ product, onEdit, onDelete }) {
  return (
    <article className="group relative overflow-hidden rounded-[24px] border border-[rgba(201,168,76,0.14)] bg-[rgba(255,255,255,0.03)] backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-[rgba(201,168,76,0.45)]">
      <Link href={`/admin/products/${product.id}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-[#1c1710]">
          {product.main_image_url ? (
            <img
              src={product.main_image_url}
              alt={product.name_vi}
              loading="lazy"
              className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-[rgba(201,168,76,0.35)]">●</div>
          )}

          <span className="absolute left-3 top-3 rounded-full border border-[rgba(201,168,76,0.32)] bg-[rgba(201,168,76,0.1)] px-2.5 py-1 text-[9px] uppercase tracking-[0.18em] text-[#c9a84c]">
            {product.category_name_vi || product.category_slug || 'Đặc sản'}
          </span>

          <div className="absolute right-3 top-3 flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); onEdit && onEdit(product); }}
              className="rounded-full bg-[rgba(0,0,0,0.4)] p-2 text-[rgba(240,235,224,0.82)] transition hover:bg-[rgba(201,168,76,0.14)] hover:text-[#c9a84c]"
              aria-label="Sửa"
            >
              <PencilLine className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); onDelete && onDelete(product.id); }}
              className="rounded-full bg-[rgba(0,0,0,0.4)] p-2 text-[rgba(240,235,224,0.7)] transition hover:bg-red-600/20 hover:text-red-300"
              aria-label="Xóa"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(180deg,transparent,rgba(12,11,9,0.88))] p-4">
            <p className="text-[9px] uppercase tracking-[0.2em] text-[rgba(240,235,224,0.45)]">Miền Trung</p>
            <h3 className="mt-1 text-[16px] font-normal leading-snug text-[#f0ebe0]" style={{ fontFamily: 'var(--font-display)' }}>
              {product.name_vi}
            </h3>
          </div>
        </div>
      </Link>

      <div className="space-y-3 p-4">
        <p className="text-[12px] leading-6 text-[rgba(240,235,224,0.54)] truncate">{product.summary_vi}</p>

        <div className="flex items-center justify-between border-t border-[rgba(201,168,76,0.12)] pt-3">
          <div>
            <p className="text-[15px] font-semibold text-[#f0ebe0]">{formatVnd(product.price_vnd)} <span className="text-[11px] font-normal text-[rgba(240,235,224,0.42)]">₫</span></p>
            <p className="text-xs text-[rgba(240,235,224,0.5)]">Kho: {Number(product.stock || 0)}</p>
          </div>

          <Link href={`/admin/products/${product.id}`} className="inline-flex items-center gap-2 rounded-full border border-[rgba(201,168,76,0.12)] px-3 py-2 text-[13px] text-[rgba(240,235,224,0.82)] transition hover:border-[rgba(201,168,76,0.35)] hover:text-[#c9a84c]">
            Chi tiết
          </Link>
        </div>
      </div>
    </article>
  );
}
