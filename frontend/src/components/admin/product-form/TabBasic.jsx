'use client';

/**
 * components/admin/product-form/TabBasic.jsx
 *
 * Tab 1 — Thông tin cơ bản
 * Fields: id, category_slug, name_vi/en, tagline_vi/en,
 *         price_vnd, price_usd, weight_gram, unit, stock, suitable_for_vegan,
 *         summary_vi/en, ingredients_vi/en, allergens_vi/en,
 *         shelf_life_vi/en, preservation_vi/en,
 *         shipping_vi/en, packaging_vi/en, guarantee_vi/en
 *
 * Props:
 *   form         — object (full product state)
 *   onChange     — (field, value) => void
 *   categories   — [{ slug, name_vi }]
 *   isEdit       — boolean
 */

/* ── Field primitives ── */
function Label({ children }) {
  return (
    <p className="mb-[5px] text-[9px] uppercase tracking-[0.2em] text-[rgba(240,235,224,0.36)]">
      {children}
    </p>
  );
}

function FieldHint({ children }) {
  return (
    <p className="mt-[4px] text-[9px] italic text-[rgba(240,235,224,0.28)]">{children}</p>
  );
}

const inputCls =
  'w-full rounded-[10px] border border-[rgba(201,168,76,0.1)] bg-[#11100d] px-[12px] ' +
  'text-[12px] text-[rgba(240,235,224,0.75)] outline-none transition-colors ' +
  'focus:border-[rgba(201,168,76,0.38)] focus:text-[var(--ink)] ' +
  'placeholder:text-[rgba(240,235,224,0.22)]';

function Input({ label, hint, ...props }) {
  return (
    <div>
      {label && <Label>{label}</Label>}
      <input className={`${inputCls} h-[36px]`} {...props} />
      {hint && <FieldHint>{hint}</FieldHint>}
    </div>
  );
}

function Textarea({ label, hint, rows = 3, ...props }) {
  return (
    <div>
      {label && <Label>{label}</Label>}
      <textarea
        rows={rows}
        className={`${inputCls} py-[9px] resize-y`}
        {...props}
      />
      {hint && <FieldHint>{hint}</FieldHint>}
    </div>
  );
}

function Select({ label, children, ...props }) {
  return (
    <div>
      {label && <Label>{label}</Label>}
      <select className={`${inputCls} h-[36px] cursor-pointer`} {...props}>
        {children}
      </select>
    </div>
  );
}

function Checkbox({ label, checked, onChange }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-center gap-[9px] py-[6px] text-left"
    >
      <span
        className={[
          'flex h-[17px] w-[17px] shrink-0 items-center justify-center rounded-[4px] border transition-all',
          checked
            ? 'border-[rgba(201,168,76,0.6)] bg-[rgba(201,168,76,0.15)]'
            : 'border-[rgba(240,235,224,0.2)] bg-transparent',
        ].join(' ')}
      >
        {checked && (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 5l2 2 4-4" stroke="var(--gold)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span className="text-[12px] text-[rgba(240,235,224,0.62)]">{label}</span>
    </button>
  );
}

/* ── Section wrapper ── */
function Section({ title, hint, children }) {
  return (
    <div className="overflow-hidden rounded-[16px] border border-[rgba(201,168,76,0.1)] bg-[rgba(255,255,255,0.02)]">
      <div className="flex items-center gap-[9px] border-b border-[rgba(201,168,76,0.1)] bg-[rgba(201,168,76,0.02)] px-[18px] py-[12px]">
        <span className="h-[5px] w-[5px] shrink-0 rounded-full bg-[var(--gold)] opacity-70" />
        <span className="flex-1 text-[9px] uppercase tracking-[0.22em] text-[rgba(201,168,76,0.7)]">
          {title}
        </span>
        {hint && (
          <span className="text-[9px] italic text-[rgba(240,235,224,0.28)]">{hint}</span>
        )}
      </div>
      <div className="p-[18px]">{children}</div>
    </div>
  );
}

/* ── Bilingual row: vi | en side-by-side ── */
function BiRow({ children }) {
  return (
    <div className="grid grid-cols-2 gap-[12px]">
      {children}
    </div>
  );
}

function BiCol({ lang, children }) {
  const isVi = lang === 'vi';
  return (
    <div className="flex flex-col gap-[12px]">
      <div className="flex items-center gap-[6px]">
        <span
          className={[
            'rounded-full border px-[6px] py-[1px] text-[8px] uppercase tracking-[0.12em]',
            isVi
              ? 'border-[rgba(201,168,76,0.3)] text-[rgba(201,168,76,0.7)]'
              : 'border-[rgba(147,197,253,0.25)] text-[rgba(147,197,253,0.6)]',
          ].join(' ')}
        >
          {isVi ? 'VI' : 'EN'}
        </span>
        <span className="text-[10px] text-[rgba(240,235,224,0.35)]">
          {isVi ? 'Tiếng Việt' : 'English'}
        </span>
      </div>
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export default function TabBasic({ form, onChange, categories = [], isEdit = false }) {
  const f = (field) => (e) => onChange(field, e.target.value);
  const fv = (field) => (val) => onChange(field, val);

  return (
    <div className="flex flex-col gap-[16px]">

      {/* 1 — ID & Category */}
      <Section title="Định danh" hint="products: id · category_slug">
        <div className="grid grid-cols-2 gap-[12px]">
          <Input
            label="ID sản phẩm"
            placeholder="mam-ruoc-hue"
            value={form.id}
            onChange={f('id')}
            disabled={isEdit}
            hint={isEdit ? 'ID không thể thay đổi sau khi tạo' : 'Slug ngắn, không dấu, dùng dấu gạch ngang'}
          />
          <Select
            label="Danh mục"
            value={form.category_slug}
            onChange={f('category_slug')}
          >
            <option value="">-- Chọn danh mục --</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>{c.name_vi} ({c.slug})</option>
            ))}
          </Select>
        </div>
      </Section>

      {/* 2 — Tên & Tagline */}
      <Section title="Tên & Tagline" hint="name_vi · name_en · tagline_vi · tagline_en">
        <BiRow>
          <BiCol lang="vi">
            <Input label="Tên sản phẩm *" placeholder="Mắm ruốc Huế" value={form.name_vi} onChange={f('name_vi')} />
            <Input label="Tagline" placeholder="Hương vị truyền thống xứ Huế" value={form.tagline_vi} onChange={f('tagline_vi')} />
          </BiCol>
          <BiCol lang="en">
            <Input label="Product name *" placeholder="Hue Shrimp Paste" value={form.name_en} onChange={f('name_en')} />
            <Input label="Tagline" placeholder="Traditional Hue flavour" value={form.tagline_en} onChange={f('tagline_en')} />
          </BiCol>
        </BiRow>
      </Section>

      {/* 3 — Giá, kho, thông số */}
      <Section title="Giá & Kho hàng" hint="price_vnd · price_usd · weight_gram · unit · stock · suitable_for_vegan">
        <div className="grid grid-cols-4 gap-[12px]">
          <Input label="Giá (₫) *" type="number" min="0" placeholder="145000" value={form.price_vnd} onChange={f('price_vnd')} />
          <Input label="Giá ($)" type="number" min="0" step="0.01" placeholder="5.80" value={form.price_usd} onChange={f('price_usd')} />
          <Input label="Tồn kho *" type="number" min="0" placeholder="100" value={form.stock} onChange={f('stock')} />
          <Input label="Đơn vị" placeholder="hũ / túi / hộp" value={form.unit} onChange={f('unit')} />
        </div>
        <div className="mt-[12px] grid grid-cols-2 gap-[12px]">
          <Input label="Khối lượng (gram)" type="number" min="0" placeholder="250" value={form.weight_gram} onChange={f('weight_gram')} />
          <Checkbox
            label="Phù hợp người ăn chay (suitable_for_vegan)"
            checked={Boolean(form.suitable_for_vegan)}
            onChange={fv('suitable_for_vegan')}
          />
        </div>
      </Section>

      {/* 4 — Mô tả & Thành phần */}
      <Section title="Mô tả & Thành phần" hint="summary · ingredients · allergens">
        <BiRow>
          <BiCol lang="vi">
            <Textarea label="Tóm tắt *" placeholder="Mắm ruốc Huế được làm từ tép biển tươi..." rows={4} value={form.summary_vi} onChange={f('summary_vi')} />
            <Textarea label="Thành phần" placeholder="Tép biển, muối, gia vị tự nhiên" rows={3} value={form.ingredients_vi} onChange={f('ingredients_vi')} />
            <Textarea label="Chất gây dị ứng" placeholder="Có chứa hải sản..." rows={2} value={form.allergens_vi} onChange={f('allergens_vi')} />
          </BiCol>
          <BiCol lang="en">
            <Textarea label="Summary *" placeholder="Hue shrimp paste made from fresh sea shrimp..." rows={4} value={form.summary_en} onChange={f('summary_en')} />
            <Textarea label="Ingredients" placeholder="Sea shrimp, salt, natural spices" rows={3} value={form.ingredients_en} onChange={f('ingredients_en')} />
            <Textarea label="Allergens" placeholder="Contains shellfish..." rows={2} value={form.allergens_en} onChange={f('allergens_en')} />
          </BiCol>
        </BiRow>
      </Section>

      {/* 5 — Bảo quản & Hạn sử dụng */}
      <Section title="Hạn sử dụng & Bảo quản" hint="shelf_life · preservation">
        <BiRow>
          <BiCol lang="vi">
            <Input label="Hạn sử dụng" placeholder="12 tháng kể từ ngày sản xuất" value={form.shelf_life_vi} onChange={f('shelf_life_vi')} />
            <Input label="Bảo quản" placeholder="Để nơi thoáng mát, tránh ánh nắng" value={form.preservation_vi} onChange={f('preservation_vi')} />
          </BiCol>
          <BiCol lang="en">
            <Input label="Shelf life" placeholder="12 months from production date" value={form.shelf_life_en} onChange={f('shelf_life_en')} />
            <Input label="Preservation" placeholder="Store in cool, dry place away from sunlight" value={form.preservation_en} onChange={f('preservation_en')} />
          </BiCol>
        </BiRow>
      </Section>

      {/* 6 — Vận chuyển, đóng gói, cam kết */}
      <Section title="Vận chuyển & Cam kết" hint="shipping · packaging · guarantee">
        <BiRow>
          <BiCol lang="vi">
            <Textarea label="Vận chuyển" placeholder="Giao hàng toàn quốc trong 3–5 ngày làm việc" rows={2} value={form.shipping_vi} onChange={f('shipping_vi')} />
            <Input label="Đóng gói" placeholder="Hũ thủy tinh nắp thiếc, hút chân không" value={form.packaging_vi} onChange={f('packaging_vi')} />
            <Input label="Cam kết / Bảo hành" placeholder="Đổi trả trong 7 ngày nếu lỗi từ nhà sản xuất" value={form.guarantee_vi} onChange={f('guarantee_vi')} />
          </BiCol>
          <BiCol lang="en">
            <Textarea label="Shipping" placeholder="Nationwide delivery in 3–5 business days" rows={2} value={form.shipping_en} onChange={f('shipping_en')} />
            <Input label="Packaging" placeholder="Glass jar with tin lid, vacuum-sealed" value={form.packaging_en} onChange={f('packaging_en')} />
            <Input label="Guarantee" placeholder="7-day return if defective" value={form.guarantee_en} onChange={f('guarantee_en')} />
          </BiCol>
        </BiRow>
      </Section>

    </div>
  );
}