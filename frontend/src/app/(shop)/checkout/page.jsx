'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { QRCodeCanvas } from 'qrcode.react';
import { ArrowLeft, Lock, Shield, ChevronRight } from 'lucide-react';
import api from '../../../lib/api';
import useStore from '../../../store/useStore';

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
function formatVnd(value) {
  return Number(value || 0).toLocaleString('vi-VN');
}
function digitsOnly(value) {
  return value.replace(/\D/g, '');
}
function formatCardNumber(value) {
  return digitsOnly(value).slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}
function formatExpiry(value) {
  const cleaned = digitsOnly(value).slice(0, 4);
  return cleaned.length <= 2 ? cleaned : `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
}
function makeTransferContent() {
  return `DAIF${Math.floor(100000 + Math.random() * 900000)}`;
}
function resolveImageUrl(url) {
  if (!url || typeof url !== 'string') return '';
  const t = url.trim();
  if (!t || t.includes('example.com')) return '';
  if (t.startsWith('http://') || t.startsWith('https://')) return t;
  return `http://localhost:5000${t.startsWith('/') ? '' : '/'}${t}`;
}

/* ─────────────────────────────────────────────
   Sub-components
───────────────────────────────────────────── */

/** Label + input wrapper */
function Field({ label, required, hint, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, color: 'rgba(240,235,224,0.7)' }}>
          {label}
          {required && <span style={{ color: '#c9a84c', marginLeft: 3 }}>*</span>}
        </span>
        {hint && <span style={{ fontSize: 11, color: 'rgba(240,235,224,0.35)' }}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}

const inputStyle = {
  height: 48,
  width: '100%',
  borderRadius: 12,
  border: '1px solid rgba(255,255,255,0.1)',
  background: 'rgba(255,255,255,0.04)',
  color: '#f0ebe0',
  fontSize: 14,
  padding: '0 14px',
  outline: 'none',
  transition: 'border-color 0.2s',
  fontFamily: 'var(--font-sans)',
  boxSizing: 'border-box',
};

/** Payment method radio row */
function PaymentRow({ checked, value, icon, title, description, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(value)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        width: '100%',
        padding: '14px 16px',
        borderRadius: 14,
        border: `1px solid ${checked ? 'rgba(201,168,76,0.4)' : 'rgba(255,255,255,0.08)'}`,
        background: checked ? 'rgba(201,168,76,0.07)' : 'rgba(255,255,255,0.02)',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.2s',
      }}
    >
      <span style={{
        width: 40, height: 40, borderRadius: 12, flexShrink: 0,
        background: icon.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18,
      }}>
        {icon.emoji}
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', fontSize: 14, color: '#f0ebe0', fontWeight: 500 }}>{title}</span>
        <span style={{ display: 'block', fontSize: 12, color: 'rgba(240,235,224,0.45)', marginTop: 2 }}>{description}</span>
      </span>
      <span style={{
        width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
        border: `2px solid ${checked ? '#c9a84c' : 'rgba(255,255,255,0.25)'}`,
        background: checked ? '#c9a84c' : 'transparent',
        transition: 'all 0.2s',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {checked && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#1a1208' }} />}
      </span>
    </button>
  );
}

/* ─────────────────────────────────────────────
   Main Page
───────────────────────────────────────────── */
export default function CheckoutPage() {
  const router = useRouter();
  const setCartCount = useStore((s) => s.setCartCount);

  const [isMounted,     setIsMounted]     = useState(false);
  const [cartItems,     setCartItems]     = useState([]);
  const [totalVnd,      setTotalVnd]      = useState(0);
  const [isLoading,     setIsLoading]     = useState(true);
  const [isSubmitting,  setIsSubmitting]  = useState(false);
  const [errorMsg,      setErrorMsg]      = useState('');
  const [toast,         setToast]         = useState('');
  const [payMethod,     setPayMethod]     = useState('momo');
  const [transferCode,  setTransferCode]  = useState(makeTransferContent);
  const [shipping, setShipping] = useState({
    fullName: '', phone: '', email: '',
    streetAddress: '', district: '', ward: '', city: '', note: '',
  });
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvv: '' });

  useEffect(() => { setIsMounted(true); }, []);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        setIsLoading(true);
        const res = await api.get('/cart');
        const items = res.data?.data?.items || [];
        const total = res.data?.data?.total_amount_vnd || 0;
        if (!active) return;
        if (items.length === 0) { router.replace('/cart'); return; }
        setCartItems(items);
        setTotalVnd(total);
      } catch (e) {
        if (!active) return;
        if (e?.response?.status === 401) { router.replace('/login'); return; }
        setErrorMsg('Không thể tải thông tin thanh toán.');
      } finally {
        if (active) setIsLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [router]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (['momo', 'zalopay', 'bank'].includes(payMethod))
      setTransferCode(makeTransferContent());
  }, [payMethod]);

  const totalCount = useMemo(
    () => cartItems.reduce((s, i) => s + Number(i.quantity || 0), 0),
    [cartItems]
  );
  const shippingFee = 0; // free shipping per original code
  const grandTotal  = totalVnd + shippingFee;

  const isQrMethod = ['momo', 'zalopay', 'bank'].includes(payMethod);
  const isCardMethod = payMethod === 'card';

  async function handleSubmit(e) {
    e.preventDefault();
    const { fullName, phone, streetAddress, district, ward, city } = shipping;
    if (!fullName.trim() || !phone.trim() || !streetAddress.trim() || !district.trim() || !ward.trim() || !city.trim()) {
      setErrorMsg('Vui lòng hoàn tất thông tin giao hàng.');
      return;
    }
    try {
      setIsSubmitting(true);
      setErrorMsg('');
      await new Promise(r => setTimeout(r, 900 + Math.random() * 600));
      const methodLabel = payMethod === 'card' ? 'Visa' : payMethod === 'momo' ? 'MoMo' : payMethod === 'zalopay' ? 'ZaloPay' : 'COD';
      const payload = {
        items: cartItems.map(i => ({ product_id: i.product_id, quantity: Number(i.quantity || 0) })),
        payment_method: methodLabel,
        shipping_address: [
          `Họ tên: ${fullName.trim()}`, `SĐT: ${phone.trim()}`,
          shipping.email.trim() ? `Email: ${shipping.email.trim()}` : null,
          `Địa chỉ: ${streetAddress.trim()}, ${ward.trim()}, ${district.trim()}, ${city.trim()}`,
          shipping.note.trim() ? `Ghi chú: ${shipping.note.trim()}` : null,
        ].filter(Boolean).join(' | '),
      };
      const res = await api.post('/orders', payload);
      if (res.data?.success) {
        setCartCount(0);
        setToast('Đặt hàng thành công! 🎉');
        setTimeout(() => router.replace('/me'), 1400);
      }
    } catch (e) {
      if (e?.response?.status === 401) { router.replace('/login'); return; }
      setErrorMsg(e?.response?.data?.message || 'Đặt hàng thất bại.');
    } finally {
      setIsSubmitting(false);
    }
  }

  /* ── Loading / Error states ── */
  if (!isMounted || isLoading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <p style={{ fontSize: 14, color: 'rgba(240,235,224,0.5)' }}>Đang tải…</p>
    </div>
  );

  if (errorMsg && cartItems.length === 0) return (
    <div style={{ maxWidth: 600, margin: '60px auto', padding: '0 24px' }}>
      <p style={{ fontSize: 14, color: 'rgba(240,235,224,0.7)', padding: '20px 24px', borderRadius: 14, border: '1px solid rgba(201,168,76,0.2)', background: 'rgba(201,168,76,0.05)' }}>{errorMsg}</p>
    </div>
  );

  /* ── Styles shared ── */
  const sectionStyle = {
    borderRadius: 20,
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.025)',
    padding: '28px 28px',
    boxShadow: '0 8px 40px rgba(0,0,0,0.25)',
  };

  const sectionTitleStyle = {
    fontSize: 20,
    fontWeight: 500,
    color: '#f0ebe0',
    margin: '0 0 20px',
    fontFamily: 'var(--font-sans)',
  };

  const sectionEyebrowStyle = {
    fontSize: 10,
    letterSpacing: '0.32em',
    textTransform: 'uppercase',
    color: 'rgba(201,168,76,0.7)',
    marginBottom: 6,
  };

  return (
    <>
      {/* ── Page shell ── */}
      <div style={{ minHeight: '100vh', background: '#0c0b09', fontFamily: 'var(--font-sans)' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '40px 24px 80px' }}>

          {/* Back link */}
          <button
            type="button"
            onClick={() => router.back()}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 13, color: 'rgba(240,235,224,0.45)',
              marginBottom: 32, cursor: 'pointer',
              background: 'none', border: 'none', padding: 0,
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#c9a84c'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(240,235,224,0.45)'}
          >
            <ArrowLeft size={14} />
            Quay lại giỏ hàng
          </button>

          {/* Page title */}
          <div style={{ marginBottom: 36 }}>
            <p style={sectionEyebrowStyle}>Checkout</p>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(32px,5vw,48px)',
              fontWeight: 300,
              color: '#f0ebe0',
              margin: '0 0 8px',
              letterSpacing: '-0.02em',
            }}>
              Thanh toán
            </h1>
            <p style={{ fontSize: 13, color: 'rgba(240,235,224,0.45)', maxWidth: 480 }}>
              Hoàn tất thông tin giao hàng và chọn phương thức thanh toán để xác nhận đơn hàng.
            </p>
          </div>

          {/* Error banner */}
          {errorMsg && (
            <div style={{
              padding: '12px 16px', borderRadius: 12, marginBottom: 20,
              border: '1px solid rgba(239,68,68,0.25)',
              background: 'rgba(239,68,68,0.07)',
              fontSize: 13, color: 'rgba(254,202,202,0.85)',
            }}>
              {errorMsg}
            </div>
          )}

          {/* ── Two-column layout ── */}
          <form onSubmit={handleSubmit}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0,1fr) 360px',
              gap: 28,
              alignItems: 'start',
            }}>

              {/* ═══════════════════ LEFT COLUMN ═══════════════════ */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                {/* ── Shipping info ── */}
                <section style={sectionStyle}>
                  <p style={sectionEyebrowStyle}>Thông tin giao hàng</p>
                  <h2 style={sectionTitleStyle}>Địa chỉ nhận hàng</h2>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* Name */}
                    <Field label="Họ và tên" required>
                      <input
                        type="text" required
                        value={shipping.fullName}
                        onChange={e => setShipping(p => ({ ...p, fullName: e.target.value }))}
                        placeholder="Nguyễn Văn A"
                        style={inputStyle}
                        onFocus={e => e.target.style.borderColor = 'rgba(201,168,76,0.4)'}
                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                      />
                    </Field>

                    {/* Phone + Email */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                      <Field label="Số điện thoại" required>
                        <input
                          type="tel" required
                          value={shipping.phone}
                          onChange={e => setShipping(p => ({ ...p, phone: e.target.value }))}
                          placeholder="0123 456 789"
                          style={inputStyle}
                          onFocus={e => e.target.style.borderColor = 'rgba(201,168,76,0.4)'}
                          onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                        />
                      </Field>
                      <Field label="Email">
                        <input
                          type="email"
                          value={shipping.email}
                          onChange={e => setShipping(p => ({ ...p, email: e.target.value }))}
                          placeholder="example@email.com"
                          style={inputStyle}
                          onFocus={e => e.target.style.borderColor = 'rgba(201,168,76,0.4)'}
                          onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                        />
                      </Field>
                    </div>

                    {/* Street address */}
                    <Field label="Địa chỉ" required hint="Số nhà, tên đường">
                      <input
                        type="text" required
                        value={shipping.streetAddress}
                        onChange={e => setShipping(p => ({ ...p, streetAddress: e.target.value }))}
                        placeholder="Số nhà, tên đường"
                        style={inputStyle}
                        onFocus={e => e.target.style.borderColor = 'rgba(201,168,76,0.4)'}
                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                      />
                    </Field>

                    {/* City / District / Ward */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                      {[
                        { key: 'city',     label: 'Tỉnh/Thành phố', ph: 'TP. Hồ Chí Minh' },
                        { key: 'district', label: 'Quận/Huyện',     ph: 'Quận 1' },
                        { key: 'ward',     label: 'Phường/Xã',      ph: 'Phường Bến Nghé' },
                      ].map(({ key, label, ph }) => (
                        <Field key={key} label={label} required>
                          <input
                            type="text" required
                            value={shipping[key]}
                            onChange={e => setShipping(p => ({ ...p, [key]: e.target.value }))}
                            placeholder={ph}
                            style={inputStyle}
                            onFocus={e => e.target.style.borderColor = 'rgba(201,168,76,0.4)'}
                            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                          />
                        </Field>
                      ))}
                    </div>

                    {/* Note */}
                    <Field label="Ghi chú đơn hàng" hint="Tùy chọn">
                      <textarea
                        rows={3}
                        value={shipping.note}
                        onChange={e => setShipping(p => ({ ...p, note: e.target.value }))}
                        placeholder="Ghi chú về đơn hàng, ví dụ: thời gian hay chỉ dẫn địa điểm giao hàng chi tiết hơn"
                        style={{
                          ...inputStyle, height: 'auto', padding: '12px 14px',
                          resize: 'vertical', lineHeight: 1.6,
                        }}
                        onFocus={e => e.target.style.borderColor = 'rgba(201,168,76,0.4)'}
                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                      />
                    </Field>
                  </div>
                </section>

                {/* ── Payment method ── */}
                <section style={sectionStyle}>
                  <p style={sectionEyebrowStyle}>Phương thức thanh toán</p>
                  <h2 style={sectionTitleStyle}>Chọn hình thức thanh toán</h2>

                  {/* Domestic */}
                  <p style={{ fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.55)', marginBottom: 10 }}>
                    Thanh toán nội địa
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                    <PaymentRow checked={payMethod === 'momo'} value="momo" onChange={setPayMethod}
                      icon={{ bg: 'rgba(200,61,141,0.18)', emoji: '💜' }}
                      title="MoMo" description="Ví điện tử MoMo, quét QR để xác nhận giao dịch" />
                    <PaymentRow checked={payMethod === 'zalopay'} value="zalopay" onChange={setPayMethod}
                      icon={{ bg: 'rgba(0,104,255,0.16)', emoji: '💙' }}
                      title="ZaloPay" description="Ví điện tử ZaloPay, dùng cùng quy trình quét mã" />
                    <PaymentRow checked={payMethod === 'bank'} value="bank" onChange={setPayMethod}
                      icon={{ bg: 'rgba(22,163,74,0.16)', emoji: '🏦' }}
                      title="Chuyển khoản ngân hàng" description="Hiển thị QR, thông tin tài khoản và nội dung chuyển khoản" />
                  </div>

                  {/* International */}
                  <p style={{ fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.55)', marginBottom: 10 }}>
                    Thanh toán quốc tế
                  </p>
                  <PaymentRow checked={payMethod === 'card'} value="card" onChange={setPayMethod}
                    icon={{ bg: 'rgba(201,168,76,0.15)', emoji: '💳' }}
                    title="Thẻ tín dụng/ghi nợ" description="Visa, Mastercard, JCB" />

                  {/* ── QR block ── */}
                  {isQrMethod && (
                    <div style={{
                      marginTop: 20,
                      borderRadius: 16,
                      border: '1px solid rgba(201,168,76,0.18)',
                      background: 'rgba(201,168,76,0.04)',
                      overflow: 'hidden',
                    }}>
                      {/* QR header */}
                      <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(201,168,76,0.12)' }}>
                        <p style={{ fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.7)', margin: 0 }}>
                          {payMethod === 'momo' ? 'Quét mã MoMo' : payMethod === 'zalopay' ? 'Quét mã ZaloPay' : 'Quét mã ngân hàng'}
                        </p>
                      </div>
                      <div style={{ padding: '20px', display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                        {/* QR code */}
                        <div style={{
                          background: '#fff', borderRadius: 16, padding: 12,
                          boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
                          flexShrink: 0,
                        }}>
                          <QRCodeCanvas
                            value={`${payMethod.toUpperCase()}|${transferCode}|${formatVnd(totalVnd)}`}
                            size={160} includeMargin level="M"
                            fgColor="#111111" bgColor="#ffffff"
                          />
                          <p style={{ margin: '8px 0 0', textAlign: 'center', fontSize: 11, color: '#888', letterSpacing: '0.05em' }}>
                            Quét mã QR để thanh toán qua {payMethod === 'momo' ? 'MoMo' : payMethod === 'zalopay' ? 'ZaloPay' : 'ngân hàng'}
                          </p>
                        </div>

                        {/* Transfer info */}
                        <div style={{ flex: 1, minWidth: 200, display: 'flex', flexDirection: 'column', gap: 12 }}>
                          <div style={{
                            borderRadius: 12,
                            border: '1px solid rgba(255,255,255,0.08)',
                            background: 'rgba(255,255,255,0.03)',
                            overflow: 'hidden',
                          }}>
                            <p style={{
                              fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase',
                              color: 'rgba(201,168,76,0.6)',
                              padding: '10px 14px 0', margin: 0,
                            }}>
                              Thông tin chuyển khoản
                            </p>
                            {[
                              { label: 'Ngân hàng', value: 'Vietcombank' },
                              { label: 'Số tài khoản', value: '0123456789', mono: true },
                              { label: 'Chủ tài khoản', value: 'CONG TY DAIF CENTRALTASTE' },
                              { label: 'Số tiền', value: `${formatVnd(totalVnd)} ₫`, gold: true },
                            ].map(({ label, value, mono, gold }) => (
                              <div key={label} style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '8px 14px',
                                borderTop: '1px solid rgba(255,255,255,0.05)',
                                fontSize: 13,
                              }}>
                                <span style={{ color: 'rgba(240,235,224,0.5)' }}>{label}</span>
                                <span style={{
                                  color: gold ? '#c9a84c' : '#f0ebe0',
                                  fontWeight: gold ? 600 : 500,
                                  fontFamily: mono ? 'monospace' : 'inherit',
                                }}>
                                  {value}
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* Transfer content */}
                          <div style={{
                            borderRadius: 12,
                            border: '1px solid rgba(201,168,76,0.22)',
                            background: 'rgba(201,168,76,0.07)',
                            padding: '12px 14px',
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                              <span style={{ fontSize: 12, color: 'rgba(240,235,224,0.6)' }}>Nội dung:</span>
                              <code style={{
                                fontSize: 15, fontWeight: 700, letterSpacing: '0.15em',
                                color: '#c9a84c',
                                background: 'rgba(0,0,0,0.2)', borderRadius: 6,
                                padding: '2px 10px',
                              }}>
                                {transferCode}
                              </code>
                            </div>
                            <p style={{ fontSize: 11, color: 'rgba(240,235,224,0.45)', margin: 0, lineHeight: 1.6 }}>
                              ⚠️ Vui lòng nhập chính xác nội dung chuyển khoản để hệ thống đối soát đơn hàng.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── Card form ── */}
                  {isCardMethod && (
                    <div style={{
                      marginTop: 20, borderRadius: 16,
                      border: '1px solid rgba(201,168,76,0.18)',
                      background: 'rgba(255,255,255,0.02)',
                      padding: '20px',
                      display: 'flex', flexDirection: 'column', gap: 14,
                    }}>
                      {/* Card brand selector */}
                      <div style={{ display: 'flex', gap: 8 }}>
                        {[
                          { v: 'visa',       label: 'VISA',   color: '#1f4ed8', bg: 'rgba(31,78,216,0.12)' },
                          { v: 'mastercard', label: 'MASTER', color: '#d12f27', bg: 'rgba(209,47,39,0.12)' },
                          { v: 'jcb',        label: 'JCB',    color: '#0f7bc1', bg: 'rgba(15,123,193,0.12)' },
                        ].map(b => (
                          <span key={b.v} style={{
                            padding: '4px 14px', borderRadius: 999, fontSize: 11,
                            fontWeight: 700, letterSpacing: '0.18em',
                            color: b.color, background: b.bg,
                            border: `1px solid ${b.color}33`,
                          }}>
                            {b.label}
                          </span>
                        ))}
                      </div>

                      <Field label="Số thẻ" required hint="xxxx xxxx xxxx xxxx">
                        <input type="text" inputMode="numeric"
                          value={card.number}
                          onChange={e => setCard(p => ({ ...p, number: formatCardNumber(e.target.value) }))}
                          placeholder="1234 5678 9012 3456"
                          style={inputStyle}
                          onFocus={e => e.target.style.borderColor = 'rgba(201,168,76,0.4)'}
                          onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                        />
                      </Field>
                      <Field label="Tên chủ thẻ" required hint="VIẾT IN HOA">
                        <input type="text"
                          value={card.name}
                          onChange={e => setCard(p => ({ ...p, name: e.target.value.toUpperCase() }))}
                          placeholder="NGUYEN VAN A"
                          style={{ ...inputStyle, textTransform: 'uppercase' }}
                          onFocus={e => e.target.style.borderColor = 'rgba(201,168,76,0.4)'}
                          onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                        />
                      </Field>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                        <Field label="Ngày hết hạn" required hint="MM/YY">
                          <input type="text" inputMode="numeric" maxLength={5}
                            value={card.expiry}
                            onChange={e => setCard(p => ({ ...p, expiry: formatExpiry(e.target.value) }))}
                            placeholder="MM/YY"
                            style={inputStyle}
                            onFocus={e => e.target.style.borderColor = 'rgba(201,168,76,0.4)'}
                            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                          />
                        </Field>
                        <Field label="CVV" required>
                          <input type="password" inputMode="numeric" maxLength={3}
                            value={card.cvv}
                            onChange={e => setCard(p => ({ ...p, cvv: digitsOnly(e.target.value).slice(0, 3) }))}
                            placeholder="123"
                            style={inputStyle}
                            onFocus={e => e.target.style.borderColor = 'rgba(201,168,76,0.4)'}
                            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                          />
                        </Field>
                      </div>
                    </div>
                  )}
                </section>
              </div>

              {/* ═══════════════════ RIGHT SIDEBAR ═══════════════════ */}
              <aside style={{
                position: 'sticky', top: 88,
                borderRadius: 20,
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.025)',
                padding: '24px',
                boxShadow: '0 8px 40px rgba(0,0,0,0.25)',
              }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                  <div>
                    <p style={{ ...sectionEyebrowStyle, marginBottom: 4 }}>Tóm tắt đơn hàng</p>
                    <h2 style={{ fontSize: 18, fontWeight: 500, color: '#f0ebe0', margin: 0 }}>Đơn hàng của bạn</h2>
                  </div>
                  <span style={{
                    fontSize: 11, letterSpacing: '0.2em',
                    color: 'rgba(240,235,224,0.5)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 999, padding: '2px 10px',
                  }}>
                    {totalCount} sp
                  </span>
                </div>

                {/* Items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                  {cartItems.map(item => {
                    const img = resolveImageUrl(item.main_image_url);
                    return (
                      <div key={item.id} style={{
                        display: 'flex', gap: 12,
                        padding: '10px',
                        borderRadius: 14,
                        border: '1px solid rgba(255,255,255,0.06)',
                        background: 'rgba(255,255,255,0.02)',
                      }}>
                        {/* Image */}
                        <div style={{
                          width: 56, height: 56, borderRadius: 10,
                          background: 'rgba(201,168,76,0.1)',
                          flexShrink: 0, overflow: 'hidden', position: 'relative',
                        }}>
                          {img
                            ? <img src={img} alt={item.name_vi} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'rgba(201,168,76,0.5)' }}>
                                {item.quantity}x
                              </div>
                          }
                          <span style={{
                            position: 'absolute', top: -4, right: -4,
                            width: 18, height: 18, borderRadius: '50%',
                            background: '#c9a84c', color: '#1a1208',
                            fontSize: 9, fontWeight: 700,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            {item.quantity}
                          </span>
                        </div>
                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 13, color: '#f0ebe0', fontWeight: 500, margin: '0 0 3px', lineHeight: 1.3 }}>
                            {item.name_vi}
                          </p>
                          <p style={{ fontSize: 11, color: 'rgba(240,235,224,0.4)', margin: 0 }}>
                            {formatVnd(item.price_vnd)} đ × {item.quantity}
                          </p>
                        </div>
                        <span style={{ fontSize: 13, color: '#f0ebe0', fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 }}>
                          {formatVnd(item.line_total_vnd)} đ
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Price breakdown */}
                <div style={{
                  borderRadius: 14,
                  border: '1px solid rgba(255,255,255,0.07)',
                  background: 'rgba(255,255,255,0.02)',
                  padding: '14px 16px',
                  marginBottom: 16,
                }}>
                  {[
                    { label: 'Tạm tính', value: `${formatVnd(totalVnd)} đ` },
                    { label: 'Phí vận chuyển', value: shippingFee > 0 ? `${formatVnd(shippingFee)} đ` : 'Miễn phí' },
                  ].map(({ label, value }) => (
                    <div key={label} style={{
                      display: 'flex', justifyContent: 'space-between',
                      fontSize: 13, color: 'rgba(240,235,224,0.6)',
                      marginBottom: 8,
                    }}>
                      <span>{label}</span>
                      <span style={{ color: '#f0ebe0', fontWeight: 500 }}>{value}</span>
                    </div>
                  ))}
                  <div style={{
                    borderTop: '1px solid rgba(255,255,255,0.08)',
                    paddingTop: 10, marginTop: 4,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                  }}>
                    <span style={{ fontSize: 14, color: '#f0ebe0', fontWeight: 500 }}>Tổng cộng</span>
                    <span style={{ fontSize: 22, fontWeight: 700, color: '#c9a84c', fontFamily: 'var(--font-sans)' }}>
                      {formatVnd(grandTotal)} đ
                    </span>
                  </div>
                </div>

                {/* CTA */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    width: '100%', height: 50, borderRadius: 999,
                    background: isSubmitting ? 'rgba(201,168,76,0.6)' : '#c9a84c',
                    color: '#1a1208',
                    fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                    border: 'none', cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    transition: 'filter 0.2s',
                    marginBottom: 10,
                  }}
                  onMouseEnter={e => { if (!isSubmitting) e.currentTarget.style.filter = 'brightness(1.1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)'; }}
                >
                  <Lock size={14} />
                  {isSubmitting ? 'Đang xử lý…' : 'Xác nhận thanh toán'}
                </button>

                {/* Security note */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  padding: '10px 14px', borderRadius: 12,
                  border: '1px solid rgba(34,197,94,0.18)',
                  background: 'rgba(34,197,94,0.06)',
                  fontSize: 12, color: 'rgba(134,239,172,0.8)',
                }}>
                  <Shield size={13} style={{ flexShrink: 0 }} />
                  Thanh toán được bảo mật và mã hóa
                </div>
              </aside>

            </div>
          </form>
        </div>
      </div>

      {/* ── Toast ── */}
      <div style={{
        position: 'fixed', bottom: 24, right: 24, zIndex: 90,
        borderRadius: 14,
        border: '1px solid rgba(201,168,76,0.2)',
        background: 'rgba(19,17,8,0.97)',
        padding: '12px 20px',
        fontSize: 13, color: '#f0ebe0',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        transition: 'opacity 0.3s, transform 0.3s',
        opacity: toast ? 1 : 0,
        transform: toast ? 'translateY(0)' : 'translateY(8px)',
        pointerEvents: toast ? 'auto' : 'none',
      }}>
        {toast}
      </div>
      <div className="sr-only" aria-live="polite">{toast}</div>
    </>
  );
}