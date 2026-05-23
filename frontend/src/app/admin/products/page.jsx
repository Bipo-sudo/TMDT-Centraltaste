'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PackageSearch, Plus, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '../../../lib/api';
import AdminProductCard from '../../../components/admin/AdminProductCard';

function formatVnd(value) {
  return Number(value || 0).toLocaleString('vi-VN');
}

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!toastMessage) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setToastMessage('');
    }, 2200);

    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  const filteredProducts = products.filter((product) => {
    const query = String(searchQuery || '').trim().toLowerCase();

    if (!query) {
      return true;
    }

    return [product.name_vi, product.category_slug, product.category_name_vi]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query));
  });

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

  function handleEdit(product) {
    // navigate to edit page
    router.push(`/admin/products/${product.id}`);
  }

  return (
    <section className="space-y-6 text-white">
      <div className="rounded-[32px] border border-[rgba(201,168,76,0.14)] bg-[linear-gradient(135deg,#16130e,#0f0e0b)] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.22)] sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <p className="text-[10px] uppercase tracking-[0.32em] text-[rgba(201,168,76,0.72)]">Admin / Products</p>
            <h1 className="text-[2.4rem] leading-[1.02] tracking-[-0.04em] sm:text-[3rem]" style={{ fontFamily: 'var(--font-display)', fontWeight: 300 }}>
              Quản lý <em className="italic text-[#c9a84c]">sản phẩm</em>
            </h1>
            <p className="max-w-2xl text-[14px] leading-7 text-[rgba(240,235,224,0.62)]">
              Danh sách sản phẩm, ảnh chính, giá bán và tồn kho được gom vào một màn hình tối, rõ và thuận tay hơn để bạn chỉnh sửa nhanh.
            </p>
          </div>

          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 rounded-full bg-[#c9a84c] px-5 py-3 text-[13px] font-semibold text-[#1a1208] transition hover:gap-3 hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Thêm sản phẩm
          </Link>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-[24px] border border-[rgba(201,168,76,0.12)] bg-[rgba(255,255,255,0.03)] p-4">
            <p className="text-[10px] uppercase tracking-[0.26em] text-[rgba(240,235,224,0.36)]">Tổng sản phẩm</p>
            <p className="mt-2 text-[1.8rem]" style={{ fontFamily: 'var(--font-display)' }}>{products.length}</p>
          </div>
          <div className="rounded-[24px] border border-[rgba(201,168,76,0.12)] bg-[rgba(255,255,255,0.03)] p-4">
            <p className="text-[10px] uppercase tracking-[0.26em] text-[rgba(240,235,224,0.36)]">Đang lọc</p>
            <p className="mt-2 text-[1.8rem]" style={{ fontFamily: 'var(--font-display)' }}>{filteredProducts.length}</p>
          </div>
          <div className="rounded-[24px] border border-[rgba(201,168,76,0.12)] bg-[rgba(255,255,255,0.03)] p-4">
            <p className="text-[10px] uppercase tracking-[0.26em] text-[rgba(240,235,224,0.36)]">Ảnh chính</p>
            <p className="mt-2 text-[1.8rem]" style={{ fontFamily: 'var(--font-display)' }}>Live</p>
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-[rgba(201,168,76,0.12)] bg-[rgba(255,255,255,0.03)] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.16)] sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <label className="flex w-full max-w-2xl items-center gap-3 rounded-full border border-[rgba(201,168,76,0.16)] bg-[rgba(255,255,255,0.03)] px-4 py-3">
            <Search className="h-4 w-4 shrink-0 text-[rgba(240,235,224,0.48)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Tìm theo tên sản phẩm, danh mục..."
              className="w-full bg-transparent text-sm text-[#f0ebe0] outline-none placeholder:text-[rgba(240,235,224,0.3)]"
            />
          </label>

          <p className="text-[11px] uppercase tracking-[0.24em] text-[rgba(240,235,224,0.38)]">
            Sẵn sàng chỉnh ảnh, giá và tồn kho
          </p>
        </div>
      </div>

      {toastMessage ? (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {toastMessage}
        </div>
      ) : null}

      <div>
        {isLoading ? (
          <div className="rounded-[24px] border border-dashed border-[rgba(201,168,76,0.16)] bg-[rgba(255,255,255,0.03)] px-6 py-12 text-sm text-[rgba(240,235,224,0.58)]">
            Đang tải dữ liệu...
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-[28px] border border-dashed border-[rgba(201,168,76,0.16)] bg-[rgba(255,255,255,0.03)] px-6 py-16 text-center text-sm text-[rgba(240,235,224,0.58)]">
            <PackageSearch className="mb-4 h-7 w-7 text-[rgba(201,168,76,0.45)]" />
            Chưa có sản phẩm nào. Hãy tạo sản phẩm đầu tiên để bắt đầu quản lý.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <AdminProductCard key={product.id} product={product} onEdit={handleEdit} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}