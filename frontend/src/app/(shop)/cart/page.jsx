'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Package, ShieldCheck, Tag, Trash2, Sparkles, Clock, RefreshCw } from 'lucide-react';
import api from '../../../lib/api';
import useStore from '../../../store/useStore';

function formatVnd(value) {
  return Number(value || 0).toLocaleString('vi-VN');
}

function resolveImageUrl(imageUrl) {
  if (!imageUrl) return '';
  const n = String(imageUrl);
  if (n.includes('example.com')) return '';
  return n;
}

/* ─── Single cart item row ─────────────────────────────── */
function CartItem({ item, selected, onToggle, onIncrement, onDecrement, onDelete, isUpdating }) {
  const imageUrl = resolveImageUrl(item.main_image_url);
  const [imgErr, setImgErr] = useState(false);

  return (
    <div style={{
      display: 'flex',
      gap: 0,
      borderRadius: 20,
      border: `1px solid ${selected ? 'rgba(201,168,76,0.35)' : 'rgba(255,255,255,0.07)'}`,
      background: selected ? 'rgba(201,168,76,0.04)' : 'rgba(255,255,255,0.02)',
      overflow: 'hidden',
      transition: 'border-color 0.25s, background 0.25s, box-shadow 0.25s',
      boxShadow: selected ? '0 0 0 1px rgba(201,168,76,0.1)' : 'none',
      opacity: isUpdating ? 0.6 : 1,
    }}>
      {/* Checkbox strip */}
      <div
        onClick={() => onToggle(item.id)}
        style={{
          width: 48, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', borderRight: '1px solid rgba(255,255,255,0.06)',
          background: selected ? 'rgba(201,168,76,0.06)' : 'transparent',
          transition: 'background 0.2s',
        }}
      >
        <span style={{
          width: 20, height: 20, borderRadius: 6,
          border: `1.5px solid ${selected ? '#c9a84c' : 'rgba(255,255,255,0.2)'}`,
          background: selected ? '#c9a84c' : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s', flexShrink: 0,
        }}>
          {selected && (
            <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
              <path d="M1 4L4 7L10 1" stroke="#1a1208" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </span>
      </div>

      {/* Image */}
      <div style={{
        width: 110, height: 110, flexShrink: 0,
        background: 'linear-gradient(135deg,#1e1a10,#2a2318)',
        position: 'relative', overflow: 'hidden',
      }}>
        {imageUrl && !imgErr
          ? <img
              src={imageUrl}
              alt={item.name_vi}
              onError={() => setImgErr(true)}
              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
            />
          : <div style={{
              width: '100%', height: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'rgba(201,168,76,0.3)',
            }}>
              <Package size={28} />
            </div>
        }
        {/* Category badge */}
        <span style={{
          position: 'absolute', bottom: 6, left: 6,
          fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase',
          background: 'rgba(12,11,9,0.8)', color: '#c9a84c',
          padding: '2px 7px', borderRadius: 999,
          border: '1px solid rgba(201,168,76,0.25)',
        }}>
          {item.category_name_vi || item.category_slug || 'Sản phẩm'}
        </span>
      </div>

      {/* Details */}
      <div style={{
        flex: 1, minWidth: 0,
        padding: '16px 16px 16px 18px',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
          <div style={{ minWidth: 0 }}>
            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 17, fontWeight: 400, color: '#f0ebe0',
              margin: '0 0 5px', lineHeight: 1.25,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {item.name_vi}
            </h3>
            <p style={{ fontSize: 12, color: 'rgba(240,235,224,0.45)', margin: 0 }}>
              {formatVnd(item.price_vnd)} đ / sản phẩm
            </p>
          </div>
          <button
            type="button"
            onClick={() => onDelete(item.id)}
            style={{
              width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
              border: '1px solid rgba(255,255,255,0.08)', background: 'transparent',
              color: 'rgba(240,235,224,0.35)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)'; e.currentTarget.style.color = 'rgba(252,165,165,0.8)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(240,235,224,0.35)'; }}
            aria-label="Xóa sản phẩm"
          >
            <Trash2 size={13} />
          </button>
        </div>

        {/* Qty + price row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
          {/* Qty stepper */}
          <div style={{
            display: 'inline-flex', alignItems: 'center',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 999, overflow: 'hidden',
            background: 'rgba(255,255,255,0.02)',
          }}>
            {[
              { label: '−', action: () => onDecrement(item) },
              null,
              { label: '+', action: () => onIncrement(item) },
            ].map((btn, i) =>
              btn === null
                ? <span key="qty" style={{
                    minWidth: 44, textAlign: 'center',
                    fontSize: 14, fontWeight: 500, color: '#f0ebe0',
                  }}>
                    {item.quantity}
                  </span>
                : <button
                    key={i}
                    type="button"
                    onClick={btn.action}
                    disabled={isUpdating}
                    style={{
                      width: 36, height: 36,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'transparent', border: 'none',
                      color: 'rgba(240,235,224,0.7)', cursor: 'pointer',
                      fontSize: 16, transition: 'background 0.15s, color 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,168,76,0.1)'; e.currentTarget.style.color = '#c9a84c'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(240,235,224,0.7)'; }}
                  >
                    {btn.label}
                  </button>
            )}
          </div>

          {/* Line total */}
          <span style={{ fontSize: 17, fontWeight: 600, color: '#c9a84c', fontFamily: 'var(--font-sans)' }}>
            {formatVnd(item.line_total_vnd)} đ
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ────────────────────────────────────────── */
export default function CartPage() {
  const router = useRouter();
  const setCartCount = useStore((s) => s.setCartCount);

  const [items,        setItems]        = useState([]);
  const [totalVnd,     setTotalVnd]     = useState(0);
  const [isLoading,    setIsLoading]    = useState(true);
  const [errorMsg,     setErrorMsg]     = useState('');
  const [updatingId,   setUpdatingId]   = useState(null);
  const [selected,     setSelected]     = useState(new Set());   // selected item ids
  const [coupon,       setCoupon]       = useState('');

  async function loadCart() {
    try {
      setIsLoading(true);
      setErrorMsg('');
      const res = await api.get('/cart');
      const cartItems = res.data?.data?.items || [];
      const total = res.data?.data?.total_amount_vnd || 0;
      setItems(cartItems);
      setTotalVnd(total);
      setCartCount(cartItems.reduce((s, i) => s + Number(i.quantity || 0), 0));
      // Auto-select all on first load
      setSelected(new Set(cartItems.map(i => i.id)));
    } catch (e) {
      if (e?.response?.status === 401) { router.push('/login'); return; }
      setErrorMsg('Không thể tải giỏ hàng.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { loadCart(); }, []);

  async function mutateItem(cartItemId, fn) {
    try {
      setUpdatingId(cartItemId);
      await fn();
      await loadCart();
    } catch (e) {
      if (e?.response?.status === 401) router.push('/login');
    } finally {
      setUpdatingId(null);
    }
  }

  const handleIncrement = (item) =>
    mutateItem(item.id, () => api.put(`/cart/${item.id}`, { quantity: Number(item.quantity) + 1 }));
  const handleDecrement = (item) =>
    mutateItem(item.id, () => api.put(`/cart/${item.id}`, { quantity: Number(item.quantity) - 1 }));
  const handleDelete = (id) =>
    mutateItem(id, () => api.delete(`/cart/${id}`));

  function toggleSelect(id) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }
  function toggleAll() {
    setSelected(prev =>
      prev.size === items.length ? new Set() : new Set(items.map(i => i.id))
    );
  }

  // Selected subtotal
  const selectedItems = useMemo(
    () => items.filter(i => selected.has(i.id)),
    [items, selected]
  );
  const selectedTotal = useMemo(
    () => selectedItems.reduce((s, i) => s + Number(i.line_total_vnd || 0), 0),
    [selectedItems]
  );
  const allSelected = items.length > 0 && selected.size === items.length;

  /* ── Build checkout query ── */
  function buildCheckoutUrl() {
    if (selectedItems.length === 0) return '/checkout';
    const ids = selectedItems.map(i => i.id).join(',');
    return `/checkout?items=${ids}`;
  }

  /* ── Loading / Error / Empty ── */
  const centeredShell = {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    minHeight: '60vh', padding: '0 24px',
  };

  if (isLoading) return (
    <div style={centeredShell}>
      <p style={{ fontSize: 14, color: 'rgba(240,235,224,0.4)', letterSpacing: '0.06em' }}>
        Đang tải giỏ hàng…
      </p>
    </div>
  );

  if (errorMsg) return (
    <div style={{ maxWidth: 640, margin: '60px auto', padding: '0 24px' }}>
      <div style={{
        borderRadius: 16, border: '1px dashed rgba(201,168,76,0.2)',
        background: 'rgba(201,168,76,0.04)', padding: '24px',
        fontSize: 14, color: 'rgba(240,235,224,0.6)',
      }}>
        {errorMsg}
      </div>
    </div>
  );

  if (items.length === 0) return (
    <div style={{ ...centeredShell, minHeight: '70vh' }}>
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          border: '1px solid rgba(201,168,76,0.2)',
          background: 'rgba(201,168,76,0.05)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'rgba(201,168,76,0.4)',
        }}>
          <Package size={30} />
        </div>
        <div>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 300, color: '#f0ebe0', margin: '0 0 8px' }}>
            Giỏ hàng trống
          </p>
          <p style={{ fontSize: 13, color: 'rgba(240,235,224,0.4)' }}>
            Khám phá bộ sưu tập đặc sản miền Trung tinh tuyển của chúng tôi
          </p>
        </div>
        <Link href="/products" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          height: 46, padding: '0 28px', borderRadius: 999,
          background: '#c9a84c', color: '#1a1208',
          fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase',
          textDecoration: 'none', transition: 'filter 0.2s',
        }}>
          Khám phá sản phẩm
        </Link>
      </div>
    </div>
  );

  /* ── Styles ── */
  const card = {
    borderRadius: 20,
    border: '1px solid rgba(255,255,255,0.07)',
    background: 'rgba(255,255,255,0.02)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
  };

  return (
    <div style={{ background: '#0c0b09', color: '#f0ebe0', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* Back link */}
        <Link href="/products" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontSize: 12, color: 'rgba(240,235,224,0.4)', letterSpacing: '0.08em',
          textDecoration: 'none', marginBottom: 28, transition: 'color 0.2s',
        }}
          onMouseEnter={e => e.currentTarget.style.color = '#c9a84c'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(240,235,224,0.4)'}
        >
          <ArrowLeft size={14} />
          Tiếp tục mua sắm
        </Link>

        {/* Page heading */}
        <div style={{ marginBottom: 32 }}>
          <p style={{
            fontSize: 10, letterSpacing: '0.32em', textTransform: 'uppercase',
            color: 'rgba(201,168,76,0.65)', marginBottom: 8,
          }}>
            Giỏ hàng
          </p>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(28px,4vw,40px)',
            fontWeight: 300, color: '#f0ebe0', margin: '0 0 6px',
            letterSpacing: '-0.02em',
          }}>
            Giỏ hàng của bạn
          </h1>
          <p style={{ fontSize: 13, color: 'rgba(240,235,224,0.4)' }}>
            {items.length} sản phẩm trong giỏ hàng
          </p>
        </div>

        {/* Two-column layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1.65fr) 360px',
          gap: 28, alignItems: 'start',
        }}>

          {/* ═══ LEFT: Items ════════════════════════════════════ */}
          <div>
            {/* Select-all bar */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 16px', marginBottom: 12,
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.06)',
              background: 'rgba(255,255,255,0.015)',
            }}>
              <span
                onClick={toggleAll}
                style={{
                  width: 20, height: 20, borderRadius: 6,
                  border: `1.5px solid ${allSelected ? '#c9a84c' : 'rgba(255,255,255,0.2)'}`,
                  background: allSelected ? '#c9a84c' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s',
                }}
              >
                {allSelected && (
                  <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                    <path d="M1 4L4 7L10 1" stroke="#1a1208" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </span>
              <span style={{ fontSize: 12, color: 'rgba(240,235,224,0.5)', letterSpacing: '0.06em' }}>
                {allSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
              </span>
              {selected.size > 0 && selected.size < items.length && (
                <span style={{
                  marginLeft: 'auto', fontSize: 11,
                  color: 'rgba(201,168,76,0.65)',
                  letterSpacing: '0.06em',
                }}>
                  Đã chọn {selected.size}/{items.length}
                </span>
              )}
            </div>

            {/* Item list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {items.map(item => (
                <CartItem
                  key={item.id}
                  item={item}
                  selected={selected.has(item.id)}
                  onToggle={toggleSelect}
                  isUpdating={updatingId === item.id}
                  onIncrement={handleIncrement}
                  onDecrement={handleDecrement}
                  onDelete={handleDelete}
                />
              ))}
            </div>

            {/* Luxury note */}
            <div style={{
              marginTop: 20, padding: '16px 20px',
              borderRadius: 14,
              border: '1px solid rgba(201,168,76,0.12)',
              background: 'rgba(201,168,76,0.04)',
              display: 'flex', gap: 12, alignItems: 'flex-start',
            }}>
              <Sparkles size={15} style={{ color: '#c9a84c', flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: 12, color: 'rgba(240,235,224,0.5)', margin: 0, lineHeight: 1.7 }}>
                Mỗi sản phẩm CENTRALTASTE được chọn lọc tỉ mỉ từ các làng nghề truyền thống miền Trung — cam kết nguồn gốc rõ ràng, hương vị nguyên bản.
              </p>
            </div>
          </div>

          {/* ═══ RIGHT: Summary sidebar ═════════════════════════ */}
          <aside style={{
            ...card,
            padding: '24px',
            position: 'sticky', top: 88,
          }}>
            {/* Header */}
            <p style={{
              fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase',
              color: 'rgba(201,168,76,0.65)', marginBottom: 14,
            }}>
              Tóm tắt đơn hàng
            </p>

            {/* Coupon */}
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 12, color: 'rgba(240,235,224,0.55)', marginBottom: 8, letterSpacing: '0.04em' }}>
                Mã giảm giá
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Tag size={13} style={{
                    position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                    color: 'rgba(240,235,224,0.3)',
                  }} />
                  <input
                    type="text"
                    placeholder="Nhập mã"
                    value={coupon}
                    onChange={e => setCoupon(e.target.value)}
                    style={{
                      width: '100%', height: 42, borderRadius: 10,
                      border: '1px solid rgba(255,255,255,0.08)',
                      background: 'rgba(255,255,255,0.03)',
                      color: '#f0ebe0', fontSize: 13,
                      paddingLeft: 34, paddingRight: 12,
                      outline: 'none', boxSizing: 'border-box',
                      fontFamily: 'var(--font-sans)',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={e => e.target.style.borderColor = 'rgba(201,168,76,0.4)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                  />
                </div>
                <button
                  type="button"
                  style={{
                    height: 42, padding: '0 16px', borderRadius: 10, flexShrink: 0,
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.03)',
                    color: '#f0ebe0', fontSize: 12, fontWeight: 600,
                    letterSpacing: '0.06em', cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontFamily: 'var(--font-sans)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.4)'; e.currentTarget.style.color = '#c9a84c'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#f0ebe0'; }}
                >
                  Áp dụng
                </button>
              </div>
            </div>

            {/* Price breakdown */}
            <div style={{
              borderTop: '1px solid rgba(255,255,255,0.07)',
              paddingTop: 18, marginBottom: 18,
              display: 'flex', flexDirection: 'column', gap: 10,
            }}>
              {[
                { label: 'Tạm tính', value: `${formatVnd(selected.size > 0 ? selectedTotal : totalVnd)} đ` },
                { label: 'Phí vận chuyển', value: 'Miễn phí' },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'rgba(240,235,224,0.55)' }}>{label}</span>
                  <span style={{ color: '#f0ebe0', fontWeight: 500 }}>{value}</span>
                </div>
              ))}
              {/* Free ship badge */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                borderRadius: 10, padding: '8px 12px',
                border: '1px solid rgba(34,197,94,0.2)',
                background: 'rgba(34,197,94,0.07)',
                fontSize: 12, color: 'rgba(74,222,128,0.85)',
              }}>
                <ShieldCheck size={13} style={{ flexShrink: 0 }} />
                Đơn hàng của bạn được miễn phí vận chuyển
              </div>
            </div>

            {/* Total */}
            <div style={{
              borderTop: '1px solid rgba(255,255,255,0.07)',
              paddingTop: 16, marginBottom: 20,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: 15, color: '#f0ebe0', fontWeight: 500 }}>Tổng cộng</span>
                <span style={{ fontSize: 24, fontWeight: 700, color: '#c9a84c', fontFamily: 'var(--font-sans)' }}>
                  {formatVnd(selected.size > 0 ? selectedTotal : totalVnd)} đ
                </span>
              </div>
              {selected.size > 0 && selected.size < items.length && (
                <p style={{ fontSize: 11, color: 'rgba(240,235,224,0.35)', marginTop: 4, textAlign: 'right' }}>
                  {selected.size} sản phẩm được chọn
                </p>
              )}
            </div>

            {/* CTA */}
            <Link
              href={selected.size > 0 ? buildCheckoutUrl() : '#'}
              onClick={e => { if (selected.size === 0) e.preventDefault(); }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                height: 50, borderRadius: 999, width: '100%',
                background: selected.size > 0 ? '#c9a84c' : 'rgba(201,168,76,0.3)',
                color: '#1a1208',
                fontSize: 12, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase',
                textDecoration: 'none',
                cursor: selected.size > 0 ? 'pointer' : 'not-allowed',
                transition: 'filter 0.2s',
                marginBottom: 20,
              }}
              onMouseEnter={e => { if (selected.size > 0) e.currentTarget.style.filter = 'brightness(1.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)'; }}
            >
              {selected.size === 0 ? 'Chọn sản phẩm để thanh toán' : 'Thanh toán'}
            </Link>

            {/* Trust badges */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 18 }}>
              {[
                { icon: ShieldCheck, label: 'Thanh toán an toàn & bảo mật' },
                { icon: RefreshCw,   label: 'Miễn phí đổi trả trong 7 ngày' },
                { icon: Clock,       label: 'Giao hàng nhanh toàn quốc' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Icon size={13} style={{ color: '#22c55e', flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: 'rgba(240,235,224,0.45)' }}>{label}</span>
                </div>
              ))}
            </div>

            {/* Brand quote */}
            <div style={{
              marginTop: 18, paddingTop: 16,
              borderTop: '1px solid rgba(255,255,255,0.05)',
              textAlign: 'center',
            }}>
              <p style={{
                fontFamily: 'var(--font-display)',
                fontSize: 13, fontStyle: 'italic', fontWeight: 300,
                color: 'rgba(201,168,76,0.5)', lineHeight: 1.65,
              }}>
                "Tinh hoa đặc sản miền Trung —<br/>từ làng nghề đến tay bạn"
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}