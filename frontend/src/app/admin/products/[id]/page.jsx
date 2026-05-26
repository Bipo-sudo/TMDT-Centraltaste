'use client';

/**
 * app/admin/products/[id]/page.jsx
 *
 * Trang xem chi tiết sản phẩm trong admin.
 * Hiển thị toàn bộ dữ liệu từ schema:
 *   products, product_stories, production_steps,
 *   certifications, how_to_enjoy
 *
 * Không edit trực tiếp tại đây — nút "Chỉnh sửa" → /admin/products/[id]/edit
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, PencilLine, Trash2, Eye, EyeOff,
  Package, BookOpen, Layers, Award, Lightbulb,
  ChevronDown, ChevronUp, AlertTriangle, Globe,
  Leaf, BarChart2,
} from 'lucide-react';
import api from '../../../../lib/api';

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
function fmtVnd(v)  { return Number(v || 0).toLocaleString('vi-VN'); }
function fmtNum(v)  { return Number(v || 0).toLocaleString('vi-VN'); }
function fmtDate(v) {
  if (!v) return '--';
  return new Date(v).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
}

/* ── Stock dot ── */
function StockDot({ stock }) {
  const n = Number(stock || 0);
  if (n === 0)  return <span className="inline-block h-[8px] w-[8px] rounded-full bg-[rgba(248,113,113,0.8)]" />;
  if (n <= 10)  return <span className="inline-block h-[8px] w-[8px] rounded-full bg-[rgba(250,204,21,0.8)]" />;
  return              <span className="inline-block h-[8px] w-[8px] rounded-full bg-[rgba(134,239,172,0.75)]" />;
}

function StockLabel({ stock }) {
  const n = Number(stock || 0);
  if (n === 0) return <span className="text-[rgba(248,113,113,0.8)]">Hết kho</span>;
  if (n <= 10) return <span className="text-[rgba(250,204,21,0.8)]">Sắp hết ({n})</span>;
  return              <span className="text-[rgba(134,239,172,0.75)]">Còn hàng ({fmtNum(n)})</span>;
}

/* ── Section card ── */
function Section({ icon: Icon, title, hint, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="overflow-hidden rounded-[18px] border border-[rgba(201,168,76,0.12)] bg-[rgba(255,255,255,0.02)]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-[10px] border-b border-[rgba(201,168,76,0.1)] bg-[rgba(201,168,76,0.025)] px-[20px] py-[13px] text-left transition-colors hover:bg-[rgba(201,168,76,0.04)]"
      >
        {Icon && <Icon size={13} strokeWidth={1.5} className="shrink-0 text-[rgba(201,168,76,0.6)]" />}
        <span className="flex-1 text-[9px] uppercase tracking-[0.22em] text-[rgba(201,168,76,0.7)]">{title}</span>
        {hint && <span className="text-[9px] italic text-[rgba(240,235,224,0.26)]">{hint}</span>}
        {open
          ? <ChevronUp size={13} strokeWidth={1.5} className="shrink-0 text-[rgba(240,235,224,0.3)]" />
          : <ChevronDown size={13} strokeWidth={1.5} className="shrink-0 text-[rgba(240,235,224,0.3)]" />
        }
      </button>
      {open && <div className="p-[20px]">{children}</div>}
    </div>
  );
}

/* ── Bilingual display ── */
function BiField({ labelVi, labelEn, vi, en, multiline = false }) {
  if (!vi && !en) return null;
  return (
    <div className="grid grid-cols-2 gap-[12px]">
      <div>
        <p className="mb-[5px] flex items-center gap-[5px] text-[9px] uppercase tracking-[0.16em] text-[rgba(240,235,224,0.3)]">
          <span className="rounded-full border border-[rgba(201,168,76,0.28)] px-[5px] py-[0.5px] text-[rgba(201,168,76,0.65)]">VI</span>
          {labelVi}
        </p>
        {vi
          ? <p className={`text-[12px] leading-[1.7] text-[rgba(240,235,224,0.7)] ${multiline ? '' : 'truncate'}`}>{vi}</p>
          : <p className="text-[11px] italic text-[rgba(240,235,224,0.22)]">Chưa có nội dung</p>
        }
      </div>
      <div>
        <p className="mb-[5px] flex items-center gap-[5px] text-[9px] uppercase tracking-[0.16em] text-[rgba(240,235,224,0.3)]">
          <span className="rounded-full border border-[rgba(147,197,253,0.22)] px-[5px] py-[0.5px] text-[rgba(147,197,253,0.55)]">EN</span>
          {labelEn}
        </p>
        {en
          ? <p className={`text-[12px] leading-[1.7] text-[rgba(240,235,224,0.7)] ${multiline ? '' : 'truncate'}`}>{en}</p>
          : <p className="text-[11px] italic text-[rgba(240,235,224,0.22)]">No content yet</p>
        }
      </div>
    </div>
  );
}

/* ── Key–value row ── */
function KVRow({ label, children, accent = false }) {
  return (
    <div className="flex items-start justify-between gap-[16px] border-b border-[rgba(201,168,76,0.07)] py-[8px] last:border-0">
      <span className="shrink-0 text-[11px] text-[rgba(240,235,224,0.36)]">{label}</span>
      <span className={`text-right text-[12px] ${accent ? 'font-semibold text-[var(--ink)]' : 'text-[rgba(240,235,224,0.68)]'}`}>
        {children ?? '--'}
      </span>
    </div>
  );
}

/* ── Stat pill ── */
function StatPill({ label, value, icon: Icon }) {
  return (
    <div className="flex flex-col items-center gap-[4px] rounded-[12px] border border-[rgba(201,168,76,0.1)] bg-[rgba(255,255,255,0.02)] px-[16px] py-[12px]">
      {Icon && <Icon size={14} strokeWidth={1.4} className="text-[rgba(201,168,76,0.5)]" />}
      <span
        className="text-[1.4rem] leading-none text-[var(--ink)]"
        style={{ fontFamily: 'var(--font-display)', fontWeight: 300 }}
      >
        {value}
      </span>
      <span className="text-[9px] uppercase tracking-[0.16em] text-[rgba(240,235,224,0.32)]">{label}</span>
    </div>
  );
}

/* ── Cert tag ── */
function CertTag({ cert }) {
  return (
    <span className="inline-flex items-center gap-[5px] rounded-full border border-[rgba(201,168,76,0.22)] bg-[rgba(201,168,76,0.07)] px-[10px] py-[4px] text-[11px] text-[rgba(201,168,76,0.8)]">
      {cert.cert_icon && <span>{cert.cert_icon}</span>}
      {cert.cert_name}
    </span>
  );
}

/* ── Delete confirm modal ── */
function DeleteModal({ productName, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.72)] backdrop-blur-[2px]">
      <div className="w-full max-w-[380px] overflow-hidden rounded-[24px] border border-[rgba(248,113,113,0.25)] bg-[#131108] shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
        <div className="flex items-start gap-[14px] p-[24px]">
          <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full border border-[rgba(248,113,113,0.25)] bg-[rgba(248,113,113,0.08)]">
            <AlertTriangle size={16} strokeWidth={1.6} className="text-[rgba(248,113,113,0.75)]" />
          </div>
          <div>
            <h3
              className="text-[18px] font-light leading-snug text-[var(--ink)]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Xác nhận xóa
            </h3>
            <p className="mt-[6px] text-[12px] leading-[1.7] text-[rgba(240,235,224,0.5)]">
              Bạn sắp xóa sản phẩm{' '}
              <strong className="text-[rgba(240,235,224,0.8)]">"{productName}"</strong>.
              Toàn bộ dữ liệu liên quan (story, quy trình, chứng nhận) sẽ bị xóa vĩnh viễn.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-[8px] border-t border-[rgba(255,255,255,0.06)] px-[24px] py-[16px]">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex h-[34px] items-center rounded-full border border-[rgba(240,235,224,0.12)] px-[16px] text-[11px] uppercase tracking-[0.1em] text-[rgba(240,235,224,0.55)] transition-all hover:border-[rgba(240,235,224,0.25)] hover:text-[rgba(240,235,224,0.8)]"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex h-[34px] items-center gap-[6px] rounded-full border border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.1)] px-[16px] text-[11px] uppercase tracking-[0.1em] text-[rgba(248,113,113,0.85)] transition-all hover:bg-[rgba(248,113,113,0.18)] disabled:opacity-50"
          >
            <Trash2 size={12} strokeWidth={1.8} />
            {loading ? 'Đang xóa...' : 'Xóa sản phẩm'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PAGE
───────────────────────────────────────────── */
export default function AdminProductDetailPage() {
  const params    = useParams();
  const router    = useRouter();
  const productId = params?.id;

  const [product,       setProduct]       = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [showDelete,    setShowDelete]    = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  /* ── Fetch ── */
  useEffect(() => {
    if (!productId) return;
    let alive = true;
    (async () => {
      try {
        setLoading(true); setError(null);
        const { data } = await api.get(`/products/${productId}`);
        const p = data?.data?.product ?? data?.data;
        if (!alive) return;
        if (!p) throw new Error('Không tìm thấy sản phẩm.');
        setProduct(p);
      } catch (e) {
        if (alive) setError(e?.response?.data?.message || e?.message || 'Tải dữ liệu thất bại.');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [productId]);

  /* ── Delete ── */
  async function handleDelete() {
    try {
      setDeleteLoading(true);
      await api.delete(`/products/${productId}`);
      router.replace('/admin/products');
    } catch (e) {
      setShowDelete(false);
      setDeleteLoading(false);
      setError(e?.response?.data?.message || 'Xóa thất bại.');
    }
  }

  /* ─────────────────────────────────────────
     LOADING
  ───────────────────────────────────────── */
  if (loading) {
    return (
      <div className="flex flex-col gap-[20px]">
        <div className="h-[52px] w-[200px] animate-pulse rounded-[12px] bg-[rgba(255,255,255,0.05)]" />
        <div className="grid grid-cols-[1fr_300px] gap-[16px]">
          <div className="flex flex-col gap-[14px]">
            {[240, 160, 200].map((h, i) => (
              <div key={i} className={`h-[${h}px] animate-pulse rounded-[18px] border border-[rgba(201,168,76,0.08)] bg-[rgba(255,255,255,0.02)]`} />
            ))}
          </div>
          <div className="flex flex-col gap-[14px]">
            {[280, 160].map((h, i) => (
              <div key={i} className={`h-[${h}px] animate-pulse rounded-[18px] border border-[rgba(201,168,76,0.08)] bg-[rgba(255,255,255,0.02)]`} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ─────────────────────────────────────────
     ERROR
  ───────────────────────────────────────── */
  if (error || !product) {
    return (
      <div className="flex flex-col items-center gap-[14px] rounded-[20px] border border-[rgba(248,113,113,0.2)] bg-[rgba(248,113,113,0.04)] py-[60px] text-center">
        <AlertTriangle size={22} strokeWidth={1.4} className="text-[rgba(248,113,113,0.6)]" />
        <p className="text-[13px] text-[rgba(240,235,224,0.6)]">{error || 'Không tìm thấy sản phẩm.'}</p>
        <Link
          href="/admin/products"
          className="flex items-center gap-[5px] text-[11px] uppercase tracking-[0.1em] text-[rgba(201,168,76,0.55)] hover:text-[var(--gold)]"
        >
          <ArrowLeft size={11} strokeWidth={1.8} />
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  /* ─────────────────────────────────────────
     DATA shortcuts
  ───────────────────────────────────────── */
  const story = product.story          || {};
  const steps = product.production_steps || [];
  const certs = product.certifications   || [];
  const tips  = product.how_to_enjoy     || [];

  /* ─────────────────────────────────────────
     RENDER
  ───────────────────────────────────────── */
  return (
    <>
      {showDelete && (
        <DeleteModal
          productName={product.name_vi}
          onConfirm={handleDelete}
          onCancel={() => setShowDelete(false)}
          loading={deleteLoading}
        />
      )}

      <section className="flex flex-col gap-[20px]">

        {/* ── Page header ── */}
        <div className="flex items-start justify-between gap-[16px]">
          <div>
            <Link
              href="/admin/products"
              className="inline-flex items-center gap-[5px] text-[11px] uppercase tracking-[0.1em] text-[rgba(240,235,224,0.38)] transition-colors hover:text-[var(--gold)]"
            >
              <ArrowLeft size={12} strokeWidth={1.6} />
              Sản phẩm
            </Link>
            <h1
              className="mt-[8px] text-[2rem] leading-[1.05] tracking-[-0.03em] text-[var(--ink)]"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 300 }}
            >
              {product.name_vi}
            </h1>
            {product.tagline_vi && (
              <p className="mt-[4px] text-[13px] italic text-[rgba(240,235,224,0.45)]"
                style={{ fontFamily: 'var(--font-display)' }}>
                {product.tagline_vi}
              </p>
            )}
            <p className="mt-[4px] text-[10px] uppercase tracking-[0.18em] text-[rgba(240,235,224,0.28)]">
              {product.id}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-[8px] pt-[4px]">
            {/* View on storefront */}
            <Link
              href={`/products/${productId}`}
              target="_blank"
              className="flex h-[34px] items-center gap-[5px] rounded-full border border-[rgba(240,235,224,0.1)] px-[14px] text-[11px] uppercase tracking-[0.1em] text-[rgba(240,235,224,0.45)] transition-all hover:border-[rgba(240,235,224,0.22)] hover:text-[rgba(240,235,224,0.7)]"
            >
              <Eye size={12} strokeWidth={1.6} />
              Xem storefront
            </Link>

            {/* Delete */}
            <button
              type="button"
              onClick={() => setShowDelete(true)}
              className="flex h-[34px] items-center gap-[5px] rounded-full border border-[rgba(248,113,113,0.2)] px-[14px] text-[11px] uppercase tracking-[0.1em] text-[rgba(248,113,113,0.55)] transition-all hover:border-[rgba(248,113,113,0.4)] hover:bg-[rgba(248,113,113,0.07)] hover:text-[rgba(248,113,113,0.85)]"
            >
              <Trash2 size={12} strokeWidth={1.6} />
              Xóa
            </button>

            {/* Edit */}
            <Link
              href={`/admin/products/${productId}/edit`}
              className="flex h-[34px] items-center gap-[5px] rounded-full bg-[var(--gold)] px-[18px] text-[11px] font-semibold uppercase tracking-[0.1em] text-[#1a1208] transition-opacity hover:opacity-88"
            >
              <PencilLine size={12} strokeWidth={2} />
              Chỉnh sửa
            </Link>
          </div>
        </div>

        {/* ── Stats bar ── */}
        <div className="grid grid-cols-4 gap-[10px]">
          <StatPill label="Lượt xem"  value={fmtNum(product.view_count)}  icon={Eye} />
          <StatPill label="Đã bán"    value={fmtNum(product.sales_count)} icon={BarChart2} />
          <StatPill label="Tồn kho"   value={fmtNum(product.stock)}       icon={Package} />
          <StatPill label="Giá (₫)"   value={`${fmtVnd(product.price_vnd)}`} icon={null} />
        </div>

        {/* ── Main layout: left col + right sidebar ── */}
        <div className="grid grid-cols-[1fr_280px] items-start gap-[16px]">

          {/* ════ LEFT ════ */}
          <div className="flex flex-col gap-[14px]">

            {/* 1 — Thông tin cơ bản */}
            <Section icon={Package} title="Thông tin cơ bản" hint="products table">
              <div className="grid grid-cols-2 gap-x-[24px]">
                <div>
                  <KVRow label="ID">
                    <span className="font-mono text-[11px] text-[rgba(201,168,76,0.75)]">{product.id}</span>
                  </KVRow>
                  <KVRow label="Danh mục">{product.category_slug}</KVRow>
                  <KVRow label="Giá (₫)" accent>{fmtVnd(product.price_vnd)} ₫</KVRow>
                  <KVRow label="Giá ($)">{product.price_usd ? `$${product.price_usd}` : '--'}</KVRow>
                  <KVRow label="Tồn kho">
                    <span className="flex items-center gap-[6px]">
                      <StockDot stock={product.stock} />
                      <StockLabel stock={product.stock} />
                    </span>
                  </KVRow>
                </div>
                <div>
                  <KVRow label="Đơn vị">{product.unit}</KVRow>
                  <KVRow label="Khối lượng">{product.weight_gram ? `${product.weight_gram}g` : '--'}</KVRow>
                  <KVRow label="Ăn chay">
                    {product.suitable_for_vegan
                      ? <span className="flex items-center gap-[5px] text-[rgba(134,239,172,0.75)]"><Leaf size={11} strokeWidth={1.6} /> Phù hợp</span>
                      : <span className="text-[rgba(240,235,224,0.35)]">Không đặc định</span>
                    }
                  </KVRow>
                  <KVRow label="Hạn sử dụng">{product.shelf_life_vi}</KVRow>
                  <KVRow label="Bảo quản">{product.preservation_vi}</KVRow>
                </div>
              </div>
            </Section>

            {/* 2 — Mô tả song ngữ */}
            <Section icon={BookOpen} title="Mô tả & Thành phần" hint="summary · ingredients · allergens">
              <div className="flex flex-col gap-[16px]">
                <BiField labelVi="Tóm tắt" labelEn="Summary"      vi={product.summary_vi}     en={product.summary_en}     multiline />
                <div className="border-t border-[rgba(201,168,76,0.08)] pt-[14px]">
                  <BiField labelVi="Thành phần" labelEn="Ingredients" vi={product.ingredients_vi} en={product.ingredients_en} multiline />
                </div>
                {(product.allergens_vi || product.allergens_en) && (
                  <div className="border-t border-[rgba(201,168,76,0.08)] pt-[14px]">
                    <BiField labelVi="Dị ứng" labelEn="Allergens" vi={product.allergens_vi} en={product.allergens_en} multiline />
                  </div>
                )}
                <div className="border-t border-[rgba(201,168,76,0.08)] pt-[14px]">
                  <BiField labelVi="Vận chuyển" labelEn="Shipping"   vi={product.shipping_vi}   en={product.shipping_en}   multiline />
                </div>
                <div className="border-t border-[rgba(201,168,76,0.08)] pt-[14px]">
                  <BiField labelVi="Đóng gói"   labelEn="Packaging"  vi={product.packaging_vi}  en={product.packaging_en} />
                </div>
                <div className="border-t border-[rgba(201,168,76,0.08)] pt-[14px]">
                  <BiField labelVi="Cam kết"     labelEn="Guarantee"  vi={product.guarantee_vi}  en={product.guarantee_en} />
                </div>
              </div>
            </Section>

            {/* 3 — Câu chuyện sản phẩm */}
            <Section icon={Globe} title="Câu chuyện sản phẩm" hint="product_stories" defaultOpen={false}>
              {!story.origin_vi && !story.origin_en && !story.culture_vi ? (
                <p className="text-[12px] italic text-[rgba(240,235,224,0.3)]">Chưa có nội dung câu chuyện.</p>
              ) : (
                <div className="flex flex-col gap-[16px]">
                  {[
                    { labelVi: 'Xuất xứ & Lịch sử', labelEn: 'Origin & history',    vi: story.origin_vi,         en: story.origin_en         },
                    { labelVi: 'Văn hóa',            labelEn: 'Culture',             vi: story.culture_vi,        en: story.culture_en        },
                    { labelVi: 'Triết lý',           labelEn: 'Philosophy',          vi: story.philosophy_vi,     en: story.philosophy_en     },
                    { labelVi: 'Tác động địa lý',   labelEn: 'Geographical impact', vi: story.geo_impact_vi,     en: story.geo_impact_en     },
                    { labelVi: 'Bền vững',           labelEn: 'Sustainability',      vi: story.sustainability_vi, en: story.sustainability_en },
                  ].filter((f) => f.vi || f.en).map((f, i) => (
                    <div key={i} className={i > 0 ? 'border-t border-[rgba(201,168,76,0.08)] pt-[14px]' : ''}>
                      <BiField {...f} multiline />
                    </div>
                  ))}

                  {story.intl_friendly_quote && (
                    <div className="mt-[4px] rounded-[12px] border border-[rgba(201,168,76,0.15)] bg-[rgba(201,168,76,0.04)] px-[18px] py-[14px]">
                      <p className="mb-[6px] text-[9px] uppercase tracking-[0.18em] text-[rgba(201,168,76,0.55)]">
                        International quote
                      </p>
                      <p className="text-[13px] italic leading-[1.8] text-[rgba(240,235,224,0.65)]"
                        style={{ fontFamily: 'var(--font-display)' }}>
                        {story.intl_friendly_quote}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </Section>

            {/* 4 — Quy trình sản xuất */}
            <Section icon={Layers} title="Quy trình sản xuất" hint={`production_steps — ${steps.length} bước`} defaultOpen={false}>
              {steps.length === 0 ? (
                <p className="text-[12px] italic text-[rgba(240,235,224,0.3)]">Chưa có bước nào.</p>
              ) : (
                <div className="flex flex-col gap-[12px]">
                  {steps.map((step, i) => (
                    <div
                      key={step.id ?? i}
                      className="flex gap-[14px] rounded-[14px] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-[14px]"
                    >
                      {/* Step number */}
                      <div className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-full border border-[rgba(201,168,76,0.3)] bg-[rgba(201,168,76,0.08)] text-[11px] text-[rgba(201,168,76,0.8)]">
                        {step.step_number ?? i + 1}
                      </div>

                      <div className="flex-1 min-w-0">
                        <BiField
                          labelVi={`Bước ${step.step_number ?? i + 1}`}
                          labelEn={`Step ${step.step_number ?? i + 1}`}
                          vi={step.desc_vi}
                          en={step.desc_en}
                          multiline
                        />
                      </div>

                      {/* Step image */}
                      {step.step_image_url && (
                        <div className="h-[70px] w-[70px] shrink-0 overflow-hidden rounded-[10px] border border-[rgba(201,168,76,0.12)]">
                          <img
                            src={step.step_image_url}
                            alt={`Bước ${step.step_number ?? i + 1}`}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Section>

            {/* 5 — Chứng nhận & Tips */}
            <Section icon={Award} title="Chứng nhận & Mẹo thưởng thức" hint="certifications · how_to_enjoy" defaultOpen={false}>
              {/* Certs */}
              <div className="mb-[16px]">
                <p className="mb-[8px] text-[9px] uppercase tracking-[0.2em] text-[rgba(240,235,224,0.32)]">
                  Chứng nhận ({certs.length})
                </p>
                {certs.length > 0 ? (
                  <div className="flex flex-wrap gap-[8px]">
                    {certs.map((c, i) => <CertTag key={c.id ?? i} cert={c} />)}
                  </div>
                ) : (
                  <p className="text-[12px] italic text-[rgba(240,235,224,0.3)]">Chưa có chứng nhận.</p>
                )}
              </div>

              {/* Tips */}
              <div className="border-t border-[rgba(201,168,76,0.08)] pt-[14px]">
                <p className="mb-[10px] text-[9px] uppercase tracking-[0.2em] text-[rgba(240,235,224,0.32)]">
                  Mẹo thưởng thức ({tips.length})
                </p>
                {tips.length > 0 ? (
                  <div className="flex flex-col gap-[10px]">
                    {tips.map((tip, i) => (
                      <div key={tip.id ?? i} className="flex gap-[12px] rounded-[12px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)] p-[12px]">
                        <div className="flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-full border border-[rgba(201,168,76,0.22)] text-[9px] text-[rgba(201,168,76,0.65)]">
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <BiField
                            labelVi="Mẹo"    labelEn="Tip"
                            vi={tip.tip_vi}  en={tip.tip_en}
                            multiline
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[12px] italic text-[rgba(240,235,224,0.3)]">Chưa có mẹo nào.</p>
                )}
              </div>
            </Section>

          </div>

          {/* ════ RIGHT SIDEBAR ════ */}
          <div className="sticky top-[24px] flex flex-col gap-[14px]">

            {/* Ảnh chính */}
            <div className="overflow-hidden rounded-[18px] border border-[rgba(201,168,76,0.12)] bg-[rgba(255,255,255,0.02)]">
              <div className="flex items-center gap-[9px] border-b border-[rgba(201,168,76,0.1)] px-[16px] py-[12px]">
                <span className="h-[5px] w-[5px] rounded-full bg-[var(--gold)] opacity-70" />
                <span className="text-[9px] uppercase tracking-[0.2em] text-[rgba(201,168,76,0.65)]">Ảnh chính</span>
              </div>
              {product.main_image_url ? (
                <div className="overflow-hidden">
                  <img
                    src={product.main_image_url}
                    alt={product.name_vi}
                    className="aspect-[4/3] w-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex aspect-[4/3] items-center justify-center bg-[linear-gradient(135deg,#1c1810,#231e13)] text-[rgba(201,168,76,0.2)]">
                  <Package size={32} strokeWidth={1} />
                </div>
              )}
            </div>

            {/* Video */}
            {product.intro_video_url && (
              <div className="overflow-hidden rounded-[18px] border border-[rgba(201,168,76,0.12)] bg-[rgba(255,255,255,0.02)]">
                <div className="flex items-center gap-[9px] border-b border-[rgba(201,168,76,0.1)] px-[16px] py-[12px]">
                  <span className="h-[5px] w-[5px] rounded-full bg-[var(--gold)] opacity-70" />
                  <span className="text-[9px] uppercase tracking-[0.2em] text-[rgba(201,168,76,0.65)]">Video giới thiệu</span>
                </div>
                <div className="aspect-video overflow-hidden">
                  <iframe
                    src={product.intro_video_url
                      .replace('watch?v=', 'embed/')
                      .replace('youtu.be/', 'youtube.com/embed/')}
                    title="Product video"
                    className="h-full w-full"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            {/* Meta info */}
            <div className="overflow-hidden rounded-[18px] border border-[rgba(201,168,76,0.12)] bg-[rgba(255,255,255,0.02)]">
              <div className="flex items-center gap-[9px] border-b border-[rgba(201,168,76,0.1)] px-[16px] py-[12px]">
                <span className="h-[5px] w-[5px] rounded-full bg-[var(--gold)] opacity-70" />
                <span className="text-[9px] uppercase tracking-[0.2em] text-[rgba(201,168,76,0.65)]">Thông tin thêm</span>
              </div>
              <div className="px-[16px] py-[4px]">
                <KVRow label="Tagline VI">{product.tagline_vi}</KVRow>
                <KVRow label="Tagline EN">{product.tagline_en}</KVRow>
                <KVRow label="Danh mục">{product.category_slug}</KVRow>
                <KVRow label="Quy trình SX">{steps.length} bước</KVRow>
                <KVRow label="Chứng nhận">{certs.length} mục</KVRow>
                <KVRow label="Mẹo thưởng thức">{tips.length} mẹo</KVRow>
              </div>
            </div>

            {/* Quick action */}
            <Link
              href={`/admin/products/${productId}/edit`}
              className="flex h-[40px] w-full items-center justify-center gap-[6px] rounded-[14px] border border-[rgba(201,168,76,0.3)] bg-[rgba(201,168,76,0.06)] text-[11px] uppercase tracking-[0.12em] text-[var(--gold)] transition-all hover:bg-[rgba(201,168,76,0.12)]"
            >
              <PencilLine size={13} strokeWidth={1.8} />
              Chỉnh sửa sản phẩm này
            </Link>

          </div>
        </div>

      </section>
    </>
  );
}