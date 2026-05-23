'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, PackageSearch, Search } from 'lucide-react';
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

function statusStyles(status) {
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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrders = orders.filter((order) => {
    const query = String(searchQuery || '').trim().toLowerCase();

    if (!query) {
      return true;
    }

    return [order.id, order.user_full_name, order.user_email, order.order_status]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query));
  });

  useEffect(() => {
    let isActive = true;

    async function fetchOrders() {
      try {
        setIsLoading(true);
        const response = await api.get('/orders');
        const rows = response.data?.data || [];

        if (isActive) {
          setOrders(rows);
        }
      } catch (error) {
        if (isActive) {
          setOrders([]);
        }

        console.error('Không thể tải danh sách đơn hàng:', error);
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    fetchOrders();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <section className="space-y-6 text-white">
      <div className="rounded-[32px] border border-[rgba(201,168,76,0.14)] bg-[linear-gradient(135deg,#16130e,#0f0e0b)] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.22)] sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <p className="text-[10px] uppercase tracking-[0.32em] text-[rgba(201,168,76,0.72)]">Admin / Orders</p>
            <h1 className="text-[2.4rem] leading-[1.02] tracking-[-0.04em] sm:text-[3rem]" style={{ fontFamily: 'var(--font-display)', fontWeight: 300 }}>
              Quản lý <em className="italic text-[#c9a84c]">đơn hàng</em>
            </h1>
            <p className="max-w-2xl text-[14px] leading-7 text-[rgba(240,235,224,0.62)]">
              Theo dõi đơn hàng, cập nhật trạng thái xử lý và truy cập nhanh chi tiết từng đơn trong cùng một bố cục tối.
            </p>
          </div>

          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-2 rounded-full bg-[#c9a84c] px-5 py-3 text-[13px] font-semibold text-[#1a1208] transition hover:gap-3 hover:opacity-90"
          >
            <ArrowRight className="h-4 w-4" />
            Về dashboard
          </Link>
        </div>

        <div className="mt-6 rounded-[24px] border border-[rgba(201,168,76,0.12)] bg-[rgba(255,255,255,0.03)] p-4">
          <label className="flex items-center gap-3 rounded-full border border-[rgba(201,168,76,0.16)] bg-[rgba(255,255,255,0.03)] px-4 py-3">
            <Search className="h-4 w-4 shrink-0 text-[rgba(240,235,224,0.48)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Tìm theo mã đơn, khách hàng, email hoặc trạng thái..."
              className="w-full bg-transparent text-sm text-[#f0ebe0] outline-none placeholder:text-[rgba(240,235,224,0.3)]"
            />
          </label>
        </div>
      </div>

      <div>
        {isLoading ? (
          <div className="rounded-[28px] border border-dashed border-[rgba(201,168,76,0.14)] bg-[rgba(255,255,255,0.03)] px-6 py-12 text-sm text-[rgba(240,235,224,0.58)]">
            Đang tải dữ liệu...
          </div>
        ) : (
          <div>
            {filteredOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-[28px] border border-dashed border-[rgba(201,168,76,0.16)] bg-[rgba(255,255,255,0.03)] px-6 py-16 text-center text-sm text-[rgba(240,235,224,0.58)]">
                <PackageSearch className="mb-4 h-7 w-7 text-[rgba(201,168,76,0.45)]" />
                Chưa có đơn hàng nào phù hợp với bộ lọc hiện tại.
              </div>
            ) : (
              <div className="overflow-hidden rounded-[28px] border border-[rgba(201,168,76,0.12)] bg-[rgba(255,255,255,0.03)]">
                <table className="w-full border-separate border-spacing-0 text-left">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-[0.28em] text-[rgba(240,235,224,0.36)]">
                      <th className="border-b border-[rgba(201,168,76,0.12)] px-4 py-4 font-medium">Mã đơn</th>
                      <th className="border-b border-[rgba(201,168,76,0.12)] px-4 py-4 font-medium">Ngày đặt</th>
                      <th className="border-b border-[rgba(201,168,76,0.12)] px-4 py-4 font-medium">Khách hàng</th>
                      <th className="border-b border-[rgba(201,168,76,0.12)] px-4 py-4 font-medium">Tổng tiền</th>
                      <th className="border-b border-[rgba(201,168,76,0.12)] px-4 py-4 font-medium">Trạng thái</th>
                      <th className="border-b border-[rgba(201,168,76,0.12)] px-4 py-4 text-right font-medium">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => {
                      const status = normalizeStatus(order.order_status || 'pending');

                      return (
                        <tr key={order.id} className="align-middle text-sm text-[rgba(240,235,224,0.72)]">
                          <td className="border-b border-[rgba(201,168,76,0.08)] px-4 py-4 font-medium text-[#f0ebe0]">{order.id}</td>
                          <td className="border-b border-[rgba(201,168,76,0.08)] px-4 py-4 text-[rgba(240,235,224,0.62)]">{formatDate(order.created_at)}</td>
                          <td className="border-b border-[rgba(201,168,76,0.08)] px-4 py-4">
                            <div className="font-medium text-[#f0ebe0]">{order.user_full_name || 'Khách hàng'}</div>
                            <div className="text-xs text-[rgba(240,235,224,0.4)]">{order.user_email || '--'}</div>
                          </td>
                          <td className="border-b border-[rgba(201,168,76,0.08)] px-4 py-4 text-[rgba(240,235,224,0.72)]">{formatVnd(order.total_amount_vnd)} VND</td>
                          <td className="border-b border-[rgba(201,168,76,0.08)] px-4 py-4">
                            <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium capitalize ${statusStyles(status)}`}>
                              {status || 'pending'}
                            </span>
                          </td>
                          <td className="border-b border-[rgba(201,168,76,0.08)] px-4 py-4 text-right">
                            <Link href={`/admin/orders/${order.id}`} className="inline-flex items-center gap-2 text-sm font-medium text-[rgba(240,235,224,0.72)] transition hover:text-[#c9a84c]">
                              Chi tiết
                              <ArrowRight className="h-4 w-4" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}