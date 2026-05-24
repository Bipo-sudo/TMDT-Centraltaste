'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Package, ShieldCheck, Tag, Trash2 } from 'lucide-react';
import api from '../../../lib/api';
import useStore from '../../../store/useStore';

function formatVnd(value) {
  return Number(value || 0).toLocaleString('vi-VN');
}

function resolveImageUrl(imageUrl) {
  if (!imageUrl) {
    return '';
  }

  const normalized = String(imageUrl);
  if (normalized.includes('example.com')) {
    return '';
  }

  return normalized;
}

function CartItem({ item, onIncrement, onDecrement, onDelete, isUpdating }) {
  const imageUrl = resolveImageUrl(item.main_image_url);

  return (
    <div className="group flex gap-5 rounded-[20px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] p-4 shadow-[0_14px_35px_rgba(0,0,0,0.24)] transition hover:border-[rgba(224,180,62,0.22)] sm:gap-6 sm:p-5">
      <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-[16px] bg-[rgba(255,255,255,0.04)] sm:h-32 sm:w-32">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.name_vi}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[rgba(201,168,76,0.35)]">
            <Package className="h-8 w-8" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-2">
            <p className="text-[11px] uppercase tracking-[0.24em] text-[#e0b43e]">
              {item.category_name_vi || item.category_slug || 'Sản phẩm'}
            </p>
            <h3 className="truncate text-[1.05rem] font-semibold leading-6 text-[#f0ebe0] sm:text-[1.15rem]">
              {item.name_vi}
            </h3>
            <p className="text-sm text-[rgba(240,235,224,0.68)]">{formatVnd(item.price_vnd)} đ / sản phẩm</p>
          </div>

          <button
            type="button"
            onClick={() => onDelete(item.id)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[rgba(240,235,224,0.45)] transition hover:bg-[rgba(255,255,255,0.03)] hover:text-[#f0ebe0]"
            aria-label="Xóa sản phẩm"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="inline-flex items-center rounded-full border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.02)] p-1">
            <button
              type="button"
              onClick={() => onDecrement(item)}
              disabled={isUpdating}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-sm text-[rgba(240,235,224,0.8)] transition hover:bg-[rgba(255,255,255,0.03)] disabled:cursor-not-allowed disabled:opacity-60"
              aria-label="Giảm số lượng"
            >
              <span className="text-lg leading-none">−</span>
            </button>
            <span className="inline-flex min-w-12 items-center justify-center text-sm font-medium text-[#f0ebe0]">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => onIncrement(item)}
              disabled={isUpdating}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-sm text-[rgba(240,235,224,0.8)] transition hover:bg-[rgba(255,255,255,0.03)] disabled:cursor-not-allowed disabled:opacity-60"
              aria-label="Tăng số lượng"
            >
              <span className="text-lg leading-none">+</span>
            </button>
          </div>

          <p className="text-[1.15rem] font-semibold text-[#e0b43e] sm:text-[1.25rem]">
            {formatVnd(item.line_total_vnd)} đ
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CartPage() {
  const router = useRouter();
  const setCartCount = useStore((state) => state.setCartCount);

  const [items, setItems] = useState([]);
  const [totalAmountVnd, setTotalAmountVnd] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  async function loadCart() {
    try {
      setIsLoading(true);
      setErrorMessage('');

      const response = await api.get('/cart');
      const cartItems = response.data?.data?.items || [];
      const total = response.data?.data?.total_amount_vnd || 0;

      setItems(cartItems);
      setTotalAmountVnd(total);
      setCartCount(cartItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0));
    } catch (error) {
      if (error?.response?.status === 401) {
        router.push('/login');
        return;
      }

      setErrorMessage('Không thể tải giỏ hàng.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadCart();
  }, []);

  async function updateCartItem(cartItemId, nextPayload) {
    try {
      setUpdatingId(cartItemId);
      await api.put(`/cart/${cartItemId}`, nextPayload);
      await loadCart();
    } catch (error) {
      if (error?.response?.status === 401) {
        router.push('/login');
      }
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleIncrement(item) {
    await updateCartItem(item.id, { quantity: Number(item.quantity || 0) + 1 });
  }

  async function handleDecrement(item) {
    await updateCartItem(item.id, { quantity: Number(item.quantity || 0) - 1 });
  }

  async function handleDelete(cartItemId) {
    try {
      setUpdatingId(cartItemId);
      await api.delete(`/cart/${cartItemId}`);
      await loadCart();
    } catch (error) {
      if (error?.response?.status === 401) {
        router.push('/login');
      }
    } finally {
      setUpdatingId(null);
    }
  }

  if (isLoading) {
    return (
      <section className="mx-auto flex min-h-[60vh] w-full max-w-[1536px] items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-sm text-[rgba(240,235,224,0.6)]">Đang tải giỏ hàng...</p>
      </section>
    );
  }

  if (errorMessage) {
    return (
      <section className="mx-auto w-full max-w-[1536px] px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-[20px] border border-dashed border-[rgba(201,168,76,0.12)] bg-[rgba(255,255,255,0.02)] p-8 text-sm text-[rgba(240,235,224,0.6)]">
          {errorMessage}
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="mx-auto flex min-h-[70vh] w-full max-w-[1536px] items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="space-y-6 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] text-[rgba(201,168,76,0.5)]">
            <Package className="h-9 w-9" />
          </div>
          <p className="text-sm text-[rgba(240,235,224,0.6)]">Giỏ hàng của bạn đang trống.</p>
          <Link
            href="/products"
            className="inline-flex h-12 items-center justify-center rounded-full bg-[#e0b43e] px-6 text-sm font-semibold text-[#1a1208] transition hover:opacity-95"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      </section>
    );
  }

  return (
    <div className="bg-[#0c0b09] text-[#f0ebe0]">
      <section className="mx-auto w-full max-w-[1536px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mb-8 space-y-3">
          <Link href="/products" className="inline-flex items-center gap-2 text-sm text-[rgba(240,235,224,0.62)] transition hover:text-[#e0b43e]">
            <ArrowLeft className="h-4 w-4" />
            Tiếp tục mua sắm
          </Link>

          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-[rgba(224,180,62,0.72)]">Giỏ hàng</p>
            <h1 className="mt-2 text-[2.2rem] leading-none tracking-[-0.03em] text-[#f0ebe0] sm:text-[2.8rem] lg:text-[3.2rem]" style={{ fontFamily: 'var(--font-display)', fontWeight: 300 }}>
              Giỏ hàng của bạn
            </h1>
            <p className="mt-2 text-sm text-[rgba(240,235,224,0.66)]">{items.length} sản phẩm trong giỏ hàng</p>
          </div>
        </div>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.65fr)_minmax(340px,0.9fr)] xl:items-start">
          <div className="space-y-4">
            {items.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                isUpdating={updatingId === item.id}
                onIncrement={handleIncrement}
                onDecrement={handleDecrement}
                onDelete={handleDelete}
              />
            ))}
          </div>

          <aside className="rounded-[22px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] p-5 shadow-[0_16px_45px_rgba(0,0,0,0.22)] xl:sticky xl:top-28">
            <p className="text-[11px] uppercase tracking-[0.28em] text-[rgba(224,180,62,0.72)]">Tóm tắt đơn hàng</p>

            <div className="mt-6 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-[rgba(240,235,224,0.7)]">Mã giảm giá</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgba(240,235,224,0.35)]" />
                    <input
                      type="text"
                      placeholder="Nhập mã"
                      className="h-11 w-full rounded-[12px] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.02)] pl-10 pr-3 text-sm text-[#f0ebe0] placeholder:text-[rgba(240,235,224,0.35)] outline-none transition focus:border-[rgba(224,180,62,0.35)]"
                    />
                  </div>
                  <button
                    type="button"
                    className="h-11 shrink-0 rounded-[12px] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.02)] px-4 text-sm font-medium text-[#f0ebe0] transition hover:border-[rgba(224,180,62,0.35)] hover:text-[#e0b43e]"
                  >
                    Áp dụng
                  </button>
                </div>
              </div>

              <div className="space-y-3 border-t border-[rgba(255,255,255,0.08)] pt-5 text-sm text-[rgba(240,235,224,0.72)]">
                <div className="flex items-center justify-between gap-4">
                  <span>Tạm tính</span>
                  <span className="font-medium text-[#f0ebe0]">{formatVnd(totalAmountVnd)} đ</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span>Phí vận chuyển</span>
                  <span className="font-medium text-[#f0ebe0]">Miễn phí</span>
                </div>
                <div className="rounded-[14px] border border-[rgba(34,197,94,0.25)] bg-[rgba(34,197,94,0.08)] px-4 py-3 text-[13px] text-[#4ade80]">
                  ✓ Đơn hàng của bạn được miễn phí vận chuyển
                </div>
              </div>

              <div className="border-t border-[rgba(255,255,255,0.08)] pt-5">
                <div className="flex items-baseline justify-between gap-4">
                  <span className="text-lg text-[#f0ebe0]">Tổng cộng</span>
                  <span className="text-[1.8rem] font-semibold text-[#e0b43e]">{formatVnd(totalAmountVnd)} đ</span>
                </div>

                <Link
                  href="/checkout"
                  className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-full bg-[#e0b43e] px-6 text-sm font-semibold text-[#1a1208] transition hover:opacity-95"
                >
                  Thanh toán
                </Link>
              </div>

              <div className="border-t border-[rgba(255,255,255,0.08)] pt-5 space-y-3">
                {['Thanh toán an toàn & bảo mật', 'Miễn phí đổi trả trong 7 ngày', 'Giao hàng nhanh toàn quốc'].map((label) => (
                  <div key={label} className="flex items-center gap-3 text-sm text-[rgba(240,235,224,0.58)]">
                    <ShieldCheck className="h-4 w-4 shrink-0 text-[#22c55e]" />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
