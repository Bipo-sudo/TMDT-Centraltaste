'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
    <section className="mx-auto w-full max-w-6xl rounded-[32px] border border-neutral-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.05)] sm:p-8">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-neutral-400">Admin / Products</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-neutral-950">Thêm sản phẩm</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">
            Tạo nhanh một sản phẩm mới với ảnh chính, thông tin mô tả và tồn kho.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="inline-flex h-11 items-center justify-center rounded-full border border-neutral-200 bg-white px-5 text-sm font-medium text-neutral-700 transition hover:border-neutral-300 hover:text-neutral-950"
          >
            Hủy
          </Link>
          <button
            type="submit"
            form="product-new-form"
            disabled={isSubmitting}
            className="inline-flex h-11 items-center justify-center rounded-full bg-neutral-950 px-5 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Đang lưu...' : 'Lưu sản phẩm'}
          </button>
        </div>
      </div>

      <form id="product-new-form" onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <div className="space-y-6">
          <div className="grid gap-6 rounded-[28px] border border-neutral-200 bg-[#fbfbfc] p-5 sm:p-6">
            <div className="grid gap-2">
              <FieldLabel>Tên sản phẩm</FieldLabel>
              <input
                type="text"
                value={form.name_vi}
                onChange={(event) => setForm((prev) => ({ ...prev, name_vi: event.target.value }))}
                placeholder="Nhập tên sản phẩm"
                className="h-12 rounded-2xl border border-neutral-200 bg-white px-4 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400"
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
                  className="h-12 rounded-2xl border border-neutral-200 bg-white px-4 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400"
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
                  className="h-12 rounded-2xl border border-neutral-200 bg-white px-4 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400"
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
                className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400"
              />
            </label>

            <label className="grid gap-2">
              <FieldLabel>Thành phần</FieldLabel>
              <textarea
                rows={4}
                value={form.ingredients_vi}
                onChange={(event) => setForm((prev) => ({ ...prev, ingredients_vi: event.target.value }))}
                placeholder="Liệt kê thành phần"
                className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400"
              />
            </label>

            <label className="grid gap-2">
              <FieldLabel>Hạn sử dụng</FieldLabel>
              <input
                type="text"
                value={form.shelf_life_vi}
                onChange={(event) => setForm((prev) => ({ ...prev, shelf_life_vi: event.target.value }))}
                placeholder="Ví dụ: 30 ngày kể từ ngày sản xuất"
                className="h-12 rounded-2xl border border-neutral-200 bg-white px-4 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400"
              />
            </label>
          </div>

          {errorMessage ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          ) : null}

          {toastMessage ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {toastMessage}
            </div>
          ) : null}
        </div>

        <aside className="space-y-6">
          <div className="rounded-[28px] border border-dashed border-neutral-300 bg-[#fafafa] p-5 sm:p-6">
            <div className="mb-4">
              <p className="text-xs uppercase tracking-[0.32em] text-neutral-400">Upload ảnh</p>
              <h2 className="mt-2 text-lg font-semibold text-neutral-950">Ảnh chính sản phẩm</h2>
              <p className="mt-2 text-sm leading-6 text-neutral-600">
                Tải lên ảnh sản phẩm để hiển thị ở storefront và danh sách quản trị.
              </p>
            </div>

            <div className="rounded-[24px] border border-neutral-200 bg-white p-4">
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
                <div className="mt-5 space-y-3">
                  <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Preview</p>
                  <div className="overflow-hidden rounded-[20px] border border-neutral-200 bg-neutral-100">
                    <img src={mainImageUrl} alt="Preview sản phẩm" className="h-56 w-full object-cover" />
                  </div>
                </div>
              ) : (
                <div className="mt-5 rounded-[20px] border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-500">
                  Chưa có ảnh nào được tải lên.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[28px] border border-neutral-200 bg-white p-5 sm:p-6">
            <p className="text-xs uppercase tracking-[0.32em] text-neutral-400">Lưu ý</p>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-neutral-600">
              <li>• Ảnh chính sẽ được lưu vào trường main_image_url.</li>
              <li>• Các trường giá và tồn kho sẽ được ép sang số trước khi gửi.</li>
              <li>• Nút Hủy quay lại danh sách sản phẩm để kiểm tra kết quả CRUD.</li>
            </ul>
          </div>
        </aside>
      </form>
    </section>
  );
}