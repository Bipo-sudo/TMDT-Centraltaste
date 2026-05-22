'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import api from '../../../lib/api';
import useStore from '../../../store/useStore';

function formatVnd(value) {
  return Number(value || 0).toLocaleString('vi-VN');
}

function CartItem({ item, onIncrement, onDecrement, onDelete, isUpdating }) {
  return (
    <div className="flex gap-4 rounded-[24px] bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
      <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-neutral-100">
        <img src={item.main_image_url} alt={item.name_vi} className="h-full w-full object-cover" />
      </div>

      <div className="min-w-0 flex-1 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-base font-medium text-neutral-900">{item.name_vi}</h3>
            <p className="mt-1 text-sm text-neutral-500">{formatVnd(item.price_vnd)} VND</p>
          </div>

          <button
            type="button"
            onClick={() => onDelete(item.id)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-900"
            aria-label="Xóa sản phẩm"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="inline-flex items-center rounded-full border border-neutral-200 bg-white px-1 py-1">
            <button
              type="button"
              onClick={() => onDecrement(item)}
              disabled={isUpdating}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-sm text-neutral-700 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-60"
              aria-label="Giảm số lượng"
            >
              -
            </button>
            <span className="inline-flex min-w-10 items-center justify-center text-sm font-medium text-neutral-900">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => onIncrement(item)}
              disabled={isUpdating}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-sm text-neutral-700 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-60"
              aria-label="Tăng số lượng"
            >
              +
            </button>
          </div>

          <p className="text-sm font-medium text-neutral-800">{formatVnd(item.line_total_vnd)} VND</p>
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

  const hasItems = useMemo(() => items.length > 0, [items]);

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
      <section className="mx-auto flex min-h-[60vh] w-full max-w-7xl items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-sm text-neutral-500">Đang tải giỏ hàng...</p>
      </section>
    );
  }

  if (errorMessage) {
    return (
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-[24px] border border-dashed border-neutral-200 bg-white p-8 text-sm text-neutral-500">
          {errorMessage}
        </div>
      </section>
    );
  }

  if (!hasItems) {
    return (
      <section className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="space-y-6 text-center">
          <p className="text-sm text-neutral-500">Giỏ hàng của bạn đang trống.</p>
          <Link
            href="/products"
            className="inline-flex h-12 items-center justify-center rounded-full bg-neutral-950 px-6 text-sm font-medium text-white transition hover:bg-neutral-800"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="mb-10 max-w-2xl space-y-3">
        <p className="text-[11px] uppercase tracking-[0.4em] text-neutral-400">Shop</p>
        <h1 className="text-4xl font-light tracking-[-0.05em] text-neutral-950">Giỏ hàng</h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)] lg:items-start">
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

        <aside className="rounded-[28px] bg-[#fbfaf7] p-6 shadow-[0_18px_50px_rgba(15,23,42,0.04)] lg:sticky lg:top-28">
          <p className="text-xs uppercase tracking-[0.35em] text-neutral-400">Order Summary</p>
          <div className="mt-6 space-y-4 text-sm text-neutral-600">
            <div className="flex items-center justify-between gap-4">
              <span>Tổng tiền hàng</span>
              <span className="font-medium text-neutral-900">{formatVnd(totalAmountVnd)} VND</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span>Phí vận chuyển</span>
              <span className="font-medium text-neutral-900">Miễn phí</span>
            </div>
            <div className="h-px bg-neutral-200" />
            <div className="flex items-center justify-between gap-4 text-base">
              <span className="font-medium text-neutral-900">Tổng cộng</span>
              <span className="font-semibold text-neutral-950">{formatVnd(totalAmountVnd)} VND</span>
            </div>
          </div>

          <Link
            href="/checkout"
            className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-full bg-neutral-950 px-6 text-sm font-medium text-white transition hover:bg-neutral-800"
          >
            Tiến hành Thanh toán
          </Link>
        </aside>
      </div>
    </section>
  );
}
