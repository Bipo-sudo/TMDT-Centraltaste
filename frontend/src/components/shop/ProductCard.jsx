import Link from 'next/link';
import { Plus } from 'lucide-react';

function formatVnd(value) {
  return Number(value || 0).toLocaleString('vi-VN');
}

export default function ProductCard({ product }) {
  return (
    <article className="group">
      <Link href={`/products/${product.id}`} className="block overflow-hidden rounded-[28px] bg-white transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
        <div className="aspect-[4/5] overflow-hidden bg-neutral-100">
          <img
            src={product.main_image_url}
            alt={product.name_vi}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        </div>
      </Link>

      <div className="px-1 pt-4">
        <Link href={`/products/${product.id}`} className="block">
          <h3 className="text-[15px] font-medium tracking-[-0.02em] text-neutral-800 transition group-hover:text-neutral-950">
            {product.name_vi}
          </h3>
        </Link>

        <p className="mt-1 text-sm text-neutral-500">{formatVnd(product.price_vnd)} VND</p>

        <button
          type="button"
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-neutral-700 transition hover:text-neutral-950"
        >
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-900 transition group-hover:bg-neutral-200">
            <Plus className="h-4 w-4" />
          </span>
          Thêm vào giỏ
        </button>
      </div>
    </article>
  );
}