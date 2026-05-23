'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../../lib/api';
import useStore from '../../../store/useStore';

function formatVnd(value) {
  return Number(value || 0).toLocaleString('vi-VN');
}

export default function CheckoutPage() {
  const router = useRouter();
  const setCartCount = useStore((state) => state.setCartCount);

  const [isMounted, setIsMounted] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [totalAmountVnd, setTotalAmountVnd] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [momoReference, setMomoReference] = useState('CTASTE - 482913');
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    address: '',
    note: '',
    paymentMethod: 'COD',
    cardNumber: '',
    cardName: '',
    cardExpiry: '',
    cardCvv: '',
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (form.paymentMethod === 'MOMO') {
      const randomCode = `CTASTE - ${Math.floor(100000 + Math.random() * 900000)}`;
      setMomoReference(randomCode);
    }
  }, [form.paymentMethod]);

  useEffect(() => {
    let isMounted = true;

    async function loadCart() {
      if (!isMounted) {
        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage('');

        const response = await api.get('/cart');
        const items = response.data?.data?.items || [];
        const total = response.data?.data?.total_amount_vnd || 0;

        if (!isMounted) {
          return;
        }

        if (items.length === 0) {
          router.replace('/cart');
          return;
        }

        setCartItems(items);
        setTotalAmountVnd(total);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        if (error?.response?.status === 401) {
          router.replace('/login');
          return;
        }

        setErrorMessage('Không thể tải thông tin thanh toán.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadCart();

    return () => {
      isMounted = false;
    };
  }, [router]);

  useEffect(() => {
    if (!toastMessage) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setToastMessage('');
    }, 2200);

    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  const totalCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    [cartItems]
  );

  function getPaymentMethodValue() {
    switch (form.paymentMethod) {
      case 'VISA':
        return 'Visa';
      case 'MOMO':
        return 'MoMo';
      default:
        return 'COD';
    }
  }

  function validateVisaForm() {
    if (form.paymentMethod !== 'VISA') {
      return null;
    }

    if (!form.cardNumber.trim() || !form.cardName.trim() || !form.cardExpiry.trim() || !form.cardCvv.trim()) {
      return 'Vui lòng nhập đầy đủ thông tin thẻ VISA.';
    }

    if (form.cardCvv.trim().length < 3) {
      return 'CVV không hợp lệ.';
    }

    return null;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      setIsProcessingPayment(true);
      setErrorMessage('');

      const visaValidationError = validateVisaForm();
      if (visaValidationError) {
        setErrorMessage(visaValidationError);
        return;
      }

      const processingDelay = 1000 + Math.floor(Math.random() * 1000);
      await new Promise((resolve) => window.setTimeout(resolve, processingDelay));

      const shippingAddress = [
        `Họ tên: ${form.full_name}`,
        `Số điện thoại: ${form.phone}`,
        `Địa chỉ: ${form.address}`,
        form.note ? `Ghi chú: ${form.note}` : null,
      ]
        .filter(Boolean)
        .join(' | ');

      const payload = {
        items: cartItems.map((item) => ({
          product_id: item.product_id,
          quantity: Number(item.quantity || 0),
        })),
        payment_method: getPaymentMethodValue(),
        shipping_address: shippingAddress,
      };

      const response = await api.post('/orders', payload);

      if (response.data?.success) {
        setCartCount(0);
        setToastMessage('Đặt hàng thành công');
        window.setTimeout(() => {
          router.replace('/me');
        }, 1200);
      }
    } catch (error) {
      if (error?.response?.status === 401) {
        router.replace('/login');
        return;
      }

      setErrorMessage(error?.response?.data?.message || 'Đặt hàng thất bại.');
    } finally {
      setIsSubmitting(false);
      setIsProcessingPayment(false);
    }
  }

  if (isLoading) {
    if (!isMounted) {
      return null;
    }

    return (
      <section className="mx-auto flex min-h-[60vh] w-full max-w-7xl items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-sm text-[rgba(240,235,224,0.6)]">Đang tải thông tin thanh toán...</p>
      </section>
    );
  }

  if (!isMounted) {
    return null;
  }

  if (errorMessage) {
    return (
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-[24px] border border-dashed border-[rgba(201,168,76,0.14)] bg-[rgba(255,255,255,0.02)] p-8 text-sm text-[rgba(240,235,224,0.6)]">
          {errorMessage}
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="mb-10 max-w-2xl space-y-3">
          <p className="text-[11px] uppercase tracking-[0.4em] text-[rgba(201,168,76,0.64)]">Checkout</p>
          <h1 className="text-4xl font-light tracking-[-0.05em] text-[#f0ebe0]">Thanh toán</h1>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)] lg:items-start">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="rounded-[28px] bg-[rgba(255,255,255,0.02)] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.26)] sm:p-8">
              <p className="text-xs uppercase tracking-[0.35em] text-[rgba(201,168,76,0.64)]">Thông tin giao hàng</p>

              <div className="mt-6 grid gap-6">
                <label className="block border-b border-[rgba(201,168,76,0.08)] pb-3">
                  <span className="sr-only">Họ tên</span>
                  <input
                    type="text"
                    required
                    value={form.full_name}
                    onChange={(event) => setForm((prev) => ({ ...prev, full_name: event.target.value }))}
                    placeholder="Họ và tên"
                    className="w-full bg-transparent text-sm text-[#f0ebe0] outline-none placeholder:text-[rgba(240,235,224,0.38)]"
                  />
                </label>

                <label className="block border-b border-[rgba(201,168,76,0.08)] pb-3">
                  <span className="sr-only">Số điện thoại</span>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                    placeholder="Số điện thoại"
                    className="w-full bg-transparent text-sm text-[#f0ebe0] outline-none placeholder:text-[rgba(240,235,224,0.38)]"
                  />
                </label>

                <label className="block border-b border-[rgba(201,168,76,0.08)] pb-3">
                  <span className="sr-only">Địa chỉ chi tiết</span>
                  <input
                    type="text"
                    required
                    value={form.address}
                    onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))}
                    placeholder="Địa chỉ chi tiết"
                    className="w-full bg-transparent text-sm text-[#f0ebe0] outline-none placeholder:text-[rgba(240,235,224,0.38)]"
                  />
                </label>

                <label className="block border-b border-[rgba(201,168,76,0.08)] pb-3">
                  <span className="sr-only">Ghi chú</span>
                  <textarea
                    rows={3}
                    value={form.note}
                    onChange={(event) => setForm((prev) => ({ ...prev, note: event.target.value }))}
                    placeholder="Ghi chú"
                    className="w-full resize-none bg-transparent text-sm text-[#f0ebe0] outline-none placeholder:text-[rgba(240,235,224,0.38)]"
                  />
                </label>
              </div>
            </div>

            <div className="rounded-[28px] bg-[rgba(255,255,255,0.02)] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.26)] sm:p-8">
              <p className="text-xs uppercase tracking-[0.35em] text-[rgba(201,168,76,0.64)]">Phương thức thanh toán</p>

              <div className="mt-6 space-y-3">
                {[
                  { value: 'COD', label: 'Thanh toán khi nhận hàng (COD)' },
                  { value: 'VISA', label: 'VISA' },
                  { value: 'MOMO', label: 'MOMO' },
                ].map((method) => {
                  const isActive = form.paymentMethod === method.value;

                  return (
                    <label
                      key={method.value}
                      className={`flex cursor-pointer items-center gap-4 rounded-[20px] border px-4 py-4 transition ${
                        isActive
                          ? 'border-[rgba(201,168,76,0.22)] bg-[rgba(201,168,76,0.06)]'
                          : 'border-[rgba(201,168,76,0.08)] bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.04)]'
                      }`}
                    >
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                          isActive ? 'border-[#c9a84c]' : 'border-[rgba(240,235,224,0.24)]'
                        }`}
                      >
                        <span className={`h-2.5 w-2.5 rounded-full ${isActive ? 'bg-[#c9a84c]' : 'bg-transparent'}`} />
                      </span>
                      <input
                        type="radio"
                        name="payment_method"
                        value={method.value}
                        checked={isActive}
                        onChange={(event) => setForm((prev) => ({ ...prev, paymentMethod: event.target.value }))}
                        className="sr-only"
                      />
                      <span className="text-sm text-[#f0ebe0]">{method.label}</span>
                    </label>
                  );
                })}
              </div>

              {form.paymentMethod === 'VISA' ? (
                <div className="mt-6 grid gap-5 rounded-[24px] bg-[rgba(255,255,255,0.03)] p-5">
                  <label className="block border-b border-[rgba(201,168,76,0.08)] pb-3">
                    <span className="sr-only">Số thẻ</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      required
                      value={form.cardNumber}
                      onChange={(event) => setForm((prev) => ({ ...prev, cardNumber: event.target.value }))}
                      placeholder="Số thẻ"
                      className="w-full bg-transparent text-sm text-[#f0ebe0] outline-none placeholder:text-[rgba(240,235,224,0.38)]"
                    />
                  </label>

                  <label className="block border-b border-[rgba(201,168,76,0.08)] pb-3">
                    <span className="sr-only">Tên in trên thẻ</span>
                    <input
                      type="text"
                      required
                      value={form.cardName}
                      onChange={(event) => setForm((prev) => ({ ...prev, cardName: event.target.value }))}
                      placeholder="Tên in trên thẻ"
                      className="w-full bg-transparent text-sm text-[#f0ebe0] outline-none placeholder:text-[rgba(240,235,224,0.38)]"
                    />
                  </label>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="block border-b border-[rgba(201,168,76,0.08)] pb-3">
                      <span className="sr-only">Ngày hết hạn</span>
                      <input
                        type="text"
                        required
                        value={form.cardExpiry}
                        onChange={(event) => setForm((prev) => ({ ...prev, cardExpiry: event.target.value }))}
                        placeholder="MM/YY"
                        className="w-full bg-transparent text-sm text-[#f0ebe0] outline-none placeholder:text-[rgba(240,235,224,0.38)]"
                      />
                    </label>

                    <label className="block border-b border-[rgba(201,168,76,0.08)] pb-3">
                      <span className="sr-only">CVV</span>
                      <input
                        type="password"
                        required
                        value={form.cardCvv}
                        onChange={(event) => setForm((prev) => ({ ...prev, cardCvv: event.target.value }))}
                        placeholder="CVV"
                        className="w-full bg-transparent text-sm text-[#f0ebe0] outline-none placeholder:text-[rgba(240,235,224,0.38)]"
                      />
                    </label>
                  </div>
                </div>
              ) : null}

              {form.paymentMethod === 'MOMO' ? (
                <div className="mt-6 grid gap-5 rounded-[24px] bg-[rgba(255,255,255,0.03)] p-5 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-center">
                  <div className="overflow-hidden rounded-[20px] bg-[rgba(255,255,255,0.02)] p-3 shadow-[0_10px_30px_rgba(0,0,0,0.22)]">
                    <img
                      src="https://via.placeholder.com/320x320/1a1810/f0ebe0?text=QR+CODE"
                      alt="QR Code MoMo giả lập"
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="space-y-3 text-sm text-[rgba(240,235,224,0.64)]">
                    <p className="text-xs uppercase tracking-[0.35em] text-[rgba(201,168,76,0.64)]">Hướng dẫn chuyển khoản</p>
                    <p>
                      Mở ứng dụng MoMo và quét mã QR giả lập bên trái để xác nhận thanh toán.
                    </p>
                    <p>
                      Nội dung: <span className="font-medium text-[#f0ebe0]">{momoReference}</span>
                    </p>
                  </div>
                </div>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting || isProcessingPayment}
                className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-full bg-[#c9a84c] px-6 text-sm font-medium text-[#1a1208] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isProcessingPayment ? 'Đang xử lý thanh toán...' : isSubmitting ? 'Đang đặt hàng...' : 'Đặt hàng'}
              </button>
            </div>
          </form>

          <aside className="rounded-[28px] bg-[rgba(255,255,255,0.02)] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.26)] lg:sticky lg:top-28">
            <p className="text-xs uppercase tracking-[0.35em] text-[rgba(201,168,76,0.64)]">Order Summary</p>

            <div className="mt-6 space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center gap-4">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-neutral-800">
                    <img src={item.main_image_url} alt={item.name_vi} className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[#f0ebe0]">{item.name_vi}</p>
                    <p className="mt-1 text-xs text-[rgba(240,235,224,0.54)]">SL: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-medium text-[#f0ebe0]">{formatVnd(item.line_total_vnd)} VND</p>
                </div>
              ))}
            </div>

            <div className="mt-8 space-y-4 text-sm text-[rgba(240,235,224,0.64)]">
              <div className="flex items-center justify-between gap-4">
                <span>Tổng tiền hàng</span>
                <span className="font-medium text-[#f0ebe0]">{formatVnd(totalAmountVnd)} VND</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Phí vận chuyển</span>
                <span className="font-medium text-[#f0ebe0]">Miễn phí</span>
              </div>
              <div className="h-px bg-[rgba(201,168,76,0.08)]" />
              <div className="flex items-center justify-between gap-4 text-base">
                <span className="font-medium text-[#f0ebe0]">Tổng cộng</span>
                <span className="font-semibold text-[#f0ebe0]">{formatVnd(totalAmountVnd)} VND</span>
              </div>
              <div className="text-xs text-[rgba(240,235,224,0.54)]">{totalCount} sản phẩm trong đơn hàng</div>
            </div>
          </aside>
        </div>
      </section>

      <div className={`fixed bottom-5 right-5 z-[80] transition ${toastMessage ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0'}`}>
        <div className="rounded-2xl border border-[rgba(201,168,76,0.12)] bg-[rgba(19,17,8,0.98)] px-4 py-3 text-sm text-[#f0ebe0] shadow-[0_18px_45px_rgba(0,0,0,0.3)]">
          {toastMessage}
        </div>
      </div>

      <div className="sr-only" aria-live="polite">
        {toastMessage}
      </div>
    </>
  );
}
