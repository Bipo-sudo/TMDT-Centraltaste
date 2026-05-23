'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
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
      <section className="rounded-[28px] border border-[rgba(201,168,76,0.14)] bg-[rgba(255,255,255,0.03)] p-6 text-white shadow-[0_18px_50px_rgba(0,0,0,0.16)] sm:p-8">
        <div className="rounded-[24px] border border-dashed border-[rgba(201,168,76,0.14)] bg-[rgba(255,255,255,0.03)] px-6 py-12 text-sm text-[rgba(240,235,224,0.58)]">
          Đang tải chi tiết đơn hàng...
        </div>
      </section>
    );
  }

  if (!order) {
    return (
      <section className="rounded-[28px] border border-[rgba(201,168,76,0.14)] bg-[rgba(255,255,255,0.03)] p-6 text-white shadow-[0_18px_50px_rgba(0,0,0,0.16)] sm:p-8">
        <div className="rounded-[24px] border border-dashed border-[rgba(201,168,76,0.14)] bg-[rgba(255,255,255,0.03)] px-6 py-12 text-sm text-[rgba(240,235,224,0.58)]">
          {errorMessage || 'Không tìm thấy đơn hàng.'}
        </div>
        <button
          type="button"
          onClick={() => router.push('/admin/orders')}
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-[rgba(240,235,224,0.18)] bg-[rgba(255,255,255,0.03)] px-4 py-2 text-sm font-medium text-[rgba(240,235,224,0.78)] transition hover:border-[rgba(201,168,76,0.55)] hover:text-[#c9a84c]"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </button>
      </section>
    );
  }

  return (
    <section className="space-y-6 text-white">
      <div className="rounded-[32px] border border-[rgba(201,168,76,0.14)] bg-[linear-gradient(135deg,#16130e,#0f0e0b)] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.22)] sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-2 text-sm font-medium text-[rgba(240,235,224,0.68)] transition hover:text-[#c9a84c]"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại
            </Link>
            <h1 className="mt-3 text-[2.3rem] leading-[1.02] tracking-[-0.04em] sm:text-[3rem]" style={{ fontFamily: 'var(--font-display)', fontWeight: 300 }}>
              {order.id}
            </h1>
            <p className="mt-2 text-[14px] leading-7 text-[rgba(240,235,224,0.62)]">Ngày đặt: {formatDate(order.created_at)}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="h-11 rounded-full border border-[rgba(201,168,76,0.16)] bg-[rgba(255,255,255,0.03)] px-4 text-sm text-[#f0ebe0] outline-none transition focus:border-[rgba(201,168,76,0.45)]"
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
              className="inline-flex h-11 items-center justify-center rounded-full bg-[#c9a84c] px-5 text-sm font-semibold text-[#1a1208] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isUpdating ? 'Đang cập nhật...' : 'Cập nhật'}
            </button>
          </div>
        </div>

        {toastMessage ? (
          <div className="mt-5 flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            <CheckCircle2 className="h-4 w-4" />
            {toastMessage}
          </div>
        ) : null}

        {errorMessage ? (
          <div className="mt-5 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {errorMessage}
          </div>
        ) : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-[28px] border border-[rgba(201,168,76,0.14)] bg-[rgba(255,255,255,0.03)] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.16)]">
          <p className="text-[10px] uppercase tracking-[0.28em] text-[rgba(201,168,76,0.72)]">Khách hàng</p>
          <div className="mt-4 space-y-2 text-sm text-[rgba(240,235,224,0.72)]">
            <p className="font-medium text-[#f0ebe0]">{order.user_full_name || 'Khách hàng'}</p>
            <p>{order.user_email || '--'}</p>
          </div>
        </section>

        <section className="rounded-[28px] border border-[rgba(201,168,76,0.14)] bg-[rgba(255,255,255,0.03)] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.16)]">
          <p className="text-[10px] uppercase tracking-[0.28em] text-[rgba(201,168,76,0.72)]">Giao hàng</p>
          <div className="mt-4 space-y-2 text-sm text-[rgba(240,235,224,0.72)]">
            <p>{order.shipping_address || '--'}</p>
            <p>Thanh toán: {order.payment_method || '--'}</p>
            <p className="font-medium text-[#f0ebe0]">Tổng tiền: {formatVnd(order.total_amount_vnd)} VND</p>
          </div>
        </section>
      </div>

      <section className="rounded-[28px] border border-[rgba(201,168,76,0.14)] bg-[rgba(255,255,255,0.03)] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.16)]">
        <p className="text-[10px] uppercase tracking-[0.28em] text-[rgba(201,168,76,0.72)]">Sản phẩm trong đơn</p>

        {items.length === 0 ? (
          <div className="mt-4 rounded-[24px] border border-dashed border-[rgba(201,168,76,0.14)] bg-[rgba(255,255,255,0.03)] px-6 py-10 text-sm text-[rgba(240,235,224,0.58)]">
            Đơn hàng này chưa có item chi tiết.
          </div>
        ) : (
          <div className="mt-4 overflow-hidden rounded-[20px]">
            <table className="w-full border-separate border-spacing-0">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-[0.28em] text-[rgba(240,235,224,0.36)]">
                  <th className="border-b border-[rgba(201,168,76,0.12)] px-4 py-4 font-medium">Ảnh</th>
                  <th className="border-b border-[rgba(201,168,76,0.12)] px-4 py-4 font-medium">Tên</th>
                  <th className="border-b border-[rgba(201,168,76,0.12)] px-4 py-4 font-medium">Số lượng</th>
                  <th className="border-b border-[rgba(201,168,76,0.12)] px-4 py-4 font-medium">Giá</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="align-middle text-sm text-[rgba(240,235,224,0.72)]">
                    <td className="border-b border-[rgba(201,168,76,0.08)] px-4 py-4">
                      {item.main_image_url ? (
                        <img
                          src={item.main_image_url}
                          alt={item.name_vi || item.name_en || item.product_id}
                          className="h-12 w-12 rounded-[12px] object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-[12px] border border-dashed border-[rgba(201,168,76,0.14)] bg-[rgba(255,255,255,0.03)]" />
                      )}
                    </td>
                    <td className="border-b border-[rgba(201,168,76,0.08)] px-4 py-4 font-medium text-[#f0ebe0]">
                      {item.name_vi || item.name_en || item.product_id}
                    </td>
                    <td className="border-b border-[rgba(201,168,76,0.08)] px-4 py-4">{Number(item.quantity || 0)}</td>
                    <td className="border-b border-[rgba(201,168,76,0.08)] px-4 py-4">{formatVnd(item.unit_price_vnd)} VND</td>
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