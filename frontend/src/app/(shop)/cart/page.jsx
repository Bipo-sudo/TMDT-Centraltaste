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
    <div className="flex gap-4 rounded-[24px] bg-[rgba(255,255,255,0.02)] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
      <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-neutral-800">
        <img src={item.main_image_url} alt={item.name_vi} className="h-full w-full object-cover" />
      </div>

      <div className="min-w-0 flex-1 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-base font-medium text-[#f0ebe0]">{item.name_vi}</h3>
            <p className="mt-1 text-sm text-[rgba(240,235,224,0.64)]">{formatVnd(item.price_vnd)} VND</p>
          </div>

          <button
            type="button"
            onClick={() => onDelete(item.id)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[rgba(240,235,224,0.6)] transition hover:bg-[rgba(255,255,255,0.03)] hover:text-[#f0ebe0]"
            aria-label="Xóa sản phẩm"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="inline-flex items-center rounded-full border border-[rgba(201,168,76,0.06)] bg-[rgba(255,255,255,0.02)] px-1 py-1">
            <button
              type="button"
              onClick={() => onDecrement(item)}
              disabled={isUpdating}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-sm text-[rgba(240,235,224,0.8)] transition hover:bg-[rgba(255,255,255,0.03)] disabled:cursor-not-allowed disabled:opacity-60"
              aria-label="Giảm số lượng"
            >
              -
            </button>
            <span className="inline-flex min-w-10 items-center justify-center text-sm font-medium text-[#f0ebe0]">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => onIncrement(item)}
              disabled={isUpdating}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-sm text-[rgba(240,235,224,0.8)] transition hover:bg-[rgba(255,255,255,0.03)] disabled:cursor-not-allowed disabled:opacity-60"
              aria-label="Tăng số lượng"
            >
              +
            </button>
          </div>

          <p className="text-sm font-medium text-[#f0ebe0]">{formatVnd(item.line_total_vnd)} VND</p>
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
        <p className="text-sm text-[rgba(240,235,224,0.6)]">Đang tải giỏ hàng...</p>
      </section>
    );
  }

  if (errorMessage) {
    return (
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-[16px] border border-dashed border-[rgba(201,168,76,0.08)] bg-[rgba(255,255,255,0.02)] p-8 text-sm text-[rgba(240,235,224,0.6)]">
          {errorMessage}
        </div>
      </section>
    );
  }

  if (!hasItems) {
    return (
      <section className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="space-y-6 text-center">
          <p className="text-sm text-[rgba(240,235,224,0.6)]">Giỏ hàng của bạn đang trống.</p>
          <Link
            href="/products"
            className="inline-flex h-12 items-center justify-center rounded-full bg-[#c9a84c] px-6 text-sm font-medium text-[#1a1208] transition hover:opacity-95"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="mb-8 max-w-2xl">
        <p className="text-[10px] uppercase tracking-[0.28em] text-[rgba(201,168,76,0.64)]">Shop</p>
        <h1 className="text-3xl font-light text-[#f0ebe0]">Giỏ hàng</h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)] lg:items-start">
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="rounded-[12px] bg-[rgba(255,255,255,0.02)] p-4">
              <CartItem
                item={item}
                isUpdating={updatingId === item.id}
                onIncrement={handleIncrement}
                onDecrement={handleDecrement}
                onDelete={handleDelete}
              />
            </div>
          ))}
        </div>

        <aside className="rounded-[14px] bg-[rgba(255,255,255,0.02)] p-6 lg:sticky lg:top-28">
          <p className="text-xs uppercase tracking-[0.35em] text-[rgba(201,168,76,0.64)]">Order Summary</p>
          <div className="mt-6 space-y-4 text-sm text-[rgba(240,235,224,0.7)]">
            <div className="flex items-center justify-between gap-4">
              <span>Tổng tiền hàng</span>
              <span className="font-medium text-[#f0ebe0]">{formatVnd(totalAmountVnd)} VND</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span>Phí vận chuyển</span>
              <span className="font-medium text-[#f0ebe0]">Miễn phí</span>
            </div>
            <div className="h-px bg-[rgba(201,168,76,0.06)]" />
            <div className="flex items-center justify-between gap-4 text-base">
              <span className="font-medium text-[#f0ebe0]">Tổng cộng</span>
              <span className="font-semibold text-[#f0ebe0]">{formatVnd(totalAmountVnd)} VND</span>
            </div>
          </div>

          <Link
            href="/checkout"
            className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full bg-[#c9a84c] px-6 text-sm font-medium text-[#1a1208] transition hover:opacity-95"
          >
            Tiến hành Thanh toán
          </Link>
        </aside>
      </div>
    </section>
  );
}
