'use client';

import { useEffect, useState } from 'react';
import api from '../../lib/api';

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
    return 'bg-sky-50 text-sky-700 border-sky-100';
  }

  if (normalized === 'shipped') {
    return 'bg-indigo-50 text-indigo-700 border-indigo-100';
  }

  if (normalized === 'delivered' || normalized === 'completed') {
    return 'bg-emerald-50 text-emerald-700 border-emerald-100';
  }

  if (normalized === 'cancelled') {
    return 'bg-rose-50 text-rose-700 border-rose-100';
  }

  return 'bg-amber-50 text-amber-700 border-amber-100';
}

function MetricCard({ title, value }) {
  return (
    <article className="rounded-2xl border border-neutral-200 bg-white p-6">
      <p className="text-xs uppercase tracking-[0.32em] text-neutral-400">{title}</p>
      <h3 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-neutral-950">{value}</h3>
    </article>
  );
}

export default function AdminIndexPage() {
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

  return (
    <section className="space-y-8">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.35em] text-neutral-400">Dashboard</p>
        <h2 className="text-4xl font-light tracking-[-0.05em] text-neutral-950">Tổng quan hệ thống</h2>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-dashed border-neutral-200 bg-white px-6 py-12 text-sm text-neutral-500">
          Đang tải dữ liệu...
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard title="Doanh thu" value={`${formatVnd(stats.total_revenue_vnd)} VND`} />
            <MetricCard title="Đơn hàng" value={formatVnd(stats.total_orders)} />
            <MetricCard title="Sản phẩm" value={formatVnd(stats.total_products)} />
            <MetricCard title="Khách hàng" value={formatVnd(stats.total_customers)} />
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-6">
            <div className="mb-5">
              <p className="text-xs uppercase tracking-[0.35em] text-neutral-400">Recent Orders</p>
              <h3 className="mt-2 text-2xl font-medium tracking-[-0.03em] text-neutral-950">5 đơn hàng gần nhất</h3>
            </div>

            {stats.recent_orders.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 px-6 py-10 text-sm text-neutral-500">
                Chưa có đơn hàng nào.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-xs uppercase tracking-[0.3em] text-neutral-400">
                      <th className="border-b border-neutral-200 px-3 py-4 font-medium">Mã đơn</th>
                      <th className="border-b border-neutral-200 px-3 py-4 font-medium">Ngày đặt</th>
                      <th className="border-b border-neutral-200 px-3 py-4 font-medium">Khách hàng</th>
                      <th className="border-b border-neutral-200 px-3 py-4 font-medium">Tổng tiền</th>
                      <th className="border-b border-neutral-200 px-3 py-4 font-medium">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recent_orders.map((order) => {
                      const status = normalizeStatus(order.order_status);

                      return (
                        <tr key={order.id} className="text-sm text-neutral-700">
                          <td className="border-b border-neutral-200 px-3 py-4 font-medium text-neutral-950">{order.id}</td>
                          <td className="border-b border-neutral-200 px-3 py-4">{formatDate(order.created_at)}</td>
                          <td className="border-b border-neutral-200 px-3 py-4">
                            <div className="font-medium text-neutral-950">{order.user_full_name || 'Khách hàng'}</div>
                            <div className="text-xs text-neutral-500">{order.user_email || '--'}</div>
                          </td>
                          <td className="border-b border-neutral-200 px-3 py-4">{formatVnd(order.total_amount_vnd)} VND</td>
                          <td className="border-b border-neutral-200 px-3 py-4">
                            <span
                              className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium capitalize ${getStatusBadgeClass(status)}`}
                            >
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
