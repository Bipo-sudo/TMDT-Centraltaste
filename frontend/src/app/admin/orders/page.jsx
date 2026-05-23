'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
    <section className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.04)] sm:p-8">
      <div className="border-b border-neutral-200 pb-6">
        <p className="text-xs uppercase tracking-[0.35em] text-neutral-400">Admin</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-neutral-950">Quản lý đơn hàng</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">
          Theo dõi đơn hàng, cập nhật trạng thái xử lý và truy cập nhanh chi tiết từng đơn.
        </p>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <div className="rounded-[24px] border border-dashed border-neutral-200 bg-neutral-50 px-6 py-12 text-sm text-neutral-500">
            Đang tải dữ liệu...
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-neutral-200 bg-neutral-50 px-6 py-12 text-sm text-neutral-500">
            Chưa có đơn hàng nào.
          </div>
        ) : (
          <div className="overflow-hidden rounded-[24px]">
            <table className="w-full border-separate border-spacing-0">
              <thead>
                <tr className="text-left text-xs uppercase tracking-[0.32em] text-neutral-400">
                  <th className="border-b border-neutral-200 px-4 py-4 font-medium">Mã đơn</th>
                  <th className="border-b border-neutral-200 px-4 py-4 font-medium">Ngày đặt</th>
                  <th className="border-b border-neutral-200 px-4 py-4 font-medium">Khách hàng</th>
                  <th className="border-b border-neutral-200 px-4 py-4 font-medium">Tổng tiền</th>
                  <th className="border-b border-neutral-200 px-4 py-4 font-medium">Trạng thái</th>
                  <th className="border-b border-neutral-200 px-4 py-4 text-right font-medium">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const status = normalizeStatus(order.order_status || 'pending');

                  return (
                    <tr key={order.id} className="align-middle text-sm text-neutral-700">
                      <td className="border-b border-neutral-200 px-4 py-4 font-medium text-neutral-950">{order.id}</td>
                      <td className="border-b border-neutral-200 px-4 py-4 text-neutral-600">{formatDate(order.created_at)}</td>
                      <td className="border-b border-neutral-200 px-4 py-4">
                        <div className="font-medium text-neutral-950">{order.user_full_name || 'Khách hàng'}</div>
                        <div className="text-xs text-neutral-500">{order.user_email || '--'}</div>
                      </td>
                      <td className="border-b border-neutral-200 px-4 py-4 text-neutral-700">
                        {formatVnd(order.total_amount_vnd)} VND
                      </td>
                      <td className="border-b border-neutral-200 px-4 py-4">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium capitalize ${statusStyles(status)}`}
                        >
                          {status || 'pending'}
                        </span>
                      </td>
                      <td className="border-b border-neutral-200 px-4 py-4 text-right">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="text-sm font-medium text-neutral-700 transition hover:text-neutral-950"
                        >
                          Chi tiết
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
    </section>
  );
}