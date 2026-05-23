'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PencilLine, Trash2 } from 'lucide-react';
import api from '../../../lib/api';

function formatVnd(value) {
  return Number(value || 0).toLocaleString('vi-VN');
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    if (!toastMessage) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setToastMessage('');
    }, 2200);

    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  useEffect(() => {
    let isActive = true;

    async function fetchProducts() {
      try {
        setIsLoading(true);
        const response = await api.get('/products');
        const rows = response.data?.data || [];

        if (isActive) {
          setProducts(rows);
        }
      } catch (error) {
        if (isActive) {
          setProducts([]);
        }
        console.error('Không thể tải danh sách sản phẩm:', error);
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    fetchProducts();

    return () => {
      isActive = false;
    };
  }, []);

  async function handleDelete(productId) {
    const confirmed = window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?');

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/products/${productId}`);
      setProducts((currentProducts) => currentProducts.filter((product) => product.id !== productId));
      setToastMessage('Đã xóa sản phẩm');
    } catch (error) {
      console.error('Không thể xóa sản phẩm:', error);
      setToastMessage(error?.response?.data?.message || 'Xóa sản phẩm thất bại');
    }
  }

  return (
    <section className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.04)] sm:p-8">
      <div className="flex flex-col gap-4 border-b border-neutral-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-neutral-400">Admin</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-neutral-950">Quản lý sản phẩm</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">
            Danh sách sản phẩm, thông tin giá, tồn kho và các thao tác CRUD cơ bản.
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="inline-flex h-11 items-center justify-center rounded-full bg-neutral-950 px-5 text-sm font-medium text-white transition hover:bg-neutral-800"
        >
          Thêm sản phẩm
        </Link>
      </div>

      {toastMessage ? (
        <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {toastMessage}
        </div>
      ) : null}

      <div className="mt-6">
        {isLoading ? (
          <div className="rounded-[24px] border border-dashed border-neutral-200 bg-neutral-50 px-6 py-12 text-sm text-neutral-500">
            Đang tải dữ liệu...
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-neutral-200 bg-neutral-50 px-6 py-12 text-sm text-neutral-500">
            Chưa có sản phẩm nào. Hãy tạo sản phẩm đầu tiên để bắt đầu quản lý.
          </div>
        ) : (
          <div className="overflow-hidden rounded-[24px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-left text-xs uppercase tracking-[0.32em] text-neutral-400">
                  <th className="border-b border-neutral-200 px-4 py-4 font-medium">Ảnh</th>
                  <th className="border-b border-neutral-200 px-4 py-4 font-medium">Tên</th>
                  <th className="border-b border-neutral-200 px-4 py-4 font-medium">Giá</th>
                  <th className="border-b border-neutral-200 px-4 py-4 font-medium">Kho</th>
                  <th className="border-b border-neutral-200 px-4 py-4 text-right font-medium">Hành động</th>
                </tr>
              </thead>

              <tbody className="bg-white">
                {products.map((product) => (
                  <tr key={product.id} className="align-middle text-sm text-neutral-700">
                    <td className="border-b border-neutral-200 px-4 py-4">
                      {product.main_image_url ? (
                        <img
                          src={product.main_image_url}
                          alt={product.name_vi}
                          className="w-16 h-16 min-w-[64px] object-cover rounded-md border border-neutral-200"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-[14px] bg-neutral-200" />
                      )}
                    </td>
                    <td className="border-b border-neutral-200 px-4 py-4">
                      <div className="font-medium text-neutral-950">{product.name_vi || 'Chưa có tên'}</div>
                    </td>
                    <td className="border-b border-neutral-200 px-4 py-4 text-neutral-700">
                      {formatVnd(product.price_vnd)}
                    </td>
                    <td className="border-b border-neutral-200 px-4 py-4 text-neutral-700">
                      {Number(product.stock || 0)}
                    </td>
                    <td className="border-b border-neutral-200 px-4 py-4">
                      <div className="flex items-center justify-end gap-4 text-neutral-500">
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="inline-flex items-center gap-2 transition hover:text-neutral-950"
                        >
                          <PencilLine className="h-4 w-4" />
                          Sửa
                        </Link>
                        <button
                          type="button"
                          className="inline-flex items-center gap-2 transition hover:text-neutral-950"
                          onClick={() => handleDelete(product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}