'use client';

/**
 * components/admin/product-form/TabMedia.jsx
 * Tab 2 — Hình ảnh & Media
 * Fields: main_image_url, intro_video_url
 */

import { useState } from 'react';
import { UploadButton } from '../../../utils/uploadthing';
import { Film, ImageIcon, Trash2 } from 'lucide-react';

function SectionHead({ title, hint }) {
  return (
    <div className="flex items-center gap-[9px] border-b border-[rgba(201,168,76,0.1)] bg-[rgba(201,168,76,0.02)] px-[18px] py-[12px]">
      <span className="h-[5px] w-[5px] shrink-0 rounded-full bg-[var(--gold)] opacity-70" />
      <span className="flex-1 text-[9px] uppercase tracking-[0.22em] text-[rgba(201,168,76,0.7)]">{title}</span>
      {hint && <span className="text-[9px] italic text-[rgba(240,235,224,0.28)]">{hint}</span>}
    </div>
  );
}

export function TabMedia({ form, onChange, onError }) {
  const [dragging, setDragging] = useState(false);

  return (
    <div className="flex flex-col gap-[16px]">

      {/* ── Ảnh chính ── */}
      <div className="overflow-hidden rounded-[16px] border border-[rgba(201,168,76,0.1)] bg-[rgba(255,255,255,0.02)]">
        <SectionHead title="Ảnh chính" hint="main_image_url — UploadThing" />
        <div className="p-[18px]">
          <div className="grid grid-cols-[1fr_200px] gap-[16px]">

            {/* Preview */}
            <div
              className={[
                'relative flex items-center justify-center overflow-hidden rounded-[14px] border',
                'bg-[linear-gradient(135deg,#1c1810,#231e13)]',
                dragging
                  ? 'border-[rgba(201,168,76,0.55)] bg-[rgba(201,168,76,0.04)]'
                  : form.main_image_url
                  ? 'border-[rgba(201,168,76,0.18)]'
                  : 'border-dashed border-[rgba(201,168,76,0.2)]',
                'min-h-[220px]',
              ].join(' ')}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); }}
            >
              {form.main_image_url ? (
                <>
                  <img
                    src={form.main_image_url}
                    alt="Preview ảnh chính"
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    aria-label="Xóa ảnh"
                    onClick={() => onChange('main_image_url', '')}
                    className="absolute right-[10px] top-[10px] flex h-[28px] w-[28px] items-center justify-center rounded-full border border-[rgba(248,113,113,0.3)] bg-[rgba(12,11,9,0.7)] text-[rgba(248,113,113,0.7)] backdrop-blur-sm transition-all hover:bg-[rgba(248,113,113,0.15)] hover:text-[rgba(248,113,113,0.95)]"
                  >
                    <Trash2 size={12} strokeWidth={1.8} />
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center gap-[10px] text-center">
                  <ImageIcon size={28} strokeWidth={1} className="text-[rgba(201,168,76,0.25)]" />
                  <p className="text-[12px] text-[rgba(240,235,224,0.4)]">Chưa có ảnh</p>
                  <p className="text-[10px] text-[rgba(240,235,224,0.25)]">
                    {dragging ? 'Thả ảnh vào đây' : 'Kéo thả hoặc dùng nút bên phải'}
                  </p>
                </div>
              )}
            </div>

            {/* Upload controls */}
            <div className="flex flex-col gap-[12px]">
              <div className="rounded-[12px] border border-[rgba(201,168,76,0.1)] bg-[rgba(255,255,255,0.02)] p-[14px]">
                <p className="mb-[10px] text-[9px] uppercase tracking-[0.2em] text-[rgba(201,168,76,0.6)]">
                  Tải lên
                </p>
                <UploadButton
                  endpoint="mediaUploader"
                  onClientUploadComplete={(res) => {
                    const url = res?.[0]?.url;
                    if (url) onChange('main_image_url', url);
                  }}
                  onUploadError={(err) => onError?.(err.message || 'Upload ảnh thất bại')}
                />
                <p className="mt-[10px] text-[9px] text-[rgba(240,235,224,0.28)]">
                  JPG · PNG · WEBP · tối đa 4 MB
                </p>
              </div>

              {form.main_image_url && (
                <div className="rounded-[12px] border border-[rgba(201,168,76,0.1)] bg-[rgba(255,255,255,0.02)] p-[14px]">
                  <p className="mb-[6px] text-[9px] uppercase tracking-[0.2em] text-[rgba(240,235,224,0.3)]">
                    URL hiện tại
                  </p>
                  <p className="break-all text-[9px] leading-[1.5] text-[rgba(240,235,224,0.4)]">
                    {form.main_image_url}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Video giới thiệu ── */}
      <div className="overflow-hidden rounded-[16px] border border-[rgba(201,168,76,0.1)] bg-[rgba(255,255,255,0.02)]">
        <SectionHead title="Video giới thiệu" hint="intro_video_url" />
        <div className="p-[18px]">
          <div className="grid grid-cols-[1fr_auto] items-start gap-[12px]">
            <div>
              <p className="mb-[6px] text-[9px] uppercase tracking-[0.2em] text-[rgba(240,235,224,0.36)]">
                URL video
              </p>
              <div className="flex items-center gap-[8px] overflow-hidden rounded-[10px] border border-[rgba(201,168,76,0.1)] bg-[#11100d] focus-within:border-[rgba(201,168,76,0.35)]">
                <Film size={14} strokeWidth={1.4} className="ml-[12px] shrink-0 text-[rgba(201,168,76,0.4)]" />
                <input
                  type="url"
                  value={form.intro_video_url}
                  onChange={(e) => onChange('intro_video_url', e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="h-[36px] flex-1 bg-transparent pr-[12px] text-[12px] text-[rgba(240,235,224,0.7)] outline-none placeholder:text-[rgba(240,235,224,0.22)]"
                />
              </div>
              <p className="mt-[5px] text-[9px] italic text-[rgba(240,235,224,0.28)]">
                YouTube hoặc Vimeo. Dùng để nhúng vào trang sản phẩm.
              </p>
            </div>
          </div>

          {/* Video preview */}
          {form.intro_video_url && (
            <div className="mt-[14px] aspect-video w-full overflow-hidden rounded-[12px] border border-[rgba(201,168,76,0.12)] bg-[#1c1810]">
              <iframe
                src={form.intro_video_url
                  .replace('watch?v=', 'embed/')
                  .replace('youtu.be/', 'youtube.com/embed/')}
                title="Video preview"
                className="h-full w-full"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            </div>
          )}
        </div>
      </div>

    </div>
  );
}


/* ═════════════════════════════════════════════════════════
   Tab 3 — Câu chuyện sản phẩm (product_stories)
   Fields: origin, culture, philosophy, geo_impact,
           sustainability (vi/en each), intl_friendly_quote
═════════════════════════════════════════════════════════ */

function BiStoryRow({ labelVi, labelEn, fieldVi, fieldEn, form, onChange, rows = 4 }) {
  const cls =
    'w-full rounded-[10px] border border-[rgba(201,168,76,0.1)] bg-[#11100d] px-[12px] py-[9px] ' +
    'text-[12px] text-[rgba(240,235,224,0.72)] outline-none resize-y transition-colors ' +
    'focus:border-[rgba(201,168,76,0.38)] focus:text-[var(--ink)] ' +
    'placeholder:text-[rgba(240,235,224,0.2)]';

  return (
    <div className="grid grid-cols-2 gap-[12px]">
      <div>
        <div className="mb-[5px] flex items-center gap-[6px]">
          <span className="rounded-full border border-[rgba(201,168,76,0.3)] px-[5px] py-[1px] text-[8px] uppercase tracking-[0.12em] text-[rgba(201,168,76,0.7)]">VI</span>
          <span className="text-[9px] text-[rgba(240,235,224,0.35)]">{labelVi}</span>
        </div>
        <textarea rows={rows} className={cls} value={form[fieldVi] || ''}
          onChange={(e) => onChange(fieldVi, e.target.value)}
          placeholder="Nhập nội dung tiếng Việt..."
        />
      </div>
      <div>
        <div className="mb-[5px] flex items-center gap-[6px]">
          <span className="rounded-full border border-[rgba(147,197,253,0.25)] px-[5px] py-[1px] text-[8px] uppercase tracking-[0.12em] text-[rgba(147,197,253,0.6)]">EN</span>
          <span className="text-[9px] text-[rgba(240,235,224,0.35)]">{labelEn}</span>
        </div>
        <textarea rows={rows} className={cls} value={form[fieldEn] || ''}
          onChange={(e) => onChange(fieldEn, e.target.value)}
          placeholder="Enter English content..."
        />
      </div>
    </div>
  );
}

export function TabStory({ form, onChange }) {
  const sectionCls = 'overflow-hidden rounded-[16px] border border-[rgba(201,168,76,0.1)] bg-[rgba(255,255,255,0.02)]';
  const headCls = 'flex items-center gap-[9px] border-b border-[rgba(201,168,76,0.1)] bg-[rgba(201,168,76,0.02)] px-[18px] py-[12px]';

  const sections = [
    { title: 'Xuất xứ & Lịch sử', hint: 'origin_vi · origin_en', vi: 'Xuất xứ', en: 'Origin & history', fvi: 'story_origin_vi', fen: 'story_origin_en', rows: 5 },
    { title: 'Văn hóa',            hint: 'culture_vi · culture_en',      vi: 'Văn hóa',              en: 'Culture',              fvi: 'story_culture_vi',       fen: 'story_culture_en',       rows: 4 },
    { title: 'Triết lý thương hiệu', hint: 'philosophy_vi · philosophy_en', vi: 'Triết lý',           en: 'Philosophy',           fvi: 'story_philosophy_vi',    fen: 'story_philosophy_en',    rows: 4 },
    { title: 'Tác động địa lý',    hint: 'geo_impact_vi · geo_impact_en', vi: 'Tác động địa lý',    en: 'Geographical impact',  fvi: 'story_geo_impact_vi',    fen: 'story_geo_impact_en',    rows: 3 },
    { title: 'Tính bền vững',      hint: 'sustainability_vi · sustainability_en', vi: 'Bền vững',    en: 'Sustainability',       fvi: 'story_sustainability_vi', fen: 'story_sustainability_en', rows: 3 },
  ];

  return (
    <div className="flex flex-col gap-[16px]">
      {sections.map((s) => (
        <div key={s.fvi} className={sectionCls}>
          <div className={headCls}>
            <span className="h-[5px] w-[5px] shrink-0 rounded-full bg-[var(--gold)] opacity-70" />
            <span className="flex-1 text-[9px] uppercase tracking-[0.22em] text-[rgba(201,168,76,0.7)]">{s.title}</span>
            <span className="text-[9px] italic text-[rgba(240,235,224,0.28)]">{s.hint}</span>
          </div>
          <div className="p-[18px]">
            <BiStoryRow
              labelVi={s.vi} labelEn={s.en}
              fieldVi={s.fvi} fieldEn={s.fen}
              form={form} onChange={onChange} rows={s.rows}
            />
          </div>
        </div>
      ))}

      {/* International quote */}
      <div className={sectionCls}>
        <div className={headCls}>
          <span className="h-[5px] w-[5px] shrink-0 rounded-full bg-[var(--gold)] opacity-70" />
          <span className="flex-1 text-[9px] uppercase tracking-[0.22em] text-[rgba(201,168,76,0.7)]">
            Quote quốc tế
          </span>
          <span className="text-[9px] italic text-[rgba(240,235,224,0.28)]">intl_friendly_quote</span>
        </div>
        <div className="p-[18px]">
          <p className="mb-[6px] text-[9px] text-[rgba(240,235,224,0.36)]">
            Câu trích dẫn ngắn gọn, thân thiện với khách quốc tế. Hiển thị nổi bật trên trang sản phẩm.
          </p>
          <textarea
            rows={3}
            value={form.story_intl_friendly_quote || ''}
            onChange={(e) => onChange('story_intl_friendly_quote', e.target.value)}
            placeholder='"A centuries-old craft passed down through generations of Hue artisans..."'
            className="w-full rounded-[10px] border border-[rgba(201,168,76,0.1)] bg-[#11100d] px-[12px] py-[9px] text-[12px] italic text-[rgba(240,235,224,0.7)] outline-none resize-y transition-colors focus:border-[rgba(201,168,76,0.38)] placeholder:text-[rgba(240,235,224,0.2)] placeholder:not-italic"
          />
        </div>
      </div>
    </div>
  );
}


/* ═════════════════════════════════════════════════════════
   Tab 4 — Quy trình sản xuất (production_steps)
   Fields: step_number (auto), desc_vi, desc_en, step_image_url
═════════════════════════════════════════════════════════ */

import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import {
  SortableContext, arrayMove, verticalListSortingStrategy, useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus, Trash2 as Trash, Upload } from 'lucide-react';
import { UploadButton as UB } from '../../../utils/uploadthing';

function StepCard({ step, index, onChange, onDelete, onImageUpload, onImageError }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: step._id });

  const style = { transform: CSS.Transform.toString(transform), transition };
  const inputCls = 'w-full rounded-[8px] border border-[rgba(201,168,76,0.1)] bg-[#0f0e0c] px-[11px] text-[12px] text-[rgba(240,235,224,0.72)] outline-none resize-y transition-colors focus:border-[rgba(201,168,76,0.35)] placeholder:text-[rgba(240,235,224,0.2)]';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={[
        'overflow-hidden rounded-[14px] border transition-all',
        isDragging
          ? 'border-[rgba(201,168,76,0.5)] shadow-[0_16px_40px_rgba(0,0,0,0.4)] rotate-[0.8deg] z-50'
          : 'border-[rgba(240,235,224,0.08)] bg-[rgba(255,255,255,0.02)]',
      ].join(' ')}
    >
      {/* Header */}
      <div className="flex items-center gap-[10px] border-b border-[rgba(255,255,255,0.06)] px-[14px] py-[10px]">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab text-[rgba(201,168,76,0.35)] active:cursor-grabbing"
        >
          <GripVertical size={16} strokeWidth={1.4} />
        </div>
        <span className="flex h-[24px] w-[24px] items-center justify-center rounded-full border border-[rgba(201,168,76,0.3)] bg-[rgba(201,168,76,0.08)] text-[10px] text-[rgba(201,168,76,0.8)]">
          {index + 1}
        </span>
        <span className="flex-1 text-[10px] uppercase tracking-[0.14em] text-[rgba(240,235,224,0.35)]">
          Bước {index + 1}
        </span>
        <button
          type="button"
          onClick={() => onDelete(step._id)}
          className="flex h-[24px] w-[24px] items-center justify-center rounded-full border border-[rgba(240,235,224,0.08)] text-[rgba(240,235,224,0.3)] transition-all hover:border-[rgba(248,113,113,0.3)] hover:text-[rgba(248,113,113,0.7)]"
        >
          <Trash size={11} strokeWidth={1.8} />
        </button>
      </div>

      {/* Body */}
      <div className="p-[14px]">
        <div className="grid grid-cols-2 gap-[12px]">
          <div>
            <div className="mb-[5px] flex items-center gap-[5px]">
              <span className="rounded-full border border-[rgba(201,168,76,0.3)] px-[5px] py-[1px] text-[8px] uppercase text-[rgba(201,168,76,0.7)]">VI</span>
              <span className="text-[9px] text-[rgba(240,235,224,0.35)]">Mô tả bước — desc_vi</span>
            </div>
            <textarea
              rows={3}
              className={inputCls}
              value={step.desc_vi}
              onChange={(e) => onChange(step._id, 'desc_vi', e.target.value)}
              placeholder="Tép biển tươi được chọn lọc kỹ càng..."
            />
          </div>
          <div>
            <div className="mb-[5px] flex items-center gap-[5px]">
              <span className="rounded-full border border-[rgba(147,197,253,0.25)] px-[5px] py-[1px] text-[8px] uppercase text-[rgba(147,197,253,0.6)]">EN</span>
              <span className="text-[9px] text-[rgba(240,235,224,0.35)]">Step description — desc_en</span>
            </div>
            <textarea
              rows={3}
              className={inputCls}
              value={step.desc_en}
              onChange={(e) => onChange(step._id, 'desc_en', e.target.value)}
              placeholder="Fresh shrimp carefully selected..."
            />
          </div>
        </div>

        {/* Step image */}
        <div className="mt-[12px] flex items-center gap-[12px]">
          {step.step_image_url ? (
            <div className="relative h-[64px] w-[64px] shrink-0 overflow-hidden rounded-[10px] border border-[rgba(201,168,76,0.15)]">
              <img src={step.step_image_url} alt={`Bước ${index + 1}`} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => onChange(step._id, 'step_image_url', '')}
                className="absolute right-[3px] top-[3px] flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[rgba(0,0,0,0.7)] text-[rgba(248,113,113,0.8)] hover:bg-[rgba(248,113,113,0.2)]"
              >
                <Trash size={9} strokeWidth={2} />
              </button>
            </div>
          ) : (
            <div className="flex h-[64px] w-[64px] shrink-0 items-center justify-center rounded-[10px] border border-dashed border-[rgba(201,168,76,0.15)] bg-[#0f0e0c] text-[rgba(201,168,76,0.2)]">
              <Upload size={18} strokeWidth={1.2} />
            </div>
          )}
          <div className="flex flex-col gap-[4px]">
            <p className="text-[9px] uppercase tracking-[0.16em] text-[rgba(240,235,224,0.3)]">
              Ảnh minh họa bước — step_image_url
            </p>
            <UB
              endpoint="mediaUploader"
              onClientUploadComplete={(res) => {
                const url = res?.[0]?.url;
                if (url) onChange(step._id, 'step_image_url', url);
              }}
              onUploadError={(err) => onImageError?.(err.message)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

let _stepIdCounter = 1;
function newStep() {
  return { _id: `step-${Date.now()}-${_stepIdCounter++}`, desc_vi: '', desc_en: '', step_image_url: '' };
}

export function TabSteps({ steps, onStepsChange, onError }) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  function handleDragEnd({ active, over }) {
    if (!over || active.id === over.id) return;
    const oldIdx = steps.findIndex((s) => s._id === active.id);
    const newIdx = steps.findIndex((s) => s._id === over.id);
    onStepsChange(arrayMove(steps, oldIdx, newIdx));
  }

  function handleChange(id, field, value) {
    onStepsChange(steps.map((s) => s._id === id ? { ...s, [field]: value } : s));
  }

  function handleDelete(id) {
    onStepsChange(steps.filter((s) => s._id !== id));
  }

  return (
    <div className="flex flex-col gap-[14px]">
      <div className="flex items-end justify-between gap-[12px]">
        <div>
          <p className="text-[9px] uppercase tracking-[0.28em] text-[rgba(201,168,76,0.6)]">
            production_steps
          </p>
          <p className="mt-[4px] text-[12px] text-[rgba(240,235,224,0.4)]">
            Kéo thả để sắp xếp · thứ tự được tự động gán theo vị trí.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onStepsChange([...steps, newStep()])}
          className="flex h-[34px] shrink-0 items-center gap-[6px] rounded-full border border-[rgba(201,168,76,0.3)] bg-[rgba(201,168,76,0.06)] px-[14px] text-[11px] uppercase tracking-[0.1em] text-[var(--gold)] transition-all hover:bg-[rgba(201,168,76,0.12)]"
        >
          <Plus size={12} strokeWidth={2.2} />
          Thêm bước
        </button>
      </div>

      {steps.length === 0 ? (
        <div className="flex flex-col items-center gap-[10px] rounded-[16px] border border-dashed border-[rgba(201,168,76,0.15)] py-[48px] text-center">
          <p className="text-[12px] text-[rgba(240,235,224,0.3)]">Chưa có bước nào.</p>
          <button
            type="button"
            onClick={() => onStepsChange([newStep()])}
            className="text-[11px] uppercase tracking-[0.1em] text-[rgba(201,168,76,0.5)] hover:text-[var(--gold)]"
          >
            + Thêm bước đầu tiên
          </button>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={steps.map((s) => s._id)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-[10px]">
              {steps.map((step, i) => (
                <StepCard
                  key={step._id}
                  step={step}
                  index={i}
                  onChange={handleChange}
                  onDelete={handleDelete}
                  onImageError={onError}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}


/* ═════════════════════════════════════════════════════════
   Tab 5 — Chứng nhận & Mẹo thưởng thức
   certifications: cert_name, cert_icon
   how_to_enjoy:   tip_vi, tip_en
═════════════════════════════════════════════════════════ */

import { X } from 'lucide-react';

/* -- Certifications -- */
function CertTag({ cert, onDelete }) {
  return (
    <span className="inline-flex items-center gap-[6px] rounded-full border border-[rgba(201,168,76,0.25)] bg-[rgba(201,168,76,0.07)] px-[10px] py-[4px] text-[11px] text-[rgba(201,168,76,0.8)]">
      {cert.cert_icon && <span>{cert.cert_icon}</span>}
      {cert.cert_name}
      <button
        type="button"
        onClick={() => onDelete(cert._id)}
        className="ml-[2px] text-[rgba(201,168,76,0.4)] transition-colors hover:text-[rgba(248,113,113,0.7)]"
      >
        <X size={11} strokeWidth={2} />
      </button>
    </span>
  );
}

/* -- Enjoy tip row -- */
function TipRow({ tip, index, onChange, onDelete }) {
  const cls = 'w-full rounded-[8px] border border-[rgba(201,168,76,0.1)] bg-[#0f0e0c] px-[11px] py-[8px] text-[12px] text-[rgba(240,235,224,0.72)] outline-none resize-y transition-colors focus:border-[rgba(201,168,76,0.35)] placeholder:text-[rgba(240,235,224,0.2)]';
  return (
    <div className="flex items-start gap-[10px] rounded-[12px] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-[12px]">
      <span className="mt-[2px] flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border border-[rgba(201,168,76,0.25)] text-[9px] text-[rgba(201,168,76,0.7)]">
        {index + 1}
      </span>
      <div className="grid flex-1 grid-cols-2 gap-[10px]">
        <div>
          <div className="mb-[4px] flex items-center gap-[5px]">
            <span className="rounded-full border border-[rgba(201,168,76,0.3)] px-[5px] py-[1px] text-[8px] uppercase text-[rgba(201,168,76,0.7)]">VI</span>
          </div>
          <textarea rows={2} className={cls} value={tip.tip_vi} onChange={(e) => onChange(tip._id, 'tip_vi', e.target.value)} placeholder="Dùng kèm bún bò Huế hoặc cơm trắng..." />
        </div>
        <div>
          <div className="mb-[4px] flex items-center gap-[5px]">
            <span className="rounded-full border border-[rgba(147,197,253,0.25)] px-[5px] py-[1px] text-[8px] uppercase text-[rgba(147,197,253,0.6)]">EN</span>
          </div>
          <textarea rows={2} className={cls} value={tip.tip_en} onChange={(e) => onChange(tip._id, 'tip_en', e.target.value)} placeholder="Serve with Hue beef noodle soup..." />
        </div>
      </div>
      <button
        type="button"
        onClick={() => onDelete(tip._id)}
        className="mt-[2px] flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-full border border-[rgba(240,235,224,0.08)] text-[rgba(240,235,224,0.3)] transition-all hover:border-[rgba(248,113,113,0.3)] hover:text-[rgba(248,113,113,0.7)]"
      >
        <Trash size={11} strokeWidth={1.8} />
      </button>
    </div>
  );
}

let _certId = 1, _tipId = 1;
const newCert = () => ({ _id: `cert-${Date.now()}-${_certId++}`, cert_name: '', cert_icon: '' });
const newTip  = () => ({ _id: `tip-${Date.now()}-${_tipId++}`, tip_vi: '', tip_en: '' });

export function TabCerts({ certs, onCertsChange, tips, onTipsChange }) {
  const [certName, setCertName] = useState('');
  const [certIcon, setCertIcon] = useState('');

  function addCert() {
    const name = certName.trim();
    if (!name) return;
    onCertsChange([...certs, { ...newCert(), cert_name: name, cert_icon: certIcon.trim() }]);
    setCertName(''); setCertIcon('');
  }

  function changeTip(id, field, value) {
    onTipsChange(tips.map((t) => t._id === id ? { ...t, [field]: value } : t));
  }

  const inputCls = 'h-[34px] rounded-[8px] border border-[rgba(201,168,76,0.1)] bg-[#11100d] px-[11px] text-[12px] text-[rgba(240,235,224,0.7)] outline-none transition-colors focus:border-[rgba(201,168,76,0.35)] placeholder:text-[rgba(240,235,224,0.22)]';
  const secCls = 'overflow-hidden rounded-[16px] border border-[rgba(201,168,76,0.1)] bg-[rgba(255,255,255,0.02)]';
  const headCls = 'flex items-center gap-[9px] border-b border-[rgba(201,168,76,0.1)] bg-[rgba(201,168,76,0.02)] px-[18px] py-[12px]';

  return (
    <div className="flex flex-col gap-[16px]">

      {/* Certifications */}
      <div className={secCls}>
        <div className={headCls}>
          <span className="h-[5px] w-[5px] shrink-0 rounded-full bg-[var(--gold)] opacity-70" />
          <span className="flex-1 text-[9px] uppercase tracking-[0.22em] text-[rgba(201,168,76,0.7)]">Chứng nhận</span>
          <span className="text-[9px] italic text-[rgba(240,235,224,0.28)]">certifications: cert_name · cert_icon</span>
        </div>
        <div className="p-[18px]">
          {/* Existing tags */}
          {certs.length > 0 && (
            <div className="mb-[14px] flex flex-wrap gap-[8px]">
              {certs.map((c) => (
                <CertTag
                  key={c._id}
                  cert={c}
                  onDelete={(id) => onCertsChange(certs.filter((x) => x._id !== id))}
                />
              ))}
            </div>
          )}

          {/* Add form */}
          <div className="flex gap-[8px]">
            <input
              type="text"
              value={certName}
              onChange={(e) => setCertName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCert())}
              placeholder="Tên chứng nhận (VD: OCOP 4★)"
              className={`${inputCls} flex-1`}
            />
            <input
              type="text"
              value={certIcon}
              onChange={(e) => setCertIcon(e.target.value)}
              placeholder="Icon (emoji)"
              className={`${inputCls} w-[80px]`}
            />
            <button
              type="button"
              onClick={addCert}
              disabled={!certName.trim()}
              className="flex h-[34px] items-center gap-[5px] rounded-full border border-[rgba(201,168,76,0.3)] bg-[rgba(201,168,76,0.06)] px-[14px] text-[10px] uppercase tracking-[0.1em] text-[var(--gold)] transition-all hover:bg-[rgba(201,168,76,0.12)] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus size={11} strokeWidth={2.2} />
              Thêm
            </button>
          </div>
          <p className="mt-[6px] text-[9px] italic text-[rgba(240,235,224,0.26)]">
            Nhấn Enter hoặc nút Thêm. Ví dụ: OCOP 4★, VSATTP, ISO 22000, Vietgap...
          </p>
        </div>
      </div>

      {/* How to enjoy */}
      <div className={secCls}>
        <div className={headCls}>
          <span className="h-[5px] w-[5px] shrink-0 rounded-full bg-[var(--gold)] opacity-70" />
          <span className="flex-1 text-[9px] uppercase tracking-[0.22em] text-[rgba(201,168,76,0.7)]">Mẹo thưởng thức</span>
          <span className="text-[9px] italic text-[rgba(240,235,224,0.28)]">how_to_enjoy: tip_vi · tip_en</span>
        </div>
        <div className="p-[18px]">
          {tips.length === 0 ? (
            <div className="py-[24px] text-center text-[12px] text-[rgba(240,235,224,0.3)]">
              Chưa có mẹo nào.
            </div>
          ) : (
            <div className="mb-[12px] flex flex-col gap-[10px]">
              {tips.map((tip, i) => (
                <TipRow
                  key={tip._id}
                  tip={tip}
                  index={i}
                  onChange={changeTip}
                  onDelete={(id) => onTipsChange(tips.filter((t) => t._id !== id))}
                />
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={() => onTipsChange([...tips, newTip()])}
            className="flex h-[34px] items-center gap-[6px] rounded-full border border-[rgba(201,168,76,0.22)] px-[14px] text-[10px] uppercase tracking-[0.1em] text-[rgba(201,168,76,0.6)] transition-all hover:bg-[rgba(201,168,76,0.06)] hover:text-[var(--gold)]"
          >
            <Plus size={11} strokeWidth={2.2} />
            Thêm mẹo
          </button>
        </div>
      </div>

    </div>
  );
}