'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ImagePlus, Sparkles, Upload, WandSparkles } from 'lucide-react';
import { UploadButton } from '../../../../utils/uploadthing';
import api from '../../../../lib/api';

function FieldLabel({ children }) {
  return <span className="text-sm font-medium text-neutral-700">{children}</span>;
}

export default function AdminProductNewPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [mainImageUrl, setMainImageUrl] = useState('');
  const [form, setForm] = useState({
    name_vi: '',
    price_vnd: '',
    stock: '',
    summary_vi: '',
    ingredients_vi: '',
    shelf_life_vi: '',
  });

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      setErrorMessage('');

      const payload = {
        ...form,
        price_vnd: Number(form.price_vnd || 0),
        stock: Number(form.stock || 0),
        main_image_url: mainImageUrl,
      };

      await api.post('/products', payload);
      setToastMessage('Đã lưu sản phẩm thành công');

      window.setTimeout(() => {
        router.push('/admin/products');
      }, 900);
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || 'Lưu sản phẩm thất bại.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="space-y-6 text-white">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.28em] text-[rgba(201,168,76,0.64)]">Admin / Products / New</p>
          <h1 className="mt-2 text-3xl font-light" style={{ fontFamily: 'var(--font-display)' }}>
            Thêm <em className="italic text-[#c9a84c]">sản phẩm</em>
          </h1>
          <p className="mt-1 text-sm text-[rgba(240,235,224,0.62)]">Tạo sản phẩm mới — ảnh chính, mô tả và thông tin cơ bản.</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-2 rounded-full border border-[rgba(240,235,224,0.12)] px-4 py-2 text-[13px] font-medium text-[rgba(240,235,224,0.76)] transition hover:border-[rgba(201,168,76,0.35)] hover:text-[#c9a84c]"
          >
            Hủy
          </Link>
          <button
            type="submit"
            form="product-new-form"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-full bg-[#c9a84c] px-4 py-2 text-[13px] font-semibold text-[#1a1208] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Sparkles className="h-4 w-4" />
            {isSubmitting ? 'Đang lưu...' : 'Lưu sản phẩm'}
          </button>
        </div>
      </div>

      <form id="product-new-form" onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
        <div className="space-y-6">
          <div className="grid gap-6 rounded-[20px] border border-[rgba(201,168,76,0.08)] bg-[rgba(255,255,255,0.02)] p-5 sm:p-6">
            <div className="grid gap-2">
              <FieldLabel>Tên sản phẩm</FieldLabel>
              <input
                type="text"
                value={form.name_vi}
                onChange={(event) => setForm((prev) => ({ ...prev, name_vi: event.target.value }))}
                placeholder="Nhập tên sản phẩm"
                className="h-12 rounded-2xl border border-[rgba(201,168,76,0.14)] bg-[#11100d] px-4 text-sm text-[#f0ebe0] outline-none transition placeholder:text-[rgba(240,235,224,0.3)] focus:border-[rgba(201,168,76,0.45)]"
              />
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <label className="grid gap-2">
                <FieldLabel>Giá</FieldLabel>
                <input
                  type="number"
                  min="0"
                  value={form.price_vnd}
                  onChange={(event) => setForm((prev) => ({ ...prev, price_vnd: event.target.value }))}
                  placeholder="0"
                  className="h-12 rounded-2xl border border-[rgba(201,168,76,0.14)] bg-[#11100d] px-4 text-sm text-[#f0ebe0] outline-none transition placeholder:text-[rgba(240,235,224,0.3)] focus:border-[rgba(201,168,76,0.45)]"
                />
              </label>

              <label className="grid gap-2">
                <FieldLabel>Số lượng tồn kho</FieldLabel>
                <input
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={(event) => setForm((prev) => ({ ...prev, stock: event.target.value }))}
                  placeholder="0"
                  className="h-12 rounded-2xl border border-[rgba(201,168,76,0.14)] bg-[#11100d] px-4 text-sm text-[#f0ebe0] outline-none transition placeholder:text-[rgba(240,235,224,0.3)] focus:border-[rgba(201,168,76,0.45)]"
                />
              </label>
            </div>

            <label className="grid gap-2">
              <FieldLabel>Tóm tắt</FieldLabel>
              <textarea
                rows={4}
                value={form.summary_vi}
                onChange={(event) => setForm((prev) => ({ ...prev, summary_vi: event.target.value }))}
                placeholder="Mô tả ngắn cho sản phẩm"
                className="rounded-2xl border border-[rgba(201,168,76,0.14)] bg-[#11100d] px-4 py-3 text-sm text-[#f0ebe0] outline-none transition placeholder:text-[rgba(240,235,224,0.3)] focus:border-[rgba(201,168,76,0.45)]"
              />
            </label>

            <label className="grid gap-2">
              <FieldLabel>Thành phần</FieldLabel>
              <textarea
                rows={4}
                value={form.ingredients_vi}
                onChange={(event) => setForm((prev) => ({ ...prev, ingredients_vi: event.target.value }))}
                placeholder="Liệt kê thành phần"
                className="rounded-2xl border border-[rgba(201,168,76,0.14)] bg-[#11100d] px-4 py-3 text-sm text-[#f0ebe0] outline-none transition placeholder:text-[rgba(240,235,224,0.3)] focus:border-[rgba(201,168,76,0.45)]"
              />
            </label>

            <label className="grid gap-2">
              <FieldLabel>Hạn sử dụng</FieldLabel>
              <input
                type="text"
                value={form.shelf_life_vi}
                onChange={(event) => setForm((prev) => ({ ...prev, shelf_life_vi: event.target.value }))}
                placeholder="Ví dụ: 30 ngày kể từ ngày sản xuất"
                className="h-12 rounded-2xl border border-[rgba(201,168,76,0.14)] bg-[#11100d] px-4 text-sm text-[#f0ebe0] outline-none transition placeholder:text-[rgba(240,235,224,0.3)] focus:border-[rgba(201,168,76,0.45)]"
              />
            </label>
          </div>

          {errorMessage ? (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {errorMessage}
            </div>
          ) : null}

          {toastMessage ? (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
              {toastMessage}
            </div>
          ) : null}
        </div>

        <aside>
          <div className="rounded-[20px] border border-[rgba(201,168,76,0.08)] bg-[rgba(255,255,255,0.02)] p-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] text-[rgba(201,168,76,0.64)]">Ảnh chính</p>
              <p className="mt-1 text-sm text-[rgba(240,235,224,0.58)]">Tải lên ảnh để hiển thị ở storefront và admin.</p>
            </div>

            <div className="mt-3">
              <UploadButton
                endpoint="mediaUploader"
                onClientUploadComplete={(res) => {
                  const uploadedFile = res?.[0];
                  if (uploadedFile?.url) {
                    setMainImageUrl(uploadedFile.url);
                  }
                }}
                onUploadError={(error) => {
                  setErrorMessage(error.message || 'Upload ảnh thất bại.');
                }}
              />

              {mainImageUrl ? (
                <div className="mt-4 overflow-hidden rounded-[12px] border border-[rgba(201,168,76,0.08)] bg-[#0f0e0b]">
                  <img src={mainImageUrl} alt="Preview sản phẩm" className="h-44 w-full object-cover" />
                </div>
              ) : (
                <div className="mt-4 rounded-[12px] border border-dashed border-[rgba(201,168,76,0.08)] bg-[rgba(255,255,255,0.02)] p-3 text-sm text-[rgba(240,235,224,0.5)]">
                  Chưa có ảnh nào được tải lên.
                </div>
              )}
            </div>

            <div className="mt-4 text-sm text-[rgba(240,235,224,0.56)]">
              <p>• Ảnh sẽ lưu vào `main_image_url`.</p>
              <p>• Giá và tồn kho được ép sang số trước khi gửi.</p>
            </div>
          </div>
        </aside>
      </form>
    </section>
  );
}