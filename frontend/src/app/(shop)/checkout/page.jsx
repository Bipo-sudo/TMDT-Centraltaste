'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { QRCodeCanvas } from 'qrcode.react';
import api from '../../../lib/api';
import useStore from '../../../store/useStore';

function formatVnd(value) {
  return Number(value || 0).toLocaleString('vi-VN');
}

function digitsOnly(value) {
  return value.replace(/\D/g, '');
}

function formatCardNumber(value) {
  const cleaned = digitsOnly(value).slice(0, 16);
  return cleaned.replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(value) {
  const cleaned = digitsOnly(value).slice(0, 4);

  if (cleaned.length <= 2) {
    return cleaned;
  }

  return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
}

function makeTransferContent() {
  return `DAIF${Math.floor(100000 + Math.random() * 900000)}`;
}

function resolveImageUrl(url) {
  if (!url || typeof url !== 'string') {
    return '';
  }

  const trimmed = url.trim();

  if (!trimmed || trimmed.includes('example.com')) {
    return '';
  }

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  return `http://localhost:5000${trimmed.startsWith('/') ? '' : '/'}${trimmed}`;
}

function getPaymentMethodLabel(method) {
  switch (method) {
    case 'momo':
    case 'zalopay':
    case 'bank-transfer':
      return 'MoMo';
    case 'card':
      return 'Visa';
    default:
      return 'COD';
  }
}

function ShippingField({ label, required = false, description, children }) {
  return (
    <label className="block space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm text-[rgba(240,235,224,0.78)]">
          {label}
          {required ? <span className="ml-1 text-[#c9a84c]">*</span> : null}
        </span>
        {description ? <span className="text-[11px] text-[rgba(240,235,224,0.38)]">{description}</span> : null}
      </div>
      {children}
    </label>
  );
}

function PaymentChoice({ checked, value, title, description, accentClassName, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(value)}
      className={`flex w-full items-center gap-4 rounded-[22px] border px-4 py-4 text-left transition ${
        checked
          ? 'border-[rgba(201,168,76,0.28)] bg-[rgba(201,168,76,0.08)] shadow-[0_14px_40px_rgba(0,0,0,0.16)]'
          : 'border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] hover:border-[rgba(201,168,76,0.16)] hover:bg-[rgba(255,255,255,0.04)]'
      }`}
    >
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${accentClassName}`}>
        <span className={`h-3.5 w-3.5 rounded-full border ${checked ? 'border-white bg-white' : 'border-white/70'}`} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-[#f5efe2]">{title}</span>
        <span className="mt-1 block text-xs text-[rgba(240,235,224,0.54)]">{description}</span>
      </span>
    </button>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const setCartCount = useStore((state) => state.setCartCount);

  const [isMounted, setIsMounted] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [totalAmountVnd, setTotalAmountVnd] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('momo');
  const [cardBrand, setCardBrand] = useState('visa');
  const [transferContent, setTransferContent] = useState(makeTransferContent);
  const [shipping, setShipping] = useState({
    fullName: '',
    phone: '',
    email: '',
    streetAddress: '',
    district: '',
    ward: '',
    city: '',
    note: '',
  });
  const [cardDetails, setCardDetails] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    let active = true;

    async function loadCart() {
      try {
        setIsLoading(true);
        setErrorMessage('');

        const response = await api.get('/cart');
        const items = response.data?.data?.items || [];
        const total = response.data?.data?.total_amount_vnd || 0;

        if (!active) {
          return;
        }

        if (items.length === 0) {
          router.replace('/cart');
          return;
        }

        setCartItems(items);
        setTotalAmountVnd(total);
      } catch (error) {
        if (!active) {
          return;
        }

        if (error?.response?.status === 401) {
          router.replace('/login');
          return;
        }

        setErrorMessage('Không thể tải thông tin thanh toán.');
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadCart();

    return () => {
      active = false;
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

  useEffect(() => {
    if (paymentMethod === 'momo' || paymentMethod === 'zalopay' || paymentMethod === 'bank-transfer') {
      setTransferContent(makeTransferContent());
    }
  }, [paymentMethod]);

  const totalCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    [cartItems]
  );

  const backendPaymentMethod = getPaymentMethodLabel(paymentMethod);
  const domesticPaymentSelected = paymentMethod === 'momo' || paymentMethod === 'zalopay' || paymentMethod === 'bank-transfer';
  const cardReady =
    cardBrand &&
    cardDetails.number.replace(/\s/g, '').length === 16 &&
    cardDetails.name.trim() &&
    cardDetails.expiry.trim().length === 5 &&
    cardDetails.cvv.trim().length === 3;

  async function handleSubmit(event) {
    event.preventDefault();

    if (!shipping.fullName.trim() || !shipping.phone.trim() || !shipping.streetAddress.trim() || !shipping.district.trim() || !shipping.ward.trim() || !shipping.city.trim()) {
      setErrorMessage('Vui lòng hoàn tất thông tin giao hàng.');
      return;
    }

    if (paymentMethod === 'card' && !cardReady) {
      setErrorMessage('Vui lòng nhập đầy đủ thông tin thẻ.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage('');

      const processingDelay = 800 + Math.floor(Math.random() * 600);
      await new Promise((resolve) => window.setTimeout(resolve, processingDelay));

      const payload = {
        items: cartItems.map((item) => ({
          product_id: item.product_id,
          quantity: Number(item.quantity || 0),
        })),
        payment_method: backendPaymentMethod,
        shipping_address: [
          `Họ tên: ${shipping.fullName.trim()}`,
          `SĐT: ${shipping.phone.trim()}`,
          shipping.email.trim() ? `Email: ${shipping.email.trim()}` : null,
          `Địa chỉ: ${shipping.streetAddress.trim()}, ${shipping.ward.trim()}, ${shipping.district.trim()}, ${shipping.city.trim()}`,
          shipping.note.trim() ? `Ghi chú: ${shipping.note.trim()}` : null,
        ]
          .filter(Boolean)
          .join(' | '),
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
    }
  }

  if (!isMounted) {
    return null;
  }

  if (isLoading) {
    return (
      <section className="mx-auto flex min-h-[60vh] w-full max-w-7xl items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-sm text-[rgba(240,235,224,0.6)]">Đang tải thông tin thanh toán...</p>
      </section>
    );
  }

  if (errorMessage) {
    return (
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-[24px] border border-dashed border-[rgba(201,168,76,0.14)] bg-[rgba(255,255,255,0.02)] p-8 text-sm text-[rgba(240,235,224,0.72)]">
          {errorMessage}
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="relative mx-auto w-full max-w-7xl px-4 pb-16 pt-10 sm:px-6 lg:px-8 lg:pb-20 lg:pt-14">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[28rem] bg-[radial-gradient(circle_at_top_left,_rgba(201,168,76,0.18),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(255,255,255,0.08),_transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.04),transparent_60%)]" />

        <div className="mb-8 max-w-3xl space-y-3">
          <p className="text-[11px] uppercase tracking-[0.42em] text-[rgba(201,168,76,0.72)]">Checkout</p>
          <h1 className="text-4xl font-light tracking-[-0.05em] text-[#f5efe2] sm:text-5xl">Thanh toán</h1>
          <p className="max-w-2xl text-sm leading-6 text-[rgba(240,235,224,0.58)]">
            Hoàn tất thông tin giao hàng, chọn phương thức thanh toán và xác nhận đơn hàng từ giỏ hàng hiện tại.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(340px,0.7fr)] lg:items-start">
          <form onSubmit={handleSubmit} className="space-y-6">
            <section className="rounded-[30px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.22)] sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-[rgba(201,168,76,0.72)]">Thông tin giao hàng</p>
                  <h2 className="mt-3 text-2xl font-medium tracking-[-0.03em] text-[#f5efe2]">Địa chỉ nhận hàng</h2>
                </div>
                <span className="rounded-full border border-[rgba(201,168,76,0.16)] bg-[rgba(201,168,76,0.08)] px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-[rgba(245,239,226,0.84)]">
                  Bắt buộc
                </span>
              </div>

              <div className="mt-6 grid gap-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <ShippingField label="Họ tên" required>
                    <input
                      type="text"
                      required
                      value={shipping.fullName}
                      onChange={(event) => setShipping((prev) => ({ ...prev, fullName: event.target.value }))}
                      placeholder="Nguyễn Văn A"
                      className="h-12 w-full rounded-[18px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-4 text-sm text-[#f5efe2] outline-none transition placeholder:text-[rgba(240,235,224,0.34)] focus:border-[rgba(201,168,76,0.3)]"
                    />
                  </ShippingField>

                  <ShippingField label="SĐT" required>
                    <input
                      type="tel"
                      required
                      value={shipping.phone}
                      onChange={(event) => setShipping((prev) => ({ ...prev, phone: event.target.value }))}
                      placeholder="0901 234 567"
                      className="h-12 w-full rounded-[18px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-4 text-sm text-[#f5efe2] outline-none transition placeholder:text-[rgba(240,235,224,0.34)] focus:border-[rgba(201,168,76,0.3)]"
                    />
                  </ShippingField>
                </div>

                <ShippingField label="Email">
                  <input
                    type="email"
                    value={shipping.email}
                    onChange={(event) => setShipping((prev) => ({ ...prev, email: event.target.value }))}
                    placeholder="you@example.com"
                    className="h-12 w-full rounded-[18px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-4 text-sm text-[#f5efe2] outline-none transition placeholder:text-[rgba(240,235,224,0.34)] focus:border-[rgba(201,168,76,0.3)]"
                  />
                </ShippingField>

                <ShippingField label="Địa chỉ chi tiết" required description="Số nhà, tên đường">
                  <input
                    type="text"
                    required
                    value={shipping.streetAddress}
                    onChange={(event) => setShipping((prev) => ({ ...prev, streetAddress: event.target.value }))}
                    placeholder="Số nhà, tên đường"
                    className="h-12 w-full rounded-[18px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-4 text-sm text-[#f5efe2] outline-none transition placeholder:text-[rgba(240,235,224,0.34)] focus:border-[rgba(201,168,76,0.3)]"
                  />
                </ShippingField>

                <div className="grid gap-5 md:grid-cols-3">
                  <ShippingField label="Quận/Huyện" required>
                    <input
                      type="text"
                      required
                      value={shipping.district}
                      onChange={(event) => setShipping((prev) => ({ ...prev, district: event.target.value }))}
                      placeholder="Quận 1"
                      className="h-12 w-full rounded-[18px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-4 text-sm text-[#f5efe2] outline-none transition placeholder:text-[rgba(240,235,224,0.34)] focus:border-[rgba(201,168,76,0.3)]"
                    />
                  </ShippingField>

                  <ShippingField label="Phường/Xã" required>
                    <input
                      type="text"
                      required
                      value={shipping.ward}
                      onChange={(event) => setShipping((prev) => ({ ...prev, ward: event.target.value }))}
                      placeholder="Phường Bến Nghé"
                      className="h-12 w-full rounded-[18px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-4 text-sm text-[#f5efe2] outline-none transition placeholder:text-[rgba(240,235,224,0.34)] focus:border-[rgba(201,168,76,0.3)]"
                    />
                  </ShippingField>

                  <ShippingField label="Tỉnh/TP" required>
                    <input
                      type="text"
                      required
                      value={shipping.city}
                      onChange={(event) => setShipping((prev) => ({ ...prev, city: event.target.value }))}
                      placeholder="TP. Hồ Chí Minh"
                      className="h-12 w-full rounded-[18px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-4 text-sm text-[#f5efe2] outline-none transition placeholder:text-[rgba(240,235,224,0.34)] focus:border-[rgba(201,168,76,0.3)]"
                    />
                  </ShippingField>
                </div>

                <ShippingField label="Ghi chú đơn hàng" description="Tùy chọn">
                  <textarea
                    rows={4}
                    value={shipping.note}
                    onChange={(event) => setShipping((prev) => ({ ...prev, note: event.target.value }))}
                    placeholder="Ví dụ: giao buổi chiều, gọi trước khi đến..."
                    className="w-full resize-none rounded-[22px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-4 py-3 text-sm text-[#f5efe2] outline-none transition placeholder:text-[rgba(240,235,224,0.34)] focus:border-[rgba(201,168,76,0.3)]"
                  />
                </ShippingField>
              </div>
            </section>

            <section className="rounded-[30px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.22)] sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-[rgba(201,168,76,0.72)]">Phương thức thanh toán</p>
                  <h2 className="mt-3 text-2xl font-medium tracking-[-0.03em] text-[#f5efe2]">Chọn hình thức thanh toán</h2>
                </div>
                <span className="rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-[rgba(240,235,224,0.7)]">
                  Bảo mật
                </span>
              </div>

              <div className="mt-6 grid gap-6 xl:grid-cols-2">
                <div className="space-y-4 rounded-[26px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] p-5">
                  <p className="text-[11px] uppercase tracking-[0.35em] text-[rgba(201,168,76,0.72)]">Thanh toán nội địa</p>
                  <div className="space-y-3">
                    <PaymentChoice
                      checked={paymentMethod === 'momo'}
                      value="momo"
                      title="MoMo"
                      description="Ví điện tử MoMo, quét QR để xác nhận giao dịch"
                      accentClassName="bg-[#c83d8d]"
                      onChange={setPaymentMethod}
                    />
                    <PaymentChoice
                      checked={paymentMethod === 'zalopay'}
                      value="zalopay"
                      title="ZaloPay"
                      description="Ví điện tử ZaloPay, dùng cùng quy trình quét mã"
                      accentClassName="bg-[#0068ff]"
                      onChange={setPaymentMethod}
                    />
                    <PaymentChoice
                      checked={paymentMethod === 'bank-transfer'}
                      value="bank-transfer"
                      title="Chuyển khoản ngân hàng"
                      description="Hiển thị QR, thông tin tài khoản và nội dung chuyển khoản"
                      accentClassName="bg-[#16a34a]"
                      onChange={setPaymentMethod}
                    />
                  </div>

                  {paymentMethod === 'momo' || paymentMethod === 'zalopay' || paymentMethod === 'bank-transfer' ? (
                    <div className="grid gap-4 rounded-[24px] border border-[rgba(201,168,76,0.14)] bg-[rgba(201,168,76,0.06)] p-4 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-start">
                      <div className="rounded-[22px] bg-white p-4 shadow-[0_18px_45px_rgba(0,0,0,0.14)]">
                        <div className="rounded-[16px] bg-[radial-gradient(circle_at_25%_25%,rgba(0,0,0,0.16),transparent_26%),radial-gradient(circle_at_75%_35%,rgba(0,0,0,0.16),transparent_20%),linear-gradient(180deg,#ffffff,#f4efe4)] p-3">
                          <QRCodeCanvas
                            value={`${paymentMethod.toUpperCase()}|${transferContent}|${formatVnd(totalAmountVnd)}`}
                            size={176}
                            includeMargin
                            level="M"
                            fgColor="#111111"
                            bgColor="#ffffff"
                            className="h-full w-full"
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.35em] text-[rgba(245,239,226,0.7)]">Hướng dẫn thanh toán</p>
                          <p className="mt-3 text-sm leading-6 text-[rgba(240,235,224,0.72)]">
                            Quét mã QR bên trái bằng ứng dụng {paymentMethod === 'momo' ? 'MoMo' : paymentMethod === 'zalopay' ? 'ZaloPay' : 'ngân hàng'} để hoàn tất giao dịch.
                          </p>
                        </div>

                        <div className="grid gap-3 rounded-[22px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-4 text-sm text-[rgba(240,235,224,0.72)]">
                          <div className="flex items-center justify-between gap-4">
                            <span>Ngân hàng</span>
                            <span className="font-medium text-[#f5efe2]">Vietcombank</span>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span>Số tài khoản</span>
                            <span className="font-mono text-[#f5efe2]">0123456789</span>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span>Chủ tài khoản</span>
                            <span className="text-right font-medium text-[#f5efe2]">CONG TY DAIF CENTRALTASTE</span>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span>Số tiền</span>
                            <span className="font-semibold text-[#c9a84c]">{formatVnd(totalAmountVnd)} ₫</span>
                          </div>
                        </div>

                        <div className="rounded-[22px] border border-[rgba(201,168,76,0.18)] bg-[rgba(201,168,76,0.08)] p-4">
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-sm text-[rgba(245,239,226,0.74)]">Nội dung chuyển khoản</span>
                            <code className="rounded-full bg-black/20 px-3 py-1 text-sm font-semibold tracking-[0.18em] text-[#f5efe2]">
                              {transferContent}
                            </code>
                          </div>
                          <p className="mt-2 text-xs leading-5 text-[rgba(245,239,226,0.68)]">
                            Vui lòng nhập chính xác nội dung này khi chuyển khoản để hệ thống đối soát đơn hàng.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="space-y-4 rounded-[26px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] p-5">
                  <p className="text-[11px] uppercase tracking-[0.35em] text-[rgba(201,168,76,0.72)]">Thanh toán quốc tế</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'visa', label: 'Visa', tone: 'from-[#1a52b8] to-[#2d74ff]' },
                      { value: 'mastercard', label: 'Mastercard', tone: 'from-[#d12f27] to-[#ff8d2a]' },
                      { value: 'jcb', label: 'JCB', tone: 'from-[#0f7bc1] to-[#1db4ff]' },
                    ].map((brand) => {
                      const isActive = cardBrand === brand.value;

                      return (
                        <button
                          key={brand.value}
                          type="button"
                          onClick={() => setCardBrand(brand.value)}
                          className={`rounded-[20px] border px-3 py-3 text-left transition ${
                            isActive
                              ? 'border-[rgba(201,168,76,0.22)] bg-[rgba(201,168,76,0.08)]'
                              : 'border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.05)]'
                          }`}
                        >
                          <div className={`h-10 rounded-[14px] bg-gradient-to-r ${brand.tone} p-2`}>
                            <div className="flex h-full items-center justify-center rounded-[10px] bg-black/12 text-xs font-semibold uppercase tracking-[0.22em] text-white">
                              {brand.label}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="space-y-4 rounded-[24px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-4">
                    <div className="grid gap-4">
                      <ShippingField label="Số thẻ" required description="xxxx xxxx xxxx xxxx">
                        <input
                          type="text"
                          inputMode="numeric"
                          autoComplete="cc-number"
                          required
                          value={cardDetails.number}
                          onChange={(event) => setCardDetails((prev) => ({ ...prev, number: formatCardNumber(event.target.value) }))}
                          placeholder="1234 5678 9012 3456"
                          className="h-12 w-full rounded-[18px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-4 text-sm text-[#f5efe2] outline-none transition placeholder:text-[rgba(240,235,224,0.34)] focus:border-[rgba(201,168,76,0.3)]"
                        />
                      </ShippingField>

                      <ShippingField label="Tên chủ thẻ" required description="VIẾT IN HOA">
                        <input
                          type="text"
                          autoComplete="cc-name"
                          required
                          value={cardDetails.name}
                          onChange={(event) => setCardDetails((prev) => ({ ...prev, name: event.target.value.toUpperCase() }))}
                          placeholder="NGUYEN VAN A"
                          className="h-12 w-full rounded-[18px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-4 text-sm uppercase text-[#f5efe2] outline-none transition placeholder:normal-case placeholder:text-[rgba(240,235,224,0.34)] focus:border-[rgba(201,168,76,0.3)]"
                        />
                      </ShippingField>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <ShippingField label="Ngày hết hạn" required description="MM/YY">
                        <input
                          type="text"
                          inputMode="numeric"
                          autoComplete="cc-exp"
                          required
                          maxLength={5}
                          value={cardDetails.expiry}
                          onChange={(event) => setCardDetails((prev) => ({ ...prev, expiry: formatExpiry(event.target.value) }))}
                          placeholder="MM/YY"
                          className="h-12 w-full rounded-[18px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-4 text-sm text-[#f5efe2] outline-none transition placeholder:text-[rgba(240,235,224,0.34)] focus:border-[rgba(201,168,76,0.3)]"
                        />
                      </ShippingField>

                      <ShippingField label="CVV" required>
                        <input
                          type="password"
                          inputMode="numeric"
                          autoComplete="cc-csc"
                          required
                          maxLength={3}
                          value={cardDetails.cvv}
                          onChange={(event) => setCardDetails((prev) => ({ ...prev, cvv: digitsOnly(event.target.value).slice(0, 3) }))}
                          placeholder="123"
                          className="h-12 w-full rounded-[18px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-4 text-sm text-[#f5efe2] outline-none transition placeholder:text-[rgba(240,235,224,0.34)] focus:border-[rgba(201,168,76,0.3)]"
                        />
                      </ShippingField>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 border-t border-[rgba(255,255,255,0.08)] pt-4">
                      <span className="text-xs uppercase tracking-[0.28em] text-[rgba(240,235,224,0.48)]">Chấp nhận</span>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full border border-[rgba(255,255,255,0.08)] bg-white px-3 py-1 text-[11px] font-semibold tracking-[0.18em] text-[#1f4ed8]">
                          VISA
                        </span>
                        <span className="rounded-full border border-[rgba(255,255,255,0.08)] bg-white px-3 py-1 text-[11px] font-semibold tracking-[0.18em] text-[#d6402f]">
                          MASTER
                        </span>
                        <span className="rounded-full border border-[rgba(255,255,255,0.08)] bg-white px-3 py-1 text-[11px] font-semibold tracking-[0.18em] text-[#0f7bc1]">
                          JCB
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[22px] border border-[rgba(201,168,76,0.12)] bg-[rgba(201,168,76,0.06)] p-4 text-sm text-[rgba(245,239,226,0.78)]">
                    Chọn Visa, Mastercard hoặc JCB nếu bạn muốn thanh toán bằng thẻ quốc tế. Thông tin thẻ sẽ được xử lý trực tiếp khi đặt hàng.
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full bg-[#c9a84c] px-6 text-sm font-semibold text-[#1a1208] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? 'Đang xử lý thanh toán...' : 'Xác nhận thanh toán'}
              </button>
            </section>
          </form>

          <aside className="rounded-[30px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.22)] lg:sticky lg:top-28">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-[rgba(201,168,76,0.72)]">Tóm tắt đơn hàng</p>
                <h2 className="mt-3 text-2xl font-medium tracking-[-0.03em] text-[#f5efe2]">Đơn hàng của bạn</h2>
              </div>
              <span className="rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-[rgba(240,235,224,0.7)]">
                {totalCount} sp
              </span>
            </div>

            <div className="mt-6 space-y-4">
              {cartItems.map((item) => {
                const imageUrl = resolveImageUrl(item.main_image_url);

                return (
                  <div key={item.id} className="flex gap-4 rounded-[22px] border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.02)] p-3">
                    <div className="relative h-18 w-18 shrink-0 overflow-hidden rounded-[18px] bg-[rgba(255,255,255,0.05)]">
                      {imageUrl ? (
                        <img src={imageUrl} alt={item.name_vi} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,rgba(201,168,76,0.28),rgba(255,255,255,0.06))] text-[10px] uppercase tracking-[0.22em] text-[#f5efe2]">
                          {item.quantity}x
                        </div>
                      )}
                      <span className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-white">
                        {item.quantity}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm font-medium leading-5 text-[#f5efe2]">{item.name_vi}</p>
                      <p className="mt-1 text-xs text-[rgba(240,235,224,0.52)]">Đơn giá: {formatVnd(item.price_vnd)} ₫</p>
                      <p className="mt-2 text-xs text-[rgba(240,235,224,0.52)]">SL: {item.quantity}</p>
                    </div>

                    <div className="shrink-0 text-right text-sm font-semibold text-[#f5efe2]">{formatVnd(item.line_total_vnd)} ₫</div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 space-y-4 rounded-[26px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] p-5 text-sm text-[rgba(240,235,224,0.72)]">
              <div className="flex items-center justify-between gap-4">
                <span>Tạm tính</span>
                <span className="font-medium text-[#f5efe2]">{formatVnd(totalAmountVnd)} ₫</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Phí vận chuyển</span>
                <span className="font-medium text-[#f5efe2]">Miễn phí</span>
              </div>
              <div className="h-px bg-[rgba(255,255,255,0.08)]" />
              <div className="flex items-center justify-between gap-4 text-base">
                <span className="font-medium text-[#f5efe2]">Tổng cộng</span>
                <span className="text-2xl font-semibold text-[#c9a84c]">{formatVnd(totalAmountVnd)} ₫</span>
              </div>
              <div className="text-xs text-[rgba(240,235,224,0.52)]">Không tính phí vận chuyển ở bước này.</div>
            </div>

            <div className="mt-5 rounded-[22px] border border-[rgba(16,185,129,0.16)] bg-[rgba(16,185,129,0.06)] p-4 text-sm text-[rgba(236,253,245,0.88)]">
              Thanh toán an toàn. Đơn hàng sẽ được xác nhận sau khi hệ thống xử lý thông tin đặt hàng.
            </div>
          </aside>
        </div>
      </section>

      <div className={`fixed bottom-5 right-5 z-[80] transition ${toastMessage ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0'}`}>
        <div className="rounded-2xl border border-[rgba(201,168,76,0.12)] bg-[rgba(19,17,8,0.98)] px-4 py-3 text-sm text-[#f5efe2] shadow-[0_18px_45px_rgba(0,0,0,0.3)]">
          {toastMessage}
        </div>
      </div>

      <div className="sr-only" aria-live="polite">
        {toastMessage}
      </div>
    </>
  );
}
