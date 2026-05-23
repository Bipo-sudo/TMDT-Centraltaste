'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '../../../lib/api';
import useStore from '../../../store/useStore';

function formatVnd(value) {
  return Number(value || 0).toLocaleString('vi-VN');
}

function formatDate(value) {
  if (!value) return 'Đang cập nhật';
  return new Date(value).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function getStatusTone(status) {
  switch (String(status || '').toLowerCase()) {
    case 'completed':
    case 'done':
      return 'bg-emerald-100 text-emerald-700';
    case 'processing':
    case 'pending':
      return 'bg-amber-100 text-amber-700';
    case 'shipping':
    case 'delivering':
      return 'bg-sky-100 text-sky-700';
    case 'cancelled':
      return 'bg-rose-100 text-rose-700';
    default:
      return 'bg-neutral-100 text-neutral-600';
  }
}

function buildInitials(name, email) {
  const source = String(name || email || '').trim();
  if (!source) return 'CT';
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] || ''}${parts[parts.length - 1][0] || ''}`.toUpperCase();
}

function VerificationBadge({ isVerified }) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${isVerified ? 'bg-emerald-100 text-emerald-700' : 'bg-neutral-100 text-neutral-600'}`}>
      {isVerified ? 'Đã xác thực' : 'Chưa xác thực'}
    </span>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const user = useStore((state) => state.user);
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  const clearUser = useStore((state) => state.clearUser);

  const [isMounted, setIsMounted] = useState(false);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const initials = useMemo(() => buildInitials(user?.full_name, user?.email), [user]);

  useEffect(() => setIsMounted(true), []);

  useEffect(() => {
    if (isMounted && !user) router.replace('/login');
  }, [isMounted, router, user]);

  useEffect(() => {
    let mounted = true;
    async function loadOrders() {
      if (!mounted || !isAuthenticated || !user) return;
      try {
        setIsLoading(true);
        setErrorMessage('');
        const response = await api.get('/orders/me');
        if (!mounted) return;
        setOrders(response.data?.data || []);
      } catch (err) {
        if (!mounted) return;
        if (err?.response?.status === 401) {
          router.replace('/login');
          return;
        }
        setErrorMessage('Không thể tải lịch sử đơn hàng.');
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    loadOrders();
    return () => {
      mounted = false;
    };
  }, [isAuthenticated, router, user]);

  function handleLogout() {
    window.localStorage.removeItem('token');
    clearUser();
    router.push('/login');
  }

  if (!isMounted) {
    return (
      <section className="mx-auto flex min-h-[60vh] w-full max-w-7xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="h-6 w-40 animate-pulse rounded-full bg-neutral-200/80" />
      </section>
    );
  }

  if (!isAuthenticated || !user) return null;

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start">
        <aside className="rounded-[14px] bg-[rgba(255,255,255,0.02)] p-6 lg:sticky lg:top-28">
          <p className="text-xs uppercase tracking-[0.35em] text-[rgba(201,168,76,0.64)]">Hồ sơ</p>

          <div className="mt-6 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#c9a84c] text-lg font-medium text-[#1a1208]">{initials}</div>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-medium tracking-[-0.03em] text-[#f0ebe0]">{user.full_name || 'Người dùng'}</h1>
              <p className="truncate text-sm text-[rgba(240,235,224,0.64)]">{user.email}</p>
            </div>
          </div>

          <div className="mt-8 space-y-2 text-sm text-[rgba(240,235,224,0.64)]">
            <p>
              Trạng thái: <span className="font-medium text-[#f0ebe0]">{user.role || 'customer'}</span>
            </p>
            <div>
              <span className="text-[rgba(240,235,224,0.64)]">Tài khoản: </span>
              <VerificationBadge isVerified={user.is_verified} />
            </div>
          </div>

          <button type="button" onClick={handleLogout} className="mt-8 inline-flex items-center text-sm font-medium text-[rgba(240,235,224,0.7)] underline-offset-4 transition hover:text-[#f0ebe0] hover:underline">Đăng xuất</button>
        </aside>

        <div className="space-y-6">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs uppercase tracking-[0.35em] text-[rgba(201,168,76,0.64)]">Lịch sử đơn hàng</p>
            <h2 className="text-3xl font-light tracking-[-0.05em] text-[#f0ebe0]">Đơn hàng của bạn</h2>
            <p className="text-sm leading-7 text-[rgba(240,235,224,0.64)]">Theo dõi các đơn đã đặt và trạng thái xử lý gần nhất.</p>
          </div>

          {isLoading ? (
            <div className="rounded-[12px] bg-[rgba(255,255,255,0.02)] p-6 text-sm text-[rgba(240,235,224,0.64)]">Đang tải lịch sử đơn hàng...</div>
          ) : errorMessage ? (
            <div className="rounded-[12px] bg-[rgba(255,255,255,0.02)] p-6 text-sm text-[rgba(240,235,224,0.64)]">{errorMessage}</div>
          ) : orders.length === 0 ? (
            <div className="rounded-[12px] bg-[rgba(255,255,255,0.02)] p-6 text-sm text-[rgba(240,235,224,0.64)]">
              Bạn chưa có đơn hàng nào.
              <div className="mt-4">
                <Link href="/products" className="font-medium text-[#c9a84c] underline-offset-4 transition hover:underline">Tiếp tục mua sắm</Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const items = Array.isArray(order.items) ? order.items : [];
                const shortId = String(order.id || '').replace(/^ORD-/, '');

                return (
                  <article key={order.id} className="rounded-[12px] bg-[rgba(255,255,255,0.02)] p-4">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-[rgba(201,168,76,0.64)]">Mã đơn hàng</p>
                        <h3 className="mt-2 text-lg font-medium tracking-[-0.03em] text-[#f0ebe0]">#{shortId || order.id}</h3>
                      </div>

                      <div className="text-right">
                        <p className="text-xs uppercase tracking-[0.3em] text-[rgba(201,168,76,0.64)]">Ngày đặt</p>
                        <p className="mt-2 text-sm text-[rgba(240,235,224,0.64)]">{formatDate(order.created_at)}</p>
                      </div>

                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusTone(order.order_status)}`}>{order.order_status === 'Completed' ? 'Chờ xác nhận' : order.order_status || 'Đang xử lý'}</span>
                    </div>

                    <div className="mt-4 space-y-2 border-t border-[rgba(201,168,76,0.06)] pt-4 text-sm text-[rgba(240,235,224,0.64)]">
                      {items.length > 0 ? (
                        items.slice(0, 4).map((item, index) => (
                          <div key={`${order.id}-${item.product_id || index}`} className="flex items-center justify-between gap-4">
                            <span className="truncate">{item.name}</span>
                            <span className="shrink-0 text-[rgba(240,235,224,0.6)]">x{item.quantity}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-[rgba(240,235,224,0.56)]">Chi tiết sản phẩm sẽ được cập nhật.</p>
                      )}
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-[rgba(201,168,76,0.06)] pt-4">
                      <span className="text-sm text-[rgba(240,235,224,0.64)]">Tổng tiền</span>
                      <span className="text-base font-semibold text-[#f0ebe0]">{formatVnd(order.total_amount_vnd)} VND</span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
