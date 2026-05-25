'use client';

/**
 * components/admin/product-form/ProductFormPage.jsx
 *
 * Shell dùng chung cho /admin/products/new  và  /admin/products/[id]/edit
 *
 * Props:
 *   mode        — 'new' | 'edit'
 *   initialData — object | null  (chỉ dùng khi mode='edit')
 *   productId   — string | null
 *
 * Đặt tại:
 *   app/admin/products/new/page.jsx         → <ProductFormPage mode="new" />
 *   app/admin/products/[id]/edit/page.jsx   → load data rồi <ProductFormPage mode="edit" ... />
 */

import { useEffect, useReducer, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Eye, Save, Send, ChevronLeft, ChevronRight,
  CheckCircle2, Circle, AlertCircle, X,
} from 'lucide-react';
import api from '../../../../lib/api';
import TabBasic from './TabBasic';
import { TabMedia, TabStory, TabSteps, TabCerts } from './ProductFormTabs';

/* ─────────────────────────────────────────────
   FORM STATE SHAPE — maps to full schema
───────────────────────────────────────────── */
const EMPTY_FORM = {
  /* products */
  id: '', category_slug: '',
  name_vi: '', name_en: '', tagline_vi: '', tagline_en: '',
  price_vnd: '', price_usd: '', weight_gram: '', unit: '', stock: '',
  suitable_for_vegan: false,
  summary_vi: '', summary_en: '',
  ingredients_vi: '', ingredients_en: '',
  allergens_vi: '', allergens_en: '',
  shelf_life_vi: '', shelf_life_en: '',
  preservation_vi: '', preservation_en: '',
  shipping_vi: '', shipping_en: '',
  packaging_vi: '', packaging_en: '',
  guarantee_vi: '', guarantee_en: '',
  main_image_url: '',
  intro_video_url: '',
  /* product_stories — prefixed story_ */
  story_origin_vi: '', story_origin_en: '',
  story_culture_vi: '', story_culture_en: '',
  story_philosophy_vi: '', story_philosophy_en: '',
  story_geo_impact_vi: '', story_geo_impact_en: '',
  story_sustainability_vi: '', story_sustainability_en: '',
  story_intl_friendly_quote: '',
};

function formReducer(state, action) {
  switch (action.type) {
    case 'SET_FIELD': return { ...state, [action.field]: action.value };
    case 'SET_ALL':   return { ...state, ...action.data };
    default:          return state;
  }
}

/* ─────────────────────────────────────────────
   TAB CONFIG
───────────────────────────────────────────── */
const TABS = [
  { key: 'basic',  label: 'Thông tin cơ bản' },
  { key: 'media',  label: 'Hình ảnh & Media'  },
  { key: 'story',  label: 'Câu chuyện'        },
  { key: 'steps',  label: 'Quy trình SX'      },
  { key: 'certs',  label: 'Chứng nhận & Tips' },
];

/* Kiểm tra tab đã có nội dung chưa (cho progress sidebar) */
function tabFilled(key, form, steps, certs, tips) {
  if (key === 'basic')  return Boolean(form.name_vi && form.price_vnd && form.stock !== '');
  if (key === 'media')  return Boolean(form.main_image_url);
  if (key === 'story')  return Boolean(form.story_origin_vi || form.story_origin_en);
  if (key === 'steps')  return steps.length > 0;
  if (key === 'certs')  return certs.length > 0 || tips.length > 0;
  return false;
}

/* ─────────────────────────────────────────────
   PROGRESS SIDEBAR
───────────────────────────────────────────── */
function ProgressSidebar({ tabs, activeTab, setTab, form, steps, certs, tips }) {
  return (
    <div className="flex flex-col gap-[4px]">
      {tabs.map((t) => {
        const filled = tabFilled(t.key, form, steps, certs, tips);
        const active = activeTab === t.key;
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={[
              'flex items-center gap-[9px] rounded-[10px] px-[12px] py-[9px] text-[12px] text-left transition-all',
              active ? 'bg-[rgba(201,168,76,0.08)] text-[var(--gold)]' : 'text-[rgba(240,235,224,0.45)] hover:text-[rgba(240,235,224,0.7)]',
            ].join(' ')}
          >
            {filled
              ? <CheckCircle2 size={14} strokeWidth={1.6} className="shrink-0 text-[rgba(134,239,172,0.65)]" />
              : active
              ? <Circle size={14} strokeWidth={1.8} className="shrink-0 text-[var(--gold)]" />
              : <Circle size={14} strokeWidth={1.2} className="shrink-0 opacity-30" />
            }
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────
   TOAST
───────────────────────────────────────────── */
function Toast({ message, type = 'success', onClose }) {
  const colors = type === 'error'
    ? 'border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.08)] text-[rgba(248,113,113,0.9)]'
    : 'border-[rgba(134,239,172,0.3)] bg-[rgba(134,239,172,0.06)] text-[rgba(134,239,172,0.85)]';
  return (
    <div className={`fixed bottom-[24px] right-[24px] z-50 flex items-center gap-[10px] rounded-[12px] border px-[16px] py-[12px] text-[12px] shadow-[0_8px_30px_rgba(0,0,0,0.4)] ${colors}`}>
      {type === 'error'
        ? <AlertCircle size={14} strokeWidth={1.6} className="shrink-0" />
        : <CheckCircle2 size={14} strokeWidth={1.6} className="shrink-0" />
      }
      {message}
      <button type="button" onClick={onClose} className="opacity-50 hover:opacity-100"><X size={13} /></button>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export default function ProductFormPage({ mode = 'new', initialData = null, productId = null }) {
  const router = useRouter();
  const isEdit = mode === 'edit';

  const [form, dispatch]    = useReducer(formReducer, EMPTY_FORM);
  const [steps, setSteps]   = useState([]);
  const [certs, setCerts]   = useState([]);
  const [tips,  setTips]    = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeTab, setTab] = useState('basic');
  const [submitting, setSubmitting] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [toast, setToast]   = useState(null); // { message, type }
  const [errors, setErrors] = useState({});

  /* ── Load categories ── */
  useEffect(() => {
    api.get('/categories').then(({ data }) => {
      setCategories(Array.isArray(data?.data) ? data.data : []);
    }).catch(() => {});
  }, []);

  /* ── Populate form when editing ── */
  useEffect(() => {
    if (!initialData) return;
    const d = initialData;

    dispatch({ type: 'SET_ALL', data: {
      id: d.id || '',
      category_slug: d.category_slug || '',
      name_vi: d.name_vi || '', name_en: d.name_en || '',
      tagline_vi: d.tagline_vi || '', tagline_en: d.tagline_en || '',
      price_vnd: d.price_vnd ?? '', price_usd: d.price_usd ?? '',
      weight_gram: d.weight_gram ?? '', unit: d.unit || '', stock: d.stock ?? '',
      suitable_for_vegan: Boolean(d.suitable_for_vegan),
      summary_vi: d.summary_vi || '', summary_en: d.summary_en || '',
      ingredients_vi: d.ingredients_vi || '', ingredients_en: d.ingredients_en || '',
      allergens_vi: d.allergens_vi || '', allergens_en: d.allergens_en || '',
      shelf_life_vi: d.shelf_life_vi || '', shelf_life_en: d.shelf_life_en || '',
      preservation_vi: d.preservation_vi || '', preservation_en: d.preservation_en || '',
      shipping_vi: d.shipping_vi || '', shipping_en: d.shipping_en || '',
      packaging_vi: d.packaging_vi || '', packaging_en: d.packaging_en || '',
      guarantee_vi: d.guarantee_vi || '', guarantee_en: d.guarantee_en || '',
      main_image_url: d.main_image_url || '',
      intro_video_url: d.intro_video_url || '',
      /* story */
      story_origin_vi: d.story?.origin_vi || '',
      story_origin_en: d.story?.origin_en || '',
      story_culture_vi: d.story?.culture_vi || '',
      story_culture_en: d.story?.culture_en || '',
      story_philosophy_vi: d.story?.philosophy_vi || '',
      story_philosophy_en: d.story?.philosophy_en || '',
      story_geo_impact_vi: d.story?.geo_impact_vi || '',
      story_geo_impact_en: d.story?.geo_impact_en || '',
      story_sustainability_vi: d.story?.sustainability_vi || '',
      story_sustainability_en: d.story?.sustainability_en || '',
      story_intl_friendly_quote: d.story?.intl_friendly_quote || '',
    }});

    if (Array.isArray(d.production_steps)) {
      setSteps(d.production_steps.map((s, i) => ({ ...s, _id: `step-loaded-${i}` })));
    }
    if (Array.isArray(d.certifications)) {
      setCerts(d.certifications.map((c, i) => ({ ...c, _id: `cert-loaded-${i}` })));
    }
    if (Array.isArray(d.how_to_enjoy)) {
      setTips(d.how_to_enjoy.map((t, i) => ({ ...t, _id: `tip-loaded-${i}` })));
    }
  }, [initialData]);

  /* ── Field change handler ── */
  const handleChange = useCallback((field, value) => {
    dispatch({ type: 'SET_FIELD', field, value });
    if (errors[field]) setErrors((e) => { const next = { ...e }; delete next[field]; return next; });
  }, [errors]);

  /* ── Validate ── */
  function validate() {
    const e = {};
    if (!form.name_vi.trim()) e.name_vi = 'Bắt buộc';
    if (!form.category_slug)  e.category_slug = 'Bắt buộc';
    if (!isEdit && !form.id.trim()) e.id = 'Bắt buộc';
    if (form.price_vnd === '' || isNaN(Number(form.price_vnd))) e.price_vnd = 'Phải là số';
    if (form.stock === '' || isNaN(Number(form.stock))) e.stock = 'Phải là số';
    setErrors(e);
    if (Object.keys(e).length > 0) {
      setTab('basic');
      showToast('Vui lòng kiểm tra lại các trường bắt buộc.', 'error');
    }
    return Object.keys(e).length === 0;
  }

  function showToast(message, type = 'success') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }

  /* ── Build payload ── */
  function buildPayload() {
    return {
      /* products table */
      id: form.id.trim(),
      category_slug: form.category_slug,
      name_vi: form.name_vi.trim(), name_en: form.name_en.trim(),
      tagline_vi: form.tagline_vi, tagline_en: form.tagline_en,
      price_vnd: Number(form.price_vnd),
      price_usd: form.price_usd !== '' ? Number(form.price_usd) : null,
      weight_gram: form.weight_gram !== '' ? Number(form.weight_gram) : null,
      unit: form.unit,
      stock: Number(form.stock),
      suitable_for_vegan: Boolean(form.suitable_for_vegan),
      summary_vi: form.summary_vi, summary_en: form.summary_en,
      ingredients_vi: form.ingredients_vi, ingredients_en: form.ingredients_en,
      allergens_vi: form.allergens_vi, allergens_en: form.allergens_en,
      shelf_life_vi: form.shelf_life_vi, shelf_life_en: form.shelf_life_en,
      preservation_vi: form.preservation_vi, preservation_en: form.preservation_en,
      shipping_vi: form.shipping_vi, shipping_en: form.shipping_en,
      packaging_vi: form.packaging_vi, packaging_en: form.packaging_en,
      guarantee_vi: form.guarantee_vi, guarantee_en: form.guarantee_en,
      main_image_url: form.main_image_url,
      intro_video_url: form.intro_video_url,
      /* product_stories */
      story: {
        origin_vi: form.story_origin_vi, origin_en: form.story_origin_en,
        culture_vi: form.story_culture_vi, culture_en: form.story_culture_en,
        philosophy_vi: form.story_philosophy_vi, philosophy_en: form.story_philosophy_en,
        geo_impact_vi: form.story_geo_impact_vi, geo_impact_en: form.story_geo_impact_en,
        sustainability_vi: form.story_sustainability_vi, sustainability_en: form.story_sustainability_en,
        intl_friendly_quote: form.story_intl_friendly_quote,
      },
      /* production_steps — strip _id, add step_number */
      production_steps: steps.map((s, i) => ({
        step_number: i + 1,
        desc_vi: s.desc_vi, desc_en: s.desc_en,
        step_image_url: s.step_image_url,
      })),
      /* certifications */
      certifications: certs.map((c) => ({ cert_name: c.cert_name, cert_icon: c.cert_icon })),
      /* how_to_enjoy */
      how_to_enjoy: tips.map((t) => ({ tip_vi: t.tip_vi, tip_en: t.tip_en })),
    };
  }

  /* ── Submit (publish) ── */
  async function handleSubmit() {
    if (!validate()) return;
    try {
      setSubmitting(true);
      const payload = buildPayload();
      if (isEdit) {
        await api.put(`/products/${productId}`, payload);
        showToast('Cập nhật sản phẩm thành công');
      } else {
        await api.post('/products', payload);
        showToast('Thêm sản phẩm thành công');
      }
      setTimeout(() => router.push('/admin/products'), 1200);
    } catch (err) {
      showToast(err?.response?.data?.message || 'Lưu thất bại, vui lòng thử lại.', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  /* ── Save draft (không validate chặt) ── */
  async function handleSaveDraft() {
    if (!form.name_vi.trim()) { showToast('Cần có tên sản phẩm để lưu nháp.', 'error'); return; }
    try {
      setSavingDraft(true);
      const payload = buildPayload();
      if (isEdit) await api.put(`/products/${productId}`, { ...payload, is_draft: true });
      else        await api.post('/products', { ...payload, is_draft: true });
      showToast('Đã lưu nháp');
    } catch (err) {
      showToast('Lưu nháp thất bại.', 'error');
    } finally {
      setSavingDraft(false);
    }
  }

  /* ── Tab navigation ── */
  const tabIdx = TABS.findIndex((t) => t.key === activeTab);
  const hasPrev = tabIdx > 0;
  const hasNext = tabIdx < TABS.length - 1;

  /* ─────────────────────────────────────────
     RENDER
  ───────────────────────────────────────── */
  return (
    <>
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      <section className="flex flex-col gap-[20px]">

        {/* ── Page header ── */}
        <div className="flex items-start justify-between gap-[16px]">
          <div>
            <p className="text-[9px] uppercase tracking-[0.28em] text-[rgba(201,168,76,0.6)]">
              Admin / Sản phẩm / {isEdit ? 'Chỉnh sửa' : 'Thêm mới'}
            </p>
            <h1
              className="mt-[6px] text-[2.1rem] leading-[1.05] tracking-[-0.03em] text-[var(--ink)]"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 300 }}
            >
              {isEdit
                ? <>Sửa <em className="italic text-[var(--gold)]">sản phẩm</em></>
                : <>Thêm <em className="italic text-[var(--gold)]">sản phẩm</em> mới</>}
            </h1>
            <p className="mt-[4px] text-[12px] text-[rgba(240,235,224,0.38)]">
              Điền đầy đủ theo từng nhóm · Các trường song ngữ vi / en hỗ trợ đa thị trường.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-[8px] pt-[4px]">
            <Link
              href="/admin/products"
              className="flex h-[34px] items-center gap-[5px] rounded-full border border-[rgba(240,235,224,0.1)] px-[14px] text-[11px] uppercase tracking-[0.1em] text-[rgba(240,235,224,0.45)] transition-all hover:border-[rgba(240,235,224,0.2)] hover:text-[rgba(240,235,224,0.7)]"
            >
              <ChevronLeft size={13} strokeWidth={1.6} />
              Quay lại
            </Link>

            {/* Preview — đang phát triển */}
            <button
              type="button"
              disabled
              title="Xem trước — đang phát triển"
              className="flex h-[34px] items-center gap-[5px] rounded-full border border-[rgba(240,235,224,0.1)] px-[14px] text-[11px] uppercase tracking-[0.1em] text-[rgba(240,235,224,0.3)] disabled:cursor-not-allowed"
            >
              <Eye size={12} strokeWidth={1.6} />
              Xem trước
              <span className="rounded-full border border-[rgba(240,235,224,0.1)] px-[4px] text-[8px] text-[rgba(240,235,224,0.25)]">sắp ra</span>
            </button>

            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={savingDraft || submitting}
              className="flex h-[34px] items-center gap-[5px] rounded-full border border-[rgba(240,235,224,0.1)] px-[14px] text-[11px] uppercase tracking-[0.1em] text-[rgba(240,235,224,0.55)] transition-all hover:border-[rgba(240,235,224,0.2)] hover:text-[rgba(240,235,224,0.8)] disabled:opacity-50"
            >
              <Save size={12} strokeWidth={1.6} />
              {savingDraft ? 'Đang lưu...' : 'Lưu nháp'}
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || savingDraft}
              className="flex h-[34px] items-center gap-[5px] rounded-full bg-[var(--gold)] px-[18px] text-[11px] font-semibold uppercase tracking-[0.1em] text-[#1a1208] transition-opacity hover:opacity-88 disabled:opacity-50"
            >
              <Send size={12} strokeWidth={2} />
              {submitting ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Xuất bản'}
            </button>
          </div>
        </div>

        {/* ── Tab bar ── */}
        <div className="flex border-b border-[rgba(201,168,76,0.12)]">
          {TABS.map((t, i) => {
            const filled = tabFilled(t.key, form, steps, certs, tips);
            const active = activeTab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={[
                  'flex items-center gap-[6px] px-[16px] py-[10px] text-[11px] uppercase tracking-[0.08em]',
                  'border-b-[2px] -mb-px transition-colors whitespace-nowrap',
                  active
                    ? 'border-[var(--gold)] text-[var(--gold)]'
                    : 'border-transparent text-[rgba(240,235,224,0.35)] hover:text-[rgba(240,235,224,0.6)]',
                ].join(' ')}
              >
                {filled
                  ? <CheckCircle2 size={11} strokeWidth={1.8} className="text-[rgba(134,239,172,0.7)]" />
                  : <span className={`text-[10px] ${active ? 'text-[var(--gold)]' : 'text-[rgba(240,235,224,0.25)]'}`}>{i + 1}</span>
                }
                {t.label}
              </button>
            );
          })}
        </div>

        {/* ── Form layout: content + sidebar ── */}
        <div className="grid grid-cols-[1fr_240px] items-start gap-[16px]">

          {/* Tab content */}
          <div>
            {activeTab === 'basic' && (
              <TabBasic form={form} onChange={handleChange} categories={categories} isEdit={isEdit} />
            )}
            {activeTab === 'media' && (
              <TabMedia
                form={form}
                onChange={handleChange}
                onError={(msg) => showToast(msg, 'error')}
              />
            )}
            {activeTab === 'story' && (
              <TabStory form={form} onChange={handleChange} />
            )}
            {activeTab === 'steps' && (
              <TabSteps
                steps={steps}
                onStepsChange={setSteps}
                onError={(msg) => showToast(msg, 'error')}
              />
            )}
            {activeTab === 'certs' && (
              <TabCerts
                certs={certs} onCertsChange={setCerts}
                tips={tips}   onTipsChange={setTips}
              />
            )}

            {/* Prev / Next navigation */}
            <div className="mt-[20px] flex items-center justify-between">
              <button
                type="button"
                onClick={() => setTab(TABS[tabIdx - 1].key)}
                disabled={!hasPrev}
                className="flex h-[34px] items-center gap-[5px] rounded-full border border-[rgba(240,235,224,0.1)] px-[14px] text-[11px] uppercase tracking-[0.1em] text-[rgba(240,235,224,0.45)] transition-all hover:border-[rgba(240,235,224,0.2)] hover:text-[rgba(240,235,224,0.7)] disabled:opacity-0"
              >
                <ChevronLeft size={13} strokeWidth={1.6} />
                {hasPrev ? TABS[tabIdx - 1].label : ''}
              </button>

              {hasNext ? (
                <button
                  type="button"
                  onClick={() => setTab(TABS[tabIdx + 1].key)}
                  className="flex h-[34px] items-center gap-[5px] rounded-full border border-[rgba(201,168,76,0.25)] px-[14px] text-[11px] uppercase tracking-[0.1em] text-[rgba(201,168,76,0.7)] transition-all hover:bg-[rgba(201,168,76,0.06)] hover:text-[var(--gold)]"
                >
                  {TABS[tabIdx + 1].label}
                  <ChevronRight size={13} strokeWidth={1.6} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex h-[34px] items-center gap-[5px] rounded-full bg-[var(--gold)] px-[18px] text-[11px] font-semibold uppercase tracking-[0.1em] text-[#1a1208] transition-opacity hover:opacity-88 disabled:opacity-50"
                >
                  <Send size={12} strokeWidth={2} />
                  {submitting ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Xuất bản'}
                </button>
              )}
            </div>
          </div>

          {/* Right sidebar: progress + ảnh chính shortcut + stats */}
          <div className="sticky top-[24px] flex flex-col gap-[14px]">

            {/* Progress checklist */}
            <div className="overflow-hidden rounded-[16px] border border-[rgba(201,168,76,0.1)] bg-[rgba(255,255,255,0.02)]">
              <div className="flex items-center gap-[9px] border-b border-[rgba(201,168,76,0.1)] px-[16px] py-[12px]">
                <span className="h-[5px] w-[5px] rounded-full bg-[var(--gold)] opacity-70" />
                <span className="text-[9px] uppercase tracking-[0.22em] text-[rgba(201,168,76,0.7)]">Tiến độ</span>
                <span className="ml-auto text-[10px] text-[rgba(240,235,224,0.35)]">
                  {TABS.filter((t) => tabFilled(t.key, form, steps, certs, tips)).length}/{TABS.length}
                </span>
              </div>
              <div className="p-[12px]">
                <ProgressSidebar
                  tabs={TABS}
                  activeTab={activeTab}
                  setTab={setTab}
                  form={form}
                  steps={steps}
                  certs={certs}
                  tips={tips}
                />
              </div>
            </div>

            {/* Ảnh chính shortcut */}
            <div className="overflow-hidden rounded-[16px] border border-[rgba(201,168,76,0.1)] bg-[rgba(255,255,255,0.02)]">
              <div className="flex items-center gap-[9px] border-b border-[rgba(201,168,76,0.1)] px-[16px] py-[12px]">
                <span className="h-[5px] w-[5px] rounded-full bg-[var(--gold)] opacity-70" />
                <span className="text-[9px] uppercase tracking-[0.22em] text-[rgba(201,168,76,0.7)]">Ảnh chính</span>
              </div>
              <div className="p-[12px]">
                {form.main_image_url ? (
                  <div className="overflow-hidden rounded-[10px] border border-[rgba(201,168,76,0.12)]">
                    <img src={form.main_image_url} alt="Preview" className="h-[140px] w-full object-cover" />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setTab('media')}
                    className="flex w-full flex-col items-center gap-[8px] rounded-[10px] border border-dashed border-[rgba(201,168,76,0.18)] py-[24px] text-center transition-all hover:border-[rgba(201,168,76,0.38)]"
                  >
                    <span className="text-[10px] uppercase tracking-[0.14em] text-[rgba(240,235,224,0.3)]">Chưa có ảnh</span>
                    <span className="text-[10px] text-[rgba(201,168,76,0.5)] hover:text-[var(--gold)]">Đến tab Media →</span>
                  </button>
                )}
              </div>
            </div>

            {/* Stats (edit mode only) */}
            {isEdit && (
              <div className="overflow-hidden rounded-[16px] border border-[rgba(201,168,76,0.1)] bg-[rgba(255,255,255,0.02)]">
                <div className="flex items-center gap-[9px] border-b border-[rgba(201,168,76,0.1)] px-[16px] py-[12px]">
                  <span className="h-[5px] w-[5px] rounded-full bg-[var(--gold)] opacity-70" />
                  <span className="text-[9px] uppercase tracking-[0.22em] text-[rgba(201,168,76,0.7)]">Thống kê</span>
                </div>
                <div className="flex flex-col gap-[8px] p-[14px]">
                  {[
                    { label: 'Lượt xem', value: initialData?.view_count ?? 0 },
                    { label: 'Đã bán',   value: initialData?.sales_count ?? 0 },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="text-[11px] text-[rgba(240,235,224,0.38)]">{label}</span>
                      <span
                        className="text-[14px] text-[rgba(240,235,224,0.75)]"
                        style={{ fontFamily: 'var(--font-display)', fontWeight: 300 }}
                      >
                        {Number(value).toLocaleString('vi-VN')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </section>
    </>
  );
}