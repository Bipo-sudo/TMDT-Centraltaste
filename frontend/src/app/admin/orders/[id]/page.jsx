'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import api from '../../../../lib/api';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

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

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id;

  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState('pending');
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

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

    async function loadOrder() {
      try {
        setIsLoading(true);
        setErrorMessage('');

        const response = await api.get(`/orders/${orderId}`);
        const data = response.data?.data;

        if (!isActive || !data) {
          return;
        }

        const nextStatus = normalizeStatus(data.order_status || 'pending');

        setOrder(data);
        setStatus(nextStatus || 'pending');
      } catch (error) {
        if (isActive) {
          setErrorMessage(error?.response?.data?.message || 'Không thể tải chi tiết đơn hàng.');
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    if (orderId) {
      loadOrder();
    }

    return () => {
      isActive = false;
    };
  }, [orderId]);

  const items = useMemo(() => order?.items || [], [order]);

  async function handleUpdateStatus() {
    try {
      setIsUpdating(true);
      setErrorMessage('');

      await api.put(`/orders/${orderId}/status`, { status });

      setOrder((currentOrder) => ({
        ...(currentOrder || {}),
        order_status: status,
      }));
      setToastMessage('Cập nhật trạng thái đơn hàng thành công');
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || 'Cập nhật trạng thái thất bại.');
    } finally {
      setIsUpdating(false);
    }
  }

  if (isLoading) {
    return (
      <section className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.04)] sm:p-8">
        <div className="rounded-[24px] border border-dashed border-neutral-200 bg-neutral-50 px-6 py-12 text-sm text-neutral-500">
          Đang tải chi tiết đơn hàng...
        </div>
      </section>
    );
  }

  if (!order) {
    return (
      <section className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.04)] sm:p-8">
        <div className="rounded-[24px] border border-dashed border-neutral-200 bg-neutral-50 px-6 py-12 text-sm text-neutral-500">
          {errorMessage || 'Không tìm thấy đơn hàng.'}
        </div>
        <button
          type="button"
          onClick={() => router.push('/admin/orders')}
          className="mt-4 inline-flex items-center rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:border-neutral-400 hover:text-neutral-950"
        >
          Quay lại
        </button>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.04)] sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/admin/orders"
              className="inline-flex items-center text-sm font-medium text-neutral-600 transition hover:text-neutral-950"
            >
              Quay lại
            </Link>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-neutral-950">{order.id}</h1>
            <p className="mt-2 text-sm text-neutral-600">Ngày đặt: {formatDate(order.created_at)}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="h-11 rounded-full border border-neutral-300 bg-white px-4 text-sm text-neutral-800 outline-none transition focus:border-neutral-500"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleUpdateStatus}
              disabled={isUpdating}
              className="inline-flex h-11 items-center justify-center rounded-full bg-neutral-950 px-5 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isUpdating ? 'Đang cập nhật...' : 'Cập nhật'}
            </button>
          </div>
        </div>

        {toastMessage ? (
          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {toastMessage}
          </div>
        ) : null}

        {errorMessage ? (
          <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {errorMessage}
          </div>
        ) : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.04)]">
          <p className="text-xs uppercase tracking-[0.32em] text-neutral-400">Khách hàng</p>
          <div className="mt-4 space-y-2 text-sm text-neutral-700">
            <p className="font-medium text-neutral-950">{order.user_full_name || 'Khách hàng'}</p>
            <p>{order.user_email || '--'}</p>
          </div>
        </section>

        <section className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.04)]">
          <p className="text-xs uppercase tracking-[0.32em] text-neutral-400">Giao hàng</p>
          <div className="mt-4 space-y-2 text-sm text-neutral-700">
            <p>{order.shipping_address || '--'}</p>
            <p>Thanh toán: {order.payment_method || '--'}</p>
            <p className="font-medium text-neutral-950">Tổng tiền: {formatVnd(order.total_amount_vnd)} VND</p>
          </div>
        </section>
      </div>

      <section className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.04)]">
        <p className="text-xs uppercase tracking-[0.32em] text-neutral-400">Sản phẩm trong đơn</p>

        {items.length === 0 ? (
          <div className="mt-4 rounded-[24px] border border-dashed border-neutral-200 bg-neutral-50 px-6 py-10 text-sm text-neutral-500">
            Đơn hàng này chưa có item chi tiết.
          </div>
        ) : (
          <div className="mt-4 overflow-hidden rounded-[20px]">
            <table className="w-full border-separate border-spacing-0">
              <thead>
                <tr className="text-left text-xs uppercase tracking-[0.3em] text-neutral-400">
                  <th className="border-b border-neutral-200 px-4 py-4 font-medium">Ảnh</th>
                  <th className="border-b border-neutral-200 px-4 py-4 font-medium">Tên</th>
                  <th className="border-b border-neutral-200 px-4 py-4 font-medium">Số lượng</th>
                  <th className="border-b border-neutral-200 px-4 py-4 font-medium">Giá</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="align-middle text-sm text-neutral-700">
                    <td className="border-b border-neutral-200 px-4 py-4">
                      {item.main_image_url ? (
                        <img
                          src={item.main_image_url}
                          alt={item.name_vi || item.name_en || item.product_id}
                          className="h-12 w-12 rounded-[12px] object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-[12px] bg-neutral-200" />
                      )}
                    </td>
                    <td className="border-b border-neutral-200 px-4 py-4 font-medium text-neutral-950">
                      {item.name_vi || item.name_en || item.product_id}
                    </td>
                    <td className="border-b border-neutral-200 px-4 py-4">{Number(item.quantity || 0)}</td>
                    <td className="border-b border-neutral-200 px-4 py-4">{formatVnd(item.unit_price_vnd)} VND</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  );
}