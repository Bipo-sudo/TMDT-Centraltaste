'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BarChart3, Package, ShoppingCart, Users } from 'lucide-react';
import api from '../../../lib/api';

function formatVnd(value) {
  return Number(value || 0).toLocaleString('vi-VN');
}

function formatDate(value) {
  if (!value) {
    return '--';
  }

  return new Date(value).toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function normalizeStatus(status) {
  return String(status || '').trim().toLowerCase();
}

function getStatusBadgeClass(status) {
  const normalized = normalizeStatus(status);

  if (normalized === 'processing') {
    return 'border-sky-500/20 bg-sky-500/10 text-sky-200';
  }

  if (normalized === 'shipped') {
    return 'border-indigo-500/20 bg-indigo-500/10 text-indigo-200';
  }

  if (normalized === 'delivered' || normalized === 'completed') {
    return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200';
  }

  if (normalized === 'cancelled') {
    return 'border-rose-500/20 bg-rose-500/10 text-rose-200';
  }

  return 'border-amber-500/20 bg-amber-500/10 text-amber-200';
}

function MetricCard({ title, value, description, icon: Icon }) {
  return (
    <article className="rounded-[28px] border border-[rgba(201,168,76,0.14)] bg-[linear-gradient(135deg,#16130e,#11100d)] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.28em] text-[rgba(240,235,224,0.38)]">{title}</p>
          <h3 className="mt-3 text-[2rem] leading-none tracking-[-0.04em] text-[#f0ebe0]" style={{ fontFamily: 'var(--font-display)', fontWeight: 300 }}>
            {value}
          </h3>
          <p className="mt-3 text-[13px] leading-6 text-[rgba(240,235,224,0.54)]">{description}</p>
        </div>

        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[rgba(201,168,76,0.18)] bg-[rgba(201,168,76,0.08)] text-[#c9a84c]">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </article>
  );
}

export default function AdminDashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total_revenue_vnd: 0,
    total_orders: 0,
    total_products: 0,
    total_customers: 0,
    recent_orders: [],
  });

  useEffect(() => {
    let isActive = true;

    async function fetchDashboardStats() {
      try {
        setIsLoading(true);
        const response = await api.get('/dashboard');
        const data = response.data?.data;

        if (!isActive || !data) {
          return;
        }

        setStats({
          total_revenue_vnd: Number(data.total_revenue_vnd || 0),
          total_orders: Number(data.total_orders || 0),
          total_products: Number(data.total_products || 0),
          total_customers: Number(data.total_customers || 0),
          recent_orders: Array.isArray(data.recent_orders) ? data.recent_orders : [],
        });
      } catch (error) {
        if (isActive) {
          setStats({
            total_revenue_vnd: 0,
            total_orders: 0,
            total_products: 0,
            total_customers: 0,
            recent_orders: [],
          });
        }

        console.error('Không thể tải dữ liệu dashboard:', error);
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    fetchDashboardStats();

    return () => {
      isActive = false;
    };
  }, []);

  const recentOrders = stats.recent_orders;

  return (
    <section className="space-y-6 text-white">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-3xl space-y-3">
          <h2 className="text-[2.5rem] leading-[1.02] tracking-[-0.04em] sm:text-[3.2rem]" style={{ fontFamily: 'var(--font-display)', fontWeight: 300 }}>
            Bảng điều khiển
          </h2>
          <p className="max-w-2xl text-[14px] leading-7 text-[rgba(240,235,224,0.62)]">
            Theo dõi doanh thu, đơn hàng, sản phẩm và hoạt động gần đây trong một bố cục gọn và dễ đọc.
          </p>
        </div>

        <Link href="/admin/products" className="inline-flex items-center justify-center rounded-full border border-[rgba(201,168,76,0.2)] bg-[rgba(255,255,255,0.03)] px-5 py-3 text-[13px] font-medium text-[rgba(240,235,224,0.82)] transition hover:border-[rgba(201,168,76,0.55)] hover:text-[#c9a84c]">
          Quản lý sản phẩm
        </Link>
      </div>

      {isLoading ? (
        <div className="rounded-[28px] border border-dashed border-[rgba(201,168,76,0.14)] bg-[rgba(255,255,255,0.03)] px-6 py-12 text-sm text-[rgba(240,235,224,0.58)]">
          Đang tải dữ liệu...
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard title="Doanh thu" value={`${formatVnd(stats.total_revenue_vnd)} VND`} description="Tổng doanh thu tích lũy từ các đơn hàng đã ghi nhận." icon={BarChart3} />
            <MetricCard title="Đơn hàng" value={formatVnd(stats.total_orders)} description="Số đơn hàng trong toàn bộ hệ thống." icon={ShoppingCart} />
            <MetricCard title="Sản phẩm" value={formatVnd(stats.total_products)} description="Tổng số sản phẩm đang quản lý." icon={Package} />
            <MetricCard title="Khách hàng" value={formatVnd(stats.total_customers)} description="Số tài khoản khách hàng đã phát sinh đơn." icon={Users} />
          </div>

          <div className="rounded-[28px] border border-[rgba(201,168,76,0.14)] bg-[rgba(255,255,255,0.02)] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.12)]">
            <div className="mb-5 flex items-center justify-between gap-4">
              <h3 className="text-[1.4rem] leading-[1.1] tracking-[-0.03em] text-[#f0ebe0]" style={{ fontFamily: 'var(--font-display)', fontWeight: 400 }}>
                Đơn hàng gần đây
              </h3>
              <Link href="/admin/orders" className="inline-flex items-center gap-2 text-[13px] text-[rgba(240,235,224,0.62)] transition hover:text-[#c9a84c]">
                Xem toàn bộ
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-[rgba(201,168,76,0.14)] bg-[rgba(255,255,255,0.03)] px-6 py-10 text-sm text-[rgba(240,235,224,0.58)]">
                Chưa có đơn hàng nào.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-separate border-spacing-0 text-left">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-[0.28em] text-[rgba(240,235,224,0.36)]">
                      <th className="border-b border-[rgba(201,168,76,0.12)] px-3 py-4 font-medium">Mã đơn</th>
                      <th className="border-b border-[rgba(201,168,76,0.12)] px-3 py-4 font-medium">Ngày đặt</th>
                      <th className="border-b border-[rgba(201,168,76,0.12)] px-3 py-4 font-medium">Khách hàng</th>
                      <th className="border-b border-[rgba(201,168,76,0.12)] px-3 py-4 font-medium">Tổng tiền</th>
                      <th className="border-b border-[rgba(201,168,76,0.12)] px-3 py-4 font-medium">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => {
                      const status = normalizeStatus(order.order_status);

                      return (
                        <tr key={order.id} className="text-sm text-[rgba(240,235,224,0.72)]">
                          <td className="border-b border-[rgba(201,168,76,0.08)] px-3 py-4 font-medium text-[#f0ebe0]">{order.id}</td>
                          <td className="border-b border-[rgba(201,168,76,0.08)] px-3 py-4">{formatDate(order.created_at)}</td>
                          <td className="border-b border-[rgba(201,168,76,0.08)] px-3 py-4">
                            <div className="font-medium text-[#f0ebe0]">{order.user_full_name || 'Khách hàng'}</div>
                            <div className="text-xs text-[rgba(240,235,224,0.4)]">{order.user_email || '--'}</div>
                          </td>
                          <td className="border-b border-[rgba(201,168,76,0.08)] px-3 py-4">{formatVnd(order.total_amount_vnd)} VND</td>
                          <td className="border-b border-[rgba(201,168,76,0.08)] px-3 py-4">
                            <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium capitalize ${getStatusBadgeClass(status)}`}>
                              {status || 'pending'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}