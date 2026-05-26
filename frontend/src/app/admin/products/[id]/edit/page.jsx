'use client';

/**
 * app/admin/products/[id]/edit/page.jsx
 *
 * Route: /admin/products/[id]/edit
 * Load dữ liệu sản phẩm (bao gồm story, steps, certs, tips)
 * rồi truyền vào ProductFormPage để populate form.
 */

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';
import api from '../../../../../lib/api';
import ProductFormPage from '../../../../../components/admin/product-form/ProductFormPage';

/* ── Skeleton loading ── */
function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-[20px]">
      {/* Header skeleton */}
      <div className="flex items-start justify-between gap-[16px]">
        <div className="flex flex-col gap-[8px]">
          <div className="h-[9px] w-[160px] animate-pulse rounded bg-[rgba(255,255,255,0.05)]" />
          <div className="h-[32px] w-[280px] animate-pulse rounded bg-[rgba(255,255,255,0.06)]" />
          <div className="h-[11px] w-[340px] animate-pulse rounded bg-[rgba(255,255,255,0.04)]" />
        </div>
        <div className="flex gap-[8px] pt-[4px]">
          {[100, 90, 80, 100].map((w, i) => (
            <div key={i} className={`h-[34px] w-[${w}px] animate-pulse rounded-full bg-[rgba(255,255,255,0.05)]`} />
          ))}
        </div>
      </div>
      {/* Tab bar skeleton */}
      <div className="flex gap-0 border-b border-[rgba(201,168,76,0.12)]">
        {[120, 130, 100, 110, 140].map((w, i) => (
          <div key={i} className={`mx-[2px] mb-[-1px] h-[38px] w-[${w}px] animate-pulse rounded-t bg-[rgba(255,255,255,0.04)]`} />
        ))}
      </div>
      {/* Content skeleton */}
      <div className="grid grid-cols-[1fr_240px] gap-[16px]">
        <div className="flex flex-col gap-[14px]">
          {[1, 2, 3].map((i) => (
            <div key={i} className="overflow-hidden rounded-[16px] border border-[rgba(201,168,76,0.08)] bg-[rgba(255,255,255,0.02)]">
              <div className="h-[44px] animate-pulse border-b border-[rgba(201,168,76,0.08)] bg-[rgba(201,168,76,0.02)]" />
              <div className="flex flex-col gap-[12px] p-[18px]">
                <div className="grid grid-cols-2 gap-[12px]">
                  <div className="h-[36px] animate-pulse rounded-[10px] bg-[rgba(255,255,255,0.04)]" />
                  <div className="h-[36px] animate-pulse rounded-[10px] bg-[rgba(255,255,255,0.04)]" />
                </div>
                <div className="h-[72px] animate-pulse rounded-[10px] bg-[rgba(255,255,255,0.03)]" />
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-[14px]">
          {[180, 160, 120].map((h, i) => (
            <div key={i} className={`h-[${h}px] animate-pulse rounded-[16px] border border-[rgba(201,168,76,0.08)] bg-[rgba(255,255,255,0.02)]`} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Error state ── */
function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-[16px] rounded-[20px] border border-[rgba(248,113,113,0.2)] bg-[rgba(248,113,113,0.04)] py-[60px] text-center">
      <div className="flex h-[44px] w-[44px] items-center justify-center rounded-full border border-[rgba(248,113,113,0.25)] bg-[rgba(248,113,113,0.08)]">
        <AlertTriangle size={20} strokeWidth={1.5} className="text-[rgba(248,113,113,0.7)]" />
      </div>
      <div>
        <p className="text-[14px] text-[rgba(240,235,224,0.7)]">
          {message || 'Không thể tải dữ liệu sản phẩm.'}
        </p>
        <p className="mt-[4px] text-[12px] text-[rgba(240,235,224,0.35)]">
          Kiểm tra kết nối hoặc thử lại.
        </p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="flex h-[34px] items-center gap-[6px] rounded-full border border-[rgba(240,235,224,0.15)] px-[16px] text-[11px] uppercase tracking-[0.1em] text-[rgba(240,235,224,0.55)] transition-all hover:border-[rgba(240,235,224,0.3)] hover:text-[rgba(240,235,224,0.8)]"
      >
        Thử lại
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PAGE
───────────────────────────────────────────── */
export default function AdminProductEditPage() {
  const params    = useParams();
  const router    = useRouter();
  const productId = params?.id;

  const [state, setState] = useState({
    loading: true,
    error:   null,
    data:    null,
  });

  const load = async () => {
    if (!productId) { router.replace('/admin/products'); return; }

    setState({ loading: true, error: null, data: null });

    try {
      /*
       * API GET /products/:id phải trả về đầy đủ nested data:
       * {
       *   data: {
       *     ...product fields,
       *     story: { origin_vi, origin_en, culture_vi, ... },
       *     production_steps: [ { step_number, desc_vi, desc_en, step_image_url } ],
       *     certifications:   [ { cert_name, cert_icon } ],
       *     how_to_enjoy:     [ { tip_vi, tip_en } ],
       *   }
       * }
       *
       * Nếu backend chưa JOIN các bảng phụ, cần gọi thêm endpoint riêng
       * hoặc bổ sung JOIN trong controller GET /products/:id.
       */
      const { data: res } = await api.get(`/products/${productId}`);

      /* Support cả hai cấu trúc: data.data.product hoặc data.data */
      const product = res?.data?.product ?? res?.data;

      if (!product) throw new Error('Không tìm thấy sản phẩm.');

      setState({ loading: false, error: null, data: product });
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Tải dữ liệu thất bại.';
      setState({ loading: false, error: msg, data: null });
    }
  };

  useEffect(() => { load(); }, [productId]);

  /* ── Render states ── */
  if (state.loading) return <LoadingSkeleton />;

  if (state.error) {
    return <ErrorState message={state.error} onRetry={load} />;
  }

  return (
    <ProductFormPage
      mode="edit"
      initialData={state.data}
      productId={productId}
    />
  );
}