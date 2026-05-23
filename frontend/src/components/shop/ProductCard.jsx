import { useState } from 'react';
import Link from 'next/link';
import { Package, Plus } from 'lucide-react';

function formatVnd(value) {
  return Number(value || 0).toLocaleString('vi-VN');
}

export default function ProductCard({ product }) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <article className="group overflow-hidden rounded-[24px] border border-[rgba(201,168,76,0.14)] bg-[rgba(255,255,255,0.03)] backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-[rgba(201,168,76,0.45)] hover:shadow-[0_24px_60px_rgba(0,0,0,0.2)]">
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-[#1c1710]">
          {product.main_image_url && !imageFailed ? (
            <img
              src={product.main_image_url}
              alt={product.name_vi}
              loading="lazy"
              className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-[rgba(201,168,76,0.35)]">
              <Package className="h-10 w-10" />
            </div>
          )}

          <span className="absolute left-3 top-3 rounded-full border border-[rgba(201,168,76,0.32)] bg-[rgba(201,168,76,0.1)] px-2.5 py-1 text-[9px] uppercase tracking-[0.18em] text-[#c9a84c]">
            {product.category_name_vi || product.category_slug || 'Đặc sản'}
          </span>

          <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(180deg,transparent,rgba(12,11,9,0.88))] p-4">
            <p className="text-[9px] uppercase tracking-[0.2em] text-[rgba(240,235,224,0.45)]">Miền Trung</p>
            <h3 className="mt-1 text-[16px] font-normal leading-snug text-[#f0ebe0]" style={{ fontFamily: 'var(--font-display)' }}>
              {product.name_vi}
            </h3>
          </div>
        </div>
      </Link>

      <div className="space-y-4 p-4">
        <p className="text-[12px] leading-6 text-[rgba(240,235,224,0.54)]">
          {product.summary_vi || 'Sản phẩm được trình bày đồng bộ với phong cách cinematic của CentralTaste.'}
        </p>

        <div className="flex items-center justify-between border-t border-[rgba(201,168,76,0.12)] pt-3">
          <p className="text-[15px] font-semibold text-[#f0ebe0]">
            {formatVnd(product.price_vnd)} <span className="text-[11px] font-normal text-[rgba(240,235,224,0.42)]">₫</span>
          </p>

          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(201,168,76,0.24)] bg-[rgba(201,168,76,0.08)] text-[#f0ebe0] transition hover:border-[rgba(201,168,76,0.55)] hover:text-[#c9a84c]"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}