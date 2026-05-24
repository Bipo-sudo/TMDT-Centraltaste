import { useState } from 'react';
import Link from 'next/link';
import { Package, Plus, Star } from 'lucide-react';

function formatVnd(value) {
  return Number(value || 0).toLocaleString('vi-VN');
}

function getDisplayRating(product) {
  const seed = Number(product?.sales_count || product?.view_count || 0);
  return (4.6 + (seed % 5) * 0.1).toFixed(1);
}

function getDisplayReviews(product) {
  const seed = Number(product?.sales_count || product?.view_count || 0);
  return Math.max(18, (seed % 180) + 20);
}

export default function ProductCard({ product }) {
  const [imageFailed, setImageFailed] = useState(false);
  const rating = getDisplayRating(product);
  const reviewCount = getDisplayReviews(product);
  const primaryTag = product.category_name_vi || product.category_slug || 'Đặc sản';
  const secondaryTag = Number(product.sales_count || 0) > 5000 ? 'Best Seller' : 'Imported';

  return (
    <article className="group overflow-hidden rounded-[16px] bg-[rgba(255,255,255,0.01)] transition duration-300 hover:-translate-y-1 flex flex-col h-full">
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative aspect-[1/1] overflow-hidden rounded-[16px] bg-[#1c1710] shadow-[0_12px_24px_rgba(0,0,0,0.16)]">
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
              <Package className="h-8 w-8" />
            </div>
          )}

          <div className="absolute left-3 top-3 flex flex-col gap-2">
            <span className="inline-flex w-fit rounded-full border border-[rgba(201,168,76,0.16)] bg-[rgba(12,11,9,0.68)] px-3 py-1 text-[12px] leading-none text-[#c9a84c] backdrop-blur-sm">
              {primaryTag}
            </span>
            <span className="inline-flex w-fit rounded-full border border-[rgba(201,168,76,0.12)] bg-[rgba(12,11,9,0.58)] px-3 py-1 text-[12px] leading-none text-[rgba(240,235,224,0.88)] backdrop-blur-sm">
              {secondaryTag}
            </span>
          </div>

          <div className="absolute inset-0 hidden items-end justify-center bg-[linear-gradient(180deg,rgba(0,0,0,0.02)_0%,rgba(0,0,0,0.08)_48%,rgba(0,0,0,0.72)_100%)] group-hover:flex">
            <div className="w-full p-4 text-center text-[#f0ebe0]">
              <p className="mx-auto max-w-[90%] text-[14px] leading-7 text-[rgba(240,235,224,0.9)]">
                {product.summary_vi || 'Sản phẩm nổi bật được tuyển chọn kỹ lưỡng.'}
              </p>
              <p className="mt-4 text-[14px] text-[rgba(240,235,224,0.76)]">
                {product.weight_gram ? `${product.weight_gram}g` : 'Nhiều lựa chọn'}
                {product.unit ? ` · ${product.unit}` : ''}
              </p>
              <div className="mt-3 flex justify-center">
                <button
                  type="button"
                  className="inline-flex h-11 min-w-[200px] items-center justify-center gap-2 rounded-[10px] bg-[#dcb43c] px-5 text-[13px] font-semibold text-[#1a1208] transition hover:opacity-95"
                >
                  <Plus className="h-4 w-4" />
                  THÊM VÀO GIỎ
                </button>
              </div>
            </div>
          </div>
        </div>
      </Link>

      <div className="pt-3 flex flex-col flex-1">
        <h3 className="text-[16px] font-normal leading-[1.28] text-[#f0ebe0]" style={{ fontFamily: 'var(--font-display)' }}>
          {product.name_vi}
        </h3>

        <div className="mt-1 flex items-center gap-2 text-[13px] text-[#f0ebe0]">
          <Star className="h-4 w-4 fill-[#dcb43c] text-[#dcb43c]" />
          <span className="font-semibold">{rating}</span>
          <span className="text-[rgba(240,235,224,0.55)]">({reviewCount})</span>
        </div>

        <div className="mt-3 flex items-baseline gap-2 mt-auto">
          <p className="text-[18px] font-semibold text-[#dcb43c]">
            {formatVnd(product.price_vnd)}<span className="text-[14px] font-normal">đ</span>
          </p>
          {product.original_price_vnd && product.original_price_vnd > product.price_vnd ? (
            <p className="text-[13px] text-[rgba(240,235,224,0.35)] line-through">
              {formatVnd(product.original_price_vnd)}đ
            </p>
          ) : null}
        </div>

        <p className="mt-2 text-[13px] text-[rgba(240,235,224,0.58)]">
          {product.category_name_vi || product.category_slug || 'Đặc sản'}
        </p>
      </div>
    </article>
  );
}