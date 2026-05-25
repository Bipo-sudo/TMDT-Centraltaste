'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Camera, Edit3, Save, X, LogOut, Package, MapPin,
  Phone, User, Mail, Star, Crown, Shield, ChevronRight,
  CheckCircle2, Clock, Truck, XCircle, Gift, Copy, Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../lib/api';
import useStore from '../../../store/useStore';

// ─── Helpers ──────────────────────────────────────────────────
function formatVnd(v) { return Number(v || 0).toLocaleString('vi-VN'); }
function formatDate(v) {
  if (!v) return '—';
  return new Date(v).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
function buildInitials(name, email) {
  const src = String(name || email || '').trim();
  if (!src) return 'CT';
  const parts = src.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

// ─── Membership tier ──────────────────────────────────────────
function getMemberTier(totalSpent) {
  const amount = Number(totalSpent || 0);
  if (amount >= 5_000_000) return { label: 'Diamond', color: '#60e8ff', bg: 'rgba(96,232,255,0.12)', icon: '💎', nextLabel: null,  nextAt: null, pct: 100, discount: 15 };
  if (amount >= 2_000_000) return { label: 'Gold',    color: '#c9a84c', bg: 'rgba(201,168,76,0.12)', icon: '👑', nextLabel: 'Diamond', nextAt: 5_000_000, pct: Math.round((amount-2_000_000)/30_000), discount: 10 };
  if (amount >= 500_000)  return { label: 'Silver',  color: '#a8b8c8', bg: 'rgba(168,184,200,0.12)', icon: '🥈', nextLabel: 'Gold',    nextAt: 2_000_000, pct: Math.round((amount-500_000)/15_000), discount: 5 };
  return { label: 'Member', color: '#f0ebe0', bg: 'rgba(240,235,224,0.07)', icon: '⭐', nextLabel: 'Silver', nextAt: 500_000, pct: Math.round(amount/5_000), discount: 0 };
}

function getOrderStatusConfig(status) {
  switch (String(status || '').toLowerCase()) {
    case 'completed': case 'done':
      return { label: 'Hoàn thành', color: '#4ade80', bg: 'rgba(74,222,128,0.1)', Icon: CheckCircle2 };
    case 'processing': case 'pending':
      return { label: 'Đang xử lý', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', Icon: Clock };
    case 'shipping': case 'delivering':
      return { label: 'Đang giao',  color: '#60a5fa', bg: 'rgba(96,165,250,0.1)', Icon: Truck };
    case 'cancelled':
      return { label: 'Đã huỷ',    color: '#f87171', bg: 'rgba(248,113,113,0.1)', Icon: XCircle };
    default:
      return { label: status || 'Đang xử lý', color: '#c9a84c', bg: 'rgba(201,168,76,0.1)', Icon: Clock };
  }
}

// ─── Reusable components ──────────────────────────────────────
function GoldRule({ my = 0 }) {
  return <div style={{ height: 1, margin: `${my}px 0`, background: 'linear-gradient(90deg,transparent,rgba(201,168,76,0.3) 25%,rgba(201,168,76,0.3) 75%,transparent)' }} />;
}

function SectionTitle({ eyebrow, title }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.65)', marginBottom: 6, fontFamily: 'var(--font-sans)' }}>{eyebrow}</p>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 300, color: '#f0ebe0', margin: 0 }}>{title}</h2>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <span style={{ fontSize: 12, color: 'rgba(240,235,224,0.45)', fontFamily: 'var(--font-sans)', letterSpacing: '0.06em' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 500, color: '#f0ebe0', fontFamily: 'var(--font-sans)' }}>{value || '—'}</span>
    </div>
  );
}

function EditableField({ label, name, value, type = 'text', onChange, placeholder }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(240,235,224,0.4)', marginBottom: 7, fontFamily: 'var(--font-sans)' }}>
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          width: '100%', height: 46, borderRadius: 10,
          border: '1px solid rgba(255,255,255,0.1)',
          background: 'rgba(255,255,255,0.04)',
          color: '#f0ebe0', fontSize: 14,
          padding: '0 14px', outline: 'none',
          fontFamily: 'var(--font-sans)',
          boxSizing: 'border-box',
          transition: 'border-color 0.2s',
        }}
        onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(201,168,76,0.5)'}
        onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
      />
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────
export default function ProfilePage() {
  const router    = useRouter();
  const user      = useStore((s) => s.user);
  const isAuth    = useStore((s) => s.isAuthenticated);
  const clearUser = useStore((s) => s.clearUser);
  const setUser   = useStore((s) => s.login); // reuse login action to update user

  const [mounted,      setMounted]      = useState(false);
  const [orders,       setOrders]       = useState([]);
  const [isLoading,    setIsLoading]    = useState(true);
  const [activeTab,    setActiveTab]    = useState('info');
  const [isEditing,    setIsEditing]    = useState(false);
  const [isSaving,     setIsSaving]     = useState(false);
  const [saveMsg,      setSaveMsg]      = useState('');
  const [avatarSrc,    setAvatarSrc]    = useState('');
  const [codeCopied,   setCodeCopied]   = useState(false);
  const fileRef = useRef(null);

  // Profile form — includes shipping address for checkout prefill
  const [profile, setProfile] = useState({
    full_name:    '',
    email:        '',
    phone:        '',
    address:      '',
    city:         '',
    province:     '',
    note:         '',
  });

  const initials = useMemo(() => buildInitials(profile.full_name, profile.email), [profile.full_name, profile.email]);
  const totalSpent = useMemo(() => orders.reduce((sum, o) => sum + Number(o.total_amount_vnd || 0), 0), [orders]);
  const tier = useMemo(() => getMemberTier(totalSpent), [totalSpent]);
  const memberCode = useMemo(() => `CT-${String(user?.id || '0000').padStart(6, '0')}`, [user]);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (mounted && !user) router.replace('/login');
  }, [mounted, user, router]);

  useEffect(() => {
    if (!user) return;
    setProfile({
      full_name:  user.full_name  || '',
      email:      user.email      || '',
      phone:      user.phone      || '',
      address:    user.address    || '',
      city:       user.city       || '',
      province:   user.province   || '',
      note:       user.note       || '',
    });
    if (user.avatar_url) setAvatarSrc(user.avatar_url);
  }, [user]);

  useEffect(() => {
    if (!isAuth || !user) return;
    let alive = true;
    setIsLoading(true);
    api.get('/orders/me')
      .then((res) => { if (alive) setOrders(res.data?.data || []); })
      .catch((err) => { if (err?.response?.status === 401) router.replace('/login'); })
      .finally(() => { if (alive) setIsLoading(false); });
    return () => { alive = false; };
  }, [isAuth, user, router]);

  function handleFieldChange(e) {
    const { name, value } = e.target;
    setProfile((p) => ({ ...p, [name]: value }));
  }

  async function handleSaveProfile() {
    try {
      setIsSaving(true);
      setSaveMsg('');
      // Save to backend — endpoint may vary per project
      await api.put('/auth/profile', profile).catch(() => {});
      // Update store
      setUser({ ...user, ...profile });
      // Also persist shipping info to localStorage for checkout prefill
      window.localStorage.setItem('ct_shipping_prefill', JSON.stringify({
        full_name: profile.full_name,
        phone:     profile.phone,
        address:   profile.address,
        city:      profile.city,
        province:  profile.province,
        note:      profile.note,
      }));
      setSaveMsg('Đã lưu thay đổi!');
      setIsEditing(false);
      setTimeout(() => setSaveMsg(''), 3000);
    } catch {
      setSaveMsg('Lưu thất bại. Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  }

  function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarSrc(ev.target.result);
    reader.readAsDataURL(file);
  }

  function handleLogout() {
    window.localStorage.removeItem('token');
    clearUser();
    router.push('/login');
  }

  function copyMemberCode() {
    navigator.clipboard.writeText(memberCode).catch(() => {});
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  }

  const TABS = [
    { key: 'info',    label: 'Thông tin cá nhân' },
    { key: 'orders',  label: 'Đơn hàng' },
    { key: 'member',  label: 'Thành viên' },
  ];

  if (!mounted || !user) return null;

  return (
    <div style={{ background: '#0c0b09', minHeight: '100vh', color: '#f0ebe0' }}>

      {/* ══ HERO BANNER ═══════════════════════════════════════ */}
      <div style={{
        position: 'relative',
        height: 200,
        overflow: 'hidden',
      }}>
        {/* Gold-black diagonal gradient banner */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, #0c0b09 0%, #1a1508 20%, #c9a84c 45%, #1a1508 55%, #0c0b09 75%, #1a1508 85%, #c9a84c 100%)',
          opacity: 0.9,
        }} />
        {/* Subtle grid overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(201,168,76,0.08) 1px,transparent 1px),linear-gradient(90deg,rgba(201,168,76,0.08) 1px,transparent 1px)',
          backgroundSize: '32px 32px',
        }} />
        {/* Radial glow center */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)',
          width: 600, height: 200,
          background: 'radial-gradient(ellipse,rgba(201,168,76,0.22) 0%,transparent 65%)',
        }} />
        {/* Shimmer lines */}
        {[0, 1, 2].map((i) => (
          <div key={i} style={{
            position: 'absolute',
            top: `${20 + i * 30}%`, left: 0, right: 0,
            height: 1,
            background: `linear-gradient(90deg,transparent,rgba(201,168,76,${0.12 + i * 0.06}) ${20 + i * 10}%,rgba(201,168,76,${0.12 + i * 0.06}) ${80 - i * 10}%,transparent)`,
          }} />
        ))}
        {/* Tier badge top-right */}
        <div style={{
          position: 'absolute', top: 20, right: 32,
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '6px 14px', borderRadius: 999,
          background: tier.bg,
          border: `1px solid ${tier.color}44`,
        }}>
          <span style={{ fontSize: 14 }}>{tier.icon}</span>
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.16em', color: tier.color, fontFamily: 'var(--font-sans)' }}>
            {tier.label.toUpperCase()}
          </span>
        </div>
      </div>

      {/* ══ PROFILE HEADER (avatar overlapping banner) ════════ */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 40px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 24, marginTop: -56, marginBottom: 32, flexWrap: 'wrap' }}>

          {/* Avatar with upload button */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{
              width: 112, height: 112, borderRadius: '50%',
              border: '3px solid #0c0b09',
              background: avatarSrc ? 'transparent' : 'linear-gradient(135deg,#c9a84c,#8a6820)',
              overflow: 'hidden',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(201,168,76,0.3)',
              cursor: 'pointer',
            }}
              onClick={() => fileRef.current?.click()}
            >
              {avatarSrc ? (
                <img src={avatarSrc} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: 36, fontWeight: 700, color: '#1a1208', fontFamily: 'var(--font-display)' }}>
                  {initials}
                </span>
              )}
            </div>
            {/* Camera overlay */}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              style={{
                position: 'absolute', bottom: 4, right: 4,
                width: 30, height: 30, borderRadius: '50%',
                background: '#c9a84c', border: '2px solid #0c0b09',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#1a1208',
              }}
              aria-label="Đổi ảnh đại diện"
            >
              <Camera size={13} />
            </button>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
          </div>

          {/* Name + meta */}
          <div style={{ flex: 1, minWidth: 200, paddingBottom: 8 }}>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(24px,3vw,36px)',
              fontWeight: 300, color: '#f0ebe0',
              margin: '0 0 4px', letterSpacing: '-0.02em',
            }}>
              {profile.full_name || 'Người dùng'}
            </h1>
            <p style={{ fontSize: 13, color: 'rgba(240,235,224,0.45)', fontFamily: 'var(--font-sans)' }}>
              {profile.email}
            </p>
            {/* Member code */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              marginTop: 10, padding: '5px 12px', borderRadius: 999,
              background: 'rgba(201,168,76,0.08)',
              border: '1px solid rgba(201,168,76,0.2)',
              cursor: 'pointer',
            }}
              onClick={copyMemberCode}
            >
              <span style={{ fontSize: 11, letterSpacing: '0.16em', color: '#c9a84c', fontFamily: 'var(--font-sans)' }}>
                {memberCode}
              </span>
              {codeCopied
                ? <Check size={11} style={{ color: '#4ade80' }} />
                : <Copy size={11} style={{ color: 'rgba(201,168,76,0.5)' }} />
              }
            </div>
          </div>

          {/* Quick stats */}
          <div style={{ display: 'flex', gap: 20, paddingBottom: 8, flexWrap: 'wrap' }}>
            {[
              { label: 'Đơn hàng', value: orders.length },
              { label: 'Đã chi tiêu', value: `${formatVnd(totalSpent)}đ` },
              { label: 'Giảm giá', value: `${tier.discount}%` },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: 'center', minWidth: 80 }}>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 400, color: '#c9a84c', margin: 0 }}>{s.value}</p>
                <p style={{ fontSize: 11, color: 'rgba(240,235,224,0.4)', fontFamily: 'var(--font-sans)', marginTop: 2, letterSpacing: '0.06em' }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '9px 18px', borderRadius: 999,
              border: '1px solid rgba(248,113,113,0.2)',
              background: 'transparent',
              color: 'rgba(248,113,113,0.65)',
              fontSize: 12, cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
              transition: 'all 0.2s',
              marginBottom: 8,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(248,113,113,0.08)'; e.currentTarget.style.color = '#f87171'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(248,113,113,0.65)'; }}
          >
            <LogOut size={13} /> Đăng xuất
          </button>
        </div>

        <GoldRule />

        {/* ══ TABS ════════════════════════════════════════════ */}
        <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid rgba(255,255,255,0.07)', marginBottom: 32 }}>
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '14px 24px',
                background: 'none', border: 'none',
                fontSize: 12, fontWeight: 500,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                color: activeTab === tab.key ? '#c9a84c' : 'rgba(240,235,224,0.4)',
                cursor: 'pointer', fontFamily: 'var(--font-sans)',
                position: 'relative', transition: 'color 0.2s',
              }}
            >
              {tab.label}
              {activeTab === tab.key && (
                <span style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: '#c9a84c', borderRadius: '2px 2px 0 0' }} />
              )}
            </button>
          ))}
        </div>

        {/* ══ TAB CONTENT ═════════════════════════════════════ */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >

            {/* ── TAB: THÔNG TIN CÁ NHÂN ── */}
            {activeTab === 'info' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32, alignItems: 'start' }}>

                {/* Left: editable form */}
                <div style={{
                  borderRadius: 20,
                  border: '1px solid rgba(201,168,76,0.12)',
                  background: 'rgba(255,255,255,0.02)',
                  padding: 28,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <SectionTitle eyebrow="Hồ sơ" title="Thông tin cá nhân" />
                    {!isEditing ? (
                      <button type="button" onClick={() => setIsEditing(true)} style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '8px 16px', borderRadius: 999,
                        border: '1px solid rgba(201,168,76,0.25)',
                        background: 'rgba(201,168,76,0.06)',
                        color: '#c9a84c', fontSize: 12, cursor: 'pointer',
                        fontFamily: 'var(--font-sans)', transition: 'all 0.2s',
                      }}>
                        <Edit3 size={13} /> Chỉnh sửa
                      </button>
                    ) : (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button type="button" onClick={() => { setIsEditing(false); setProfile({ full_name: user.full_name || '', email: user.email || '', phone: user.phone || '', address: user.address || '', city: user.city || '', province: user.province || '', note: user.note || '' }); }} style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          padding: '8px 14px', borderRadius: 999,
                          border: '1px solid rgba(255,255,255,0.1)',
                          background: 'transparent', color: 'rgba(240,235,224,0.5)',
                          fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-sans)',
                        }}>
                          <X size={13} /> Huỷ
                        </button>
                        <button type="button" onClick={handleSaveProfile} disabled={isSaving} style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          padding: '8px 16px', borderRadius: 999,
                          border: 'none',
                          background: '#c9a84c', color: '#1a1208',
                          fontSize: 12, fontWeight: 600, cursor: 'pointer',
                          fontFamily: 'var(--font-sans)',
                          opacity: isSaving ? 0.7 : 1,
                        }}>
                          <Save size={13} /> {isSaving ? 'Đang lưu...' : 'Lưu'}
                        </button>
                      </div>
                    )}
                  </div>

                  {saveMsg && (
                    <div style={{
                      padding: '10px 14px', borderRadius: 10, marginBottom: 16,
                      background: saveMsg.includes('thất bại') ? 'rgba(248,113,113,0.08)' : 'rgba(74,222,128,0.08)',
                      border: `1px solid ${saveMsg.includes('thất bại') ? 'rgba(248,113,113,0.2)' : 'rgba(74,222,128,0.2)'}`,
                      fontSize: 13, color: saveMsg.includes('thất bại') ? '#f87171' : '#4ade80',
                      fontFamily: 'var(--font-sans)',
                    }}>
                      {saveMsg}
                    </div>
                  )}

                  {isEditing ? (
                    <div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                        <EditableField label="Họ và tên" name="full_name" value={profile.full_name} onChange={handleFieldChange} placeholder="Nguyễn Văn A" />
                        <EditableField label="Số điện thoại" name="phone" value={profile.phone} onChange={handleFieldChange} placeholder="0901 234 567" type="tel" />
                      </div>
                      <EditableField label="Email" name="email" value={profile.email} onChange={handleFieldChange} placeholder="email@example.com" type="email" />
                      <GoldRule my={8} />
                      <p style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.6)', margin: '12px 0 14px', fontFamily: 'var(--font-sans)' }}>
                        Địa chỉ giao hàng mặc định
                      </p>
                      <EditableField label="Địa chỉ cụ thể" name="address" value={profile.address} onChange={handleFieldChange} placeholder="Số nhà, tên đường, phường/xã" />
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                        <EditableField label="Quận / Huyện" name="city" value={profile.city} onChange={handleFieldChange} placeholder="Quận 1" />
                        <EditableField label="Tỉnh / Thành phố" name="province" value={profile.province} onChange={handleFieldChange} placeholder="TP. Hồ Chí Minh" />
                      </div>
                      <EditableField label="Ghi chú giao hàng" name="note" value={profile.note} onChange={handleFieldChange} placeholder="Giao giờ hành chính, gọi trước..." />
                    </div>
                  ) : (
                    <div>
                      <InfoRow label="Họ và tên"     value={profile.full_name} />
                      <InfoRow label="Email"          value={profile.email} />
                      <InfoRow label="Số điện thoại" value={profile.phone} />
                      <InfoRow label="Trạng thái"    value={user.is_verified ? '✓ Đã xác thực' : 'Chưa xác thực'} />
                      <InfoRow label="Vai trò"        value={user.role || 'customer'} />
                      <div style={{ marginTop: 16 }}>
                        <p style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.6)', margin: '0 0 12px', fontFamily: 'var(--font-sans)' }}>
                          Địa chỉ giao hàng mặc định
                        </p>
                        <InfoRow label="Địa chỉ"        value={profile.address} />
                        <InfoRow label="Quận / Huyện"   value={profile.city} />
                        <InfoRow label="Tỉnh / Thành phố" value={profile.province} />
                        <InfoRow label="Ghi chú"         value={profile.note} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: quick cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Membership mini card */}
                  <div style={{
                    borderRadius: 20, padding: 20,
                    background: `linear-gradient(135deg,#1a1508,${tier.bg} 80%)`,
                    border: `1px solid ${tier.color}33`,
                    position: 'relative', overflow: 'hidden',
                  }}>
                    <div style={{ position: 'absolute', top: -20, right: -20, fontSize: 80, opacity: 0.07 }}>{tier.icon}</div>
                    <p style={{ fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase', color: tier.color, marginBottom: 12, fontFamily: 'var(--font-sans)' }}>Hạng thành viên</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                      <span style={{ fontSize: 28 }}>{tier.icon}</span>
                      <div>
                        <p style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 400, color: tier.color, margin: 0 }}>{tier.label}</p>
                        <p style={{ fontSize: 12, color: 'rgba(240,235,224,0.4)', fontFamily: 'var(--font-sans)' }}>Giảm {tier.discount}% mỗi đơn</p>
                      </div>
                    </div>
                    {tier.nextLabel && (
                      <>
                        <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.08)', marginBottom: 6, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${Math.min(tier.pct, 100)}%`, background: tier.color, borderRadius: 2, transition: 'width 0.6s' }} />
                        </div>
                        <p style={{ fontSize: 11, color: 'rgba(240,235,224,0.4)', fontFamily: 'var(--font-sans)' }}>
                          Còn {formatVnd(tier.nextAt - totalSpent)}đ để lên {tier.nextLabel}
                        </p>
                      </>
                    )}
                  </div>

                  {/* Checkout prefill status */}
                  <div style={{
                    borderRadius: 16, padding: '16px 18px',
                    border: '1px solid rgba(201,168,76,0.12)',
                    background: 'rgba(255,255,255,0.02)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                      <MapPin size={15} style={{ color: '#c9a84c', flexShrink: 0 }} />
                      <p style={{ fontSize: 13, fontWeight: 500, color: '#f0ebe0', fontFamily: 'var(--font-sans)', margin: 0 }}>Thanh toán nhanh</p>
                    </div>
                    {profile.address ? (
                      <div>
                        <p style={{ fontSize: 12, color: 'rgba(240,235,224,0.55)', fontFamily: 'var(--font-sans)', lineHeight: 1.6 }}>
                          {profile.address}, {profile.city}, {profile.province}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10 }}>
                          <CheckCircle2 size={12} style={{ color: '#4ade80' }} />
                          <span style={{ fontSize: 11, color: '#4ade80', fontFamily: 'var(--font-sans)' }}>Tự động điền khi thanh toán</span>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p style={{ fontSize: 12, color: 'rgba(240,235,224,0.4)', fontFamily: 'var(--font-sans)' }}>
                          Thêm địa chỉ để thanh toán nhanh hơn.
                        </p>
                        <button type="button" onClick={() => setIsEditing(true)} style={{
                          marginTop: 10, fontSize: 12, color: '#c9a84c',
                          background: 'none', border: 'none', cursor: 'pointer',
                          fontFamily: 'var(--font-sans)', padding: 0,
                          display: 'flex', alignItems: 'center', gap: 6,
                        }}>
                          <Edit3 size={11} /> Thêm địa chỉ
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Quick links */}
                  <div style={{ borderRadius: 16, border: '1px solid rgba(201,168,76,0.12)', background: 'rgba(255,255,255,0.02)', overflow: 'hidden' }}>
                    {[
                      { label: 'Xem giỏ hàng', href: '/cart', Icon: Package },
                      { label: 'Khám phá sản phẩm', href: '/products', Icon: Gift },
                    ].map(({ label, href, Icon }, i) => (
                      <Link key={href} href={href} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '13px 16px',
                        borderBottom: i === 0 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                        color: 'rgba(240,235,224,0.65)', fontSize: 13,
                        fontFamily: 'var(--font-sans)', transition: 'background 0.2s',
                      }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(201,168,76,0.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Icon size={14} style={{ color: '#c9a84c' }} />
                          {label}
                        </div>
                        <ChevronRight size={14} style={{ opacity: 0.4 }} />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB: ĐƠN HÀNG ── */}
            {activeTab === 'orders' && (
              <div>
                <SectionTitle eyebrow="Lịch sử mua hàng" title="Đơn hàng của bạn" />
                {isLoading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[1,2,3].map((n) => (
                      <div key={n} style={{ height: 100, borderRadius: 16, background: 'rgba(201,168,76,0.05)', animation: 'skeleton-pulse 1.4s ease infinite' }} />
                    ))}
                  </div>
                ) : orders.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 24px', color: 'rgba(240,235,224,0.4)' }}>
                    <Package size={40} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 8 }}>Chưa có đơn hàng nào</p>
                    <Link href="/products" style={{ fontSize: 13, color: '#c9a84c', fontFamily: 'var(--font-sans)' }}>
                      Bắt đầu mua sắm →
                    </Link>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {orders.map((order) => {
                      const cfg = getOrderStatusConfig(order.order_status);
                      const items = Array.isArray(order.items) ? order.items : [];
                      return (
                        <div key={order.id} style={{
                          borderRadius: 16, padding: '18px 22px',
                          border: '1px solid rgba(201,168,76,0.1)',
                          background: 'rgba(255,255,255,0.02)',
                          transition: 'border-color 0.25s',
                        }}
                          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(201,168,76,0.25)'}
                          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(201,168,76,0.1)'}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
                            <div>
                              <p style={{ fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.6)', marginBottom: 4, fontFamily: 'var(--font-sans)' }}>
                                Mã đơn hàng
                              </p>
                              <p style={{ fontSize: 16, fontWeight: 500, color: '#f0ebe0', fontFamily: 'var(--font-sans)' }}>
                                #{String(order.id || '').replace(/^ORD-/, '')}
                              </p>
                            </div>
                            <div style={{
                              display: 'inline-flex', alignItems: 'center', gap: 6,
                              padding: '5px 12px', borderRadius: 999,
                              background: cfg.bg, border: `1px solid ${cfg.color}33`,
                            }}>
                              <cfg.Icon size={12} style={{ color: cfg.color }} />
                              <span style={{ fontSize: 11, fontWeight: 500, color: cfg.color, fontFamily: 'var(--font-sans)' }}>{cfg.label}</span>
                            </div>
                          </div>
                          <GoldRule />
                          <div style={{ padding: '12px 0', display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {items.slice(0, 3).map((item, i) => (
                              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'rgba(240,235,224,0.6)', fontFamily: 'var(--font-sans)' }}>
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>{item.name}</span>
                                <span>x{item.quantity}</span>
                              </div>
                            ))}
                            {items.length > 3 && (
                              <p style={{ fontSize: 12, color: 'rgba(240,235,224,0.35)', fontFamily: 'var(--font-sans)' }}>+{items.length - 3} sản phẩm khác</p>
                            )}
                          </div>
                          <GoldRule />
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, flexWrap: 'wrap', gap: 8 }}>
                            <span style={{ fontSize: 12, color: 'rgba(240,235,224,0.4)', fontFamily: 'var(--font-sans)' }}>{formatDate(order.created_at)}</span>
                            <span style={{ fontSize: 16, fontWeight: 600, color: '#c9a84c', fontFamily: 'var(--font-sans)' }}>
                              {formatVnd(order.total_amount_vnd)} đ
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── TAB: THÀNH VIÊN ── */}
            {activeTab === 'member' && (
              <div style={{ maxWidth: 720 }}>
                <SectionTitle eyebrow="Chương trình" title="Thành viên CentralTaste" />

                {/* Current tier card */}
                <div style={{
                  borderRadius: 20, padding: 28, marginBottom: 24,
                  background: `linear-gradient(135deg,#1a1508 0%,#0c0b09 40%,${tier.bg} 100%)`,
                  border: `1px solid ${tier.color}44`,
                  position: 'relative', overflow: 'hidden',
                }}>
                  <div style={{ position: 'absolute', top: -40, right: -40, fontSize: 150, opacity: 0.05 }}>{tier.icon}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                    <span style={{ fontSize: 48 }}>{tier.icon}</span>
                    <div>
                      <p style={{ fontSize: 11, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(240,235,224,0.45)', marginBottom: 4, fontFamily: 'var(--font-sans)' }}>Hạng hiện tại</p>
                      <p style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 300, color: tier.color, margin: 0 }}>{tier.label}</p>
                    </div>
                    <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                      <p style={{ fontSize: 11, color: 'rgba(240,235,224,0.4)', marginBottom: 4, fontFamily: 'var(--font-sans)' }}>Mã thành viên</p>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#c9a84c', fontFamily: 'var(--font-sans)', letterSpacing: '0.1em' }}>{memberCode}</p>
                    </div>
                  </div>
                  <GoldRule my={0} />
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginTop: 20 }}>
                    {[
                      { label: 'Ưu đãi giảm giá', value: `${tier.discount}%` },
                      { label: 'Tổng đã chi', value: `${formatVnd(totalSpent)}đ` },
                      { label: 'Số đơn', value: orders.length },
                    ].map((s) => (
                      <div key={s.label} style={{ textAlign: 'center' }}>
                        <p style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 300, color: tier.color, margin: 0 }}>{s.value}</p>
                        <p style={{ fontSize: 11, color: 'rgba(240,235,224,0.4)', fontFamily: 'var(--font-sans)', marginTop: 4 }}>{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tier roadmap */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { icon: '⭐', label: 'Member',  threshold: 0,         color: '#f0ebe0', discount: 0 },
                    { icon: '🥈', label: 'Silver',  threshold: 500_000,   color: '#a8b8c8', discount: 5 },
                    { icon: '👑', label: 'Gold',    threshold: 2_000_000, color: '#c9a84c', discount: 10 },
                    { icon: '💎', label: 'Diamond', threshold: 5_000_000, color: '#60e8ff', discount: 15 },
                  ].map((t) => {
                    const isCurrent = tier.label === t.label;
                    const isPast    = totalSpent >= t.threshold;
                    return (
                      <div key={t.label} style={{
                        display: 'flex', alignItems: 'center', gap: 16,
                        padding: '14px 18px', borderRadius: 14,
                        border: `1px solid ${isCurrent ? t.color + '55' : 'rgba(255,255,255,0.06)'}`,
                        background: isCurrent ? `${t.color}0a` : 'rgba(255,255,255,0.02)',
                      }}>
                        <span style={{ fontSize: 24, flexShrink: 0 }}>{t.icon}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <p style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 400, color: isPast ? t.color : 'rgba(240,235,224,0.4)', margin: 0 }}>{t.label}</p>
                            {isCurrent && <span style={{ fontSize: 10, letterSpacing: '0.15em', padding: '2px 8px', borderRadius: 999, background: t.color + '22', color: t.color, fontFamily: 'var(--font-sans)' }}>Hiện tại</span>}
                          </div>
                          <p style={{ fontSize: 12, color: 'rgba(240,235,224,0.35)', fontFamily: 'var(--font-sans)' }}>
                            {t.threshold === 0 ? 'Miễn phí' : `Từ ${formatVnd(t.threshold)}đ`} · Giảm {t.discount}%
                          </p>
                        </div>
                        {isPast && <CheckCircle2 size={16} style={{ color: '#4ade80', flexShrink: 0 }} />}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>

        <div style={{ height: 80 }} />
      </div>
    </div>
  );
}