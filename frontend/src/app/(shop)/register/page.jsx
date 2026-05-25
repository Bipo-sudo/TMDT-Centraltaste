'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, CheckCircle2 } from 'lucide-react';
import api from '../../../lib/api';
import useStore from '../../../store/useStore';

// ─── Background images (same set as login) ───────────────────
const BG_IMAGES = [
  'https://images.unsplash.com/photo-1621873495868-6c5774cf6012?w=1920',
  'https://images.unsplash.com/photo-1590741664176-7fbd7e2592a0?w=1920',
  'https://images.unsplash.com/photo-1629272040444-2f7553ec7466?w=1920',
  'https://images.unsplash.com/photo-1458253756247-1e4ed949191b?w=1920',
  'https://images.unsplash.com/photo-1506458539166-34079f9e1d2c?w=1920',
];

// ─── Particles (same as login) ────────────────────────────────
const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  left:     `${5 + (i * 4.7 + 11) % 90}%`,
  size:     2 + (i * 0.3) % 3,
  delay:    (i * 0.41) % 8,
  duration: 8 + (i * 0.63) % 10,
  opacity:  0.25 + (i * 0.023) % 0.45,
}));

// ─── Google icon ──────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path d="M23.04 12.261c0-.816-.066-1.636-.207-2.438H12v4.621h6.204a5.3 5.3 0 0 1-2.3 3.478v2.998h3.866c2.271-2.09 3.57-5.176 3.57-8.66Z" fill="#4285F4"/>
      <path d="M12 23.5c3.1 0 5.713-1.018 7.618-2.58l-3.866-2.998c-1.075.731-2.463 1.146-3.752 1.146-2.998 0-5.54-2.023-6.449-4.743H1.56v3.092C3.511 21.328 7.494 23.5 12 23.5Z" fill="#34A853"/>
      <path d="M5.551 14.325a7.014 7.014 0 0 1 0-4.462V6.771H1.56a11.49 11.49 0 0 0 0 10.646l3.991-3.092Z" fill="#FBBC04"/>
      <path d="M12 4.932c1.736 0 3.294.598 4.511 1.777l3.357-3.357C17.707 1.341 15.094.5 12 .5 7.494.5 3.511 2.672 1.56 6.771l3.991 3.092C6.46 6.955 9.002 4.932 12 4.932Z" fill="#EA4335"/>
    </svg>
  );
}

// ─── OTP digit boxes ──────────────────────────────────────────
function OtpInput({ value, onChange }) {
  const digits = value.padEnd(6, '').split('');

  function handleChange(e, i) {
    const val = e.target.value.replace(/\D/g, '');
    const arr = value.padEnd(6, '').split('');
    arr[i] = val.slice(-1);
    const next = arr.join('').replace(/\s/g, '');
    onChange(next.slice(0, 6));
    // Auto-focus next
    if (val && i < 5) {
      const nextInput = e.target.parentElement.children[i + 1];
      if (nextInput) nextInput.focus();
    }
  }

  function handleKeyDown(e, i) {
    if (e.key === 'Backspace' && !value[i] && i > 0) {
      const prevInput = e.target.parentElement.children[i - 1];
      if (prevInput) prevInput.focus();
    }
  }

  return (
    <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
      {digits.map((d, i) => (
        <input
          key={i}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d === ' ' ? '' : d}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          style={{
            width: 48, height: 56,
            borderRadius: 12,
            border: d ? '1.5px solid rgba(212,175,55,0.6)' : '1px solid rgba(255,255,255,0.12)',
            background: d ? 'rgba(212,175,55,0.08)' : 'rgba(255,255,255,0.04)',
            color: '#f0ebe0',
            fontSize: 22, fontWeight: 600, textAlign: 'center',
            outline: 'none',
            transition: 'all 0.2s',
            fontFamily: 'Montserrat, sans-serif',
          }}
          onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(212,175,55,0.7)'}
          onBlur={(e) => e.currentTarget.style.borderColor = d ? 'rgba(212,175,55,0.6)' : 'rgba(255,255,255,0.12)'}
        />
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────
export default function RegisterPage() {
  const router = useRouter();
  const loginStore = useStore((s) => s.login);

  const [bgIndex,      setBgIndex]      = useState(0);
  const [mounted,      setMounted]      = useState(false);
  const [step,         setStep]         = useState(1); // 1=form, 2=otp, 3=success
  const [showPass,     setShowPass]     = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [form,         setForm]         = useState({ full_name: '', email: '', password: '', confirm: '' });
  const [otp,          setOtp]          = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg,     setErrorMsg]     = useState('');
  const [successMsg,   setSuccessMsg]   = useState('');
  const [countdown,    setCountdown]    = useState(0);

  useEffect(() => { setMounted(true); }, []);

  // Slideshow
  useEffect(() => {
    const t = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % BG_IMAGES.length);
    }, 5000);
    return () => clearInterval(t);
  }, []);

  // Countdown for resend OTP
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const passwordMatch = form.password && form.confirm && form.password === form.confirm;
  const passwordStrong = form.password.length >= 8;

  async function handleRegister(e) {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setErrorMsg('Mật khẩu xác nhận không khớp.');
      return;
    }
    try {
      setIsSubmitting(true);
      setErrorMsg('');
      setSuccessMsg('');
      await api.post('/auth/register', {
        full_name: form.full_name,
        email: form.email,
        password: form.password,
      });
      setStep(2);
      setCountdown(60);
      setSuccessMsg('Mã OTP đã được gửi đến email của bạn.');
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleVerifyOtp(e) {
    e.preventDefault();
    const cleanOtp = otp.replace(/\D/g, '');
    if (cleanOtp.length !== 6) {
      setErrorMsg('Vui lòng nhập đủ 6 chữ số OTP.');
      return;
    }
    try {
      setIsSubmitting(true);
      setErrorMsg('');
      const res = await api.post('/auth/verify-otp', { email: form.email, otp: cleanOtp });
      const { token, user } = res.data?.data || {};
      if (!token || !user) throw new Error('Invalid payload');
      window.localStorage.setItem('token', token);
      loginStore(user);
      setStep(3);
      setTimeout(() => router.push('/'), 1800);
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || 'OTP không hợp lệ hoặc đã hết hạn.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResendOtp() {
    if (countdown > 0) return;
    try {
      setErrorMsg('');
      await api.post('/auth/register', {
        full_name: form.full_name,
        email: form.email,
        password: form.password,
      });
      setCountdown(60);
      setSuccessMsg('Đã gửi lại OTP.');
    } catch {
      setErrorMsg('Không thể gửi lại OTP.');
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Montserrat:wght@300;400;500;600&display=swap');

        .ct-reg-root {
          position: relative;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 32px 16px 48px;
          overflow: hidden;
          font-family: 'Montserrat', sans-serif;
        }
        .ct-reg-bg {
          position: absolute; inset: 0;
          background-size: cover;
          background-position: center;
          transition: opacity 2s cubic-bezier(0.4,0,0.2,1);
        }
        .ct-reg-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(135deg,rgba(8,6,2,0.82) 0%,rgba(18,15,8,0.70) 50%,rgba(8,6,2,0.85) 100%);
          z-index: 1;
        }
        @keyframes floatUp {
          0%   { transform: translateY(100vh) scale(0.6); opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 0.8; }
          100% { transform: translateY(-12vh) scale(1); opacity: 0; }
        }
        .ct-reg-particle {
          position: absolute; bottom: 0; border-radius: 50%;
          background: radial-gradient(circle,#D4AF37 0%,rgba(212,175,55,0.3) 60%,transparent 100%);
          animation: floatUp linear infinite;
          z-index: 2; pointer-events: none;
        }
        .ct-reg-content {
          position: relative; z-index: 10;
          width: 100%; max-width: 480px;
          display: flex; flex-direction: column;
          align-items: center; gap: 24px;
        }
        .ct-reg-logo {
          display: flex; flex-direction: column;
          align-items: center; gap: 10px;
        }
        .ct-reg-logo-ring {
          width: 56px; height: 56px; border-radius: 50%;
          border: 1.5px solid rgba(212,175,55,0.7);
          display: flex; align-items: center; justify-content: center;
          position: relative;
        }
        .ct-reg-logo-ring::before {
          content: ''; position: absolute; inset: 5px;
          border-radius: 50%; border: 1px solid rgba(212,175,55,0.35);
        }
        .ct-reg-logo-dot {
          width: 12px; height: 12px; border-radius: 50%;
          background: linear-gradient(135deg,#D4AF37,#f0d878);
        }
        .ct-reg-logo-name {
          font-family: 'Cormorant Garamond',serif;
          font-size: 22px; font-weight: 300;
          letter-spacing: 0.38em; text-transform: uppercase;
          color: #f0ebe0;
        }
        .ct-reg-logo-sub {
          font-family: 'Montserrat',sans-serif;
          font-size: 9px; font-weight: 300;
          letter-spacing: 0.38em; text-transform: uppercase;
          color: rgba(212,175,55,0.65); margin-top: -6px;
        }
        .ct-reg-card {
          width: 100%; border-radius: 24px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(14,12,8,0.72);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          padding: 36px 32px;
          box-shadow:
            0 0 0 1px rgba(212,175,55,0.06),
            0 8px 32px rgba(0,0,0,0.55),
            0 32px 64px rgba(0,0,0,0.4),
            inset 0 1px 0 rgba(255,255,255,0.05);
        }
        .ct-reg-title {
          font-family: 'Cormorant Garamond',serif;
          font-size: 32px; font-weight: 400;
          color: #f0ebe0; text-align: center;
          margin: 0 0 6px; letter-spacing: -0.01em;
        }
        .ct-reg-sub {
          font-family: 'Cormorant Garamond',serif;
          font-size: 15px; font-style: italic; font-weight: 300;
          color: rgba(240,235,224,0.5);
          text-align: center; margin: 0 0 24px;
        }
        .ct-reg-field { margin-bottom: 14px; }
        .ct-reg-label {
          display: block; font-size: 11px; font-weight: 500;
          letter-spacing: 0.16em; text-transform: uppercase;
          color: rgba(240,235,224,0.55); margin-bottom: 7px;
          font-family: 'Montserrat',sans-serif;
        }
        .ct-reg-input-wrap { position: relative; display: flex; align-items: center; }
        .ct-reg-input-icon {
          position: absolute; left: 14px;
          color: rgba(212,175,55,0.45); pointer-events: none;
          transition: color 0.2s;
        }
        .ct-reg-input {
          width: 100%; height: 50px; border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04);
          color: #f0ebe0; font-family: 'Montserrat',sans-serif;
          font-size: 14px; padding: 0 44px;
          outline: none; transition: border-color 0.25s, box-shadow 0.25s;
          box-sizing: border-box;
        }
        .ct-reg-input::placeholder { color: rgba(240,235,224,0.25); }
        .ct-reg-input:focus {
          border-color: rgba(212,175,55,0.55);
          box-shadow: 0 0 0 3px rgba(212,175,55,0.08);
        }
        .ct-reg-input-wrap:focus-within .ct-reg-input-icon { color: rgba(212,175,55,0.75); }
        .ct-reg-eye {
          position: absolute; right: 14px; background: none; border: none;
          color: rgba(240,235,224,0.35); cursor: pointer;
          padding: 4px; display: flex; align-items: center; justify-content: center;
          transition: color 0.2s;
        }
        .ct-reg-eye:hover { color: #D4AF37; }
        .ct-reg-error {
          font-size: 12px; color: rgba(252,165,165,0.9);
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.18);
          border-radius: 10px; padding: 10px 14px;
          margin-bottom: 14px; font-family: 'Montserrat',sans-serif;
        }
        .ct-reg-success {
          font-size: 12px; color: rgba(74,222,128,0.9);
          background: rgba(74,222,128,0.08);
          border: 1px solid rgba(74,222,128,0.2);
          border-radius: 10px; padding: 10px 14px;
          margin-bottom: 14px; font-family: 'Montserrat',sans-serif;
        }
        .ct-reg-btn {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          width: 100%; height: 52px; border-radius: 12px; border: none;
          background: linear-gradient(135deg,#D4AF37 0%,#c9a030 60%,#b8921f 100%);
          color: #1a1208; font-family: 'Montserrat',sans-serif;
          font-size: 13px; font-weight: 700;
          letter-spacing: 0.18em; text-transform: uppercase;
          cursor: pointer; transition: all 0.28s cubic-bezier(0.22,1,0.36,1);
          box-shadow: 0 4px 20px rgba(212,175,55,0.3);
          margin-top: 4px;
        }
        .ct-reg-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(212,175,55,0.45);
          filter: brightness(1.06);
        }
        .ct-reg-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; box-shadow: none; }
        .ct-reg-btn-ghost {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          width: 100%; height: 48px; border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.12);
          background: transparent; color: rgba(240,235,224,0.75);
          font-family: 'Montserrat',sans-serif;
          font-size: 13px; font-weight: 500;
          cursor: pointer; transition: all 0.2s;
        }
        .ct-reg-btn-ghost:hover {
          border-color: rgba(212,175,55,0.35);
          color: #D4AF37;
        }
        .ct-reg-divider {
          display: flex; align-items: center; gap: 14px; margin-bottom: 20px;
        }
        .ct-reg-divider-line { flex: 1; height: 1px; background: rgba(255,255,255,0.08); }
        .ct-reg-divider-text {
          font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase;
          color: rgba(240,235,224,0.35); white-space: nowrap;
          font-family: 'Montserrat',sans-serif;
        }
        .ct-reg-footer-link {
          text-align: center; font-size: 13px;
          color: rgba(240,235,224,0.45); font-family: 'Montserrat',sans-serif;
          margin-top: 20px;
        }
        .ct-reg-footer-link a {
          color: #D4AF37; font-weight: 600; text-decoration: none; transition: opacity 0.2s;
        }
        .ct-reg-footer-link a:hover { opacity: 0.8; }
        .ct-reg-step-indicator {
          display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 20px;
        }
        .ct-reg-step-dot {
          width: 6px; height: 6px; border-radius: 50%; transition: all 0.3s;
        }
        .ct-reg-footer-links {
          display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;
        }
        .ct-reg-footer-links a {
          font-size: 11px; letter-spacing: 0.12em;
          color: rgba(240,235,224,0.28); text-decoration: none;
          font-family: 'Montserrat',sans-serif; transition: color 0.2s;
        }
        .ct-reg-footer-links a:hover { color: rgba(212,175,55,0.7); }
      `}</style>

      <div className="ct-reg-root">
        {/* ── Slideshow background ── */}
        {BG_IMAGES.map((src, i) => (
          <div key={src} className="ct-reg-bg" style={{
            backgroundImage: `url(${src})`,
            opacity: i === bgIndex ? 1 : 0,
            zIndex: i === bgIndex ? 0 : -1,
          }} />
        ))}
        <div className="ct-reg-overlay" />

        {/* ── Particles ── */}
        {mounted && PARTICLES.map((p) => (
          <span key={p.id} className="ct-reg-particle" style={{
            left: p.left,
            width: p.size, height: p.size,
            opacity: p.opacity,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }} />
        ))}

        {/* ── Content ── */}
        <div className="ct-reg-content">

          {/* Logo — identical to login */}
          <div className="ct-reg-logo">
            <div className="ct-reg-logo-ring">
              <div className="ct-reg-logo-dot" />
            </div>
            <div className="ct-reg-logo-name">Centraltaste</div>
            <div className="ct-reg-logo-sub">Gourmet Boutique</div>
          </div>

          {/* Card */}
          <div className="ct-reg-card">

            {/* Step indicator */}
            <div className="ct-reg-step-indicator">
              {[1, 2].map((s) => (
                <div key={s} className="ct-reg-step-dot" style={{
                  width: step >= s ? 20 : 6,
                  background: step >= s ? '#D4AF37' : 'rgba(255,255,255,0.15)',
                  borderRadius: step >= s ? 4 : '50%',
                }} />
              ))}
            </div>

            {/* ══ STEP 1: Registration form ══════════════ */}
            {step === 1 && (
              <>
                <h1 className="ct-reg-title">Đăng Ký</h1>
                <p className="ct-reg-sub">Tạo tài khoản để khám phá tinh hoa đặc sản</p>

                {/* Google register */}
                <button type="button" className="ct-reg-btn" style={{
                  background: 'rgba(255,255,255,0.97)',
                  color: '#1f1f1f',
                  boxShadow: 'none',
                  marginBottom: 20,
                  height: 48,
                  fontSize: 13,
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.35)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <GoogleIcon />
                  Đăng ký với Google
                </button>

                <div className="ct-reg-divider">
                  <span className="ct-reg-divider-line" />
                  <span className="ct-reg-divider-text">Hoặc đăng ký với email</span>
                  <span className="ct-reg-divider-line" />
                </div>

                <form onSubmit={handleRegister}>
                  {/* Full name */}
                  <div className="ct-reg-field">
                    <label className="ct-reg-label">Họ và tên</label>
                    <div className="ct-reg-input-wrap">
                      <span className="ct-reg-input-icon"><User size={15} /></span>
                      <input
                        type="text" required
                        className="ct-reg-input"
                        placeholder="Nguyễn Văn A"
                        value={form.full_name}
                        onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))}
                        autoComplete="name"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="ct-reg-field">
                    <label className="ct-reg-label">Email</label>
                    <div className="ct-reg-input-wrap">
                      <span className="ct-reg-input-icon"><Mail size={15} /></span>
                      <input
                        type="email" required
                        className="ct-reg-input"
                        placeholder="your.email@example.com"
                        value={form.email}
                        onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="ct-reg-field">
                    <label className="ct-reg-label">Mật khẩu</label>
                    <div className="ct-reg-input-wrap">
                      <span className="ct-reg-input-icon"><Lock size={15} /></span>
                      <input
                        type={showPass ? 'text' : 'password'} required
                        className="ct-reg-input"
                        placeholder="Tối thiểu 8 ký tự"
                        value={form.password}
                        onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                        autoComplete="new-password"
                      />
                      <button type="button" className="ct-reg-eye" onClick={() => setShowPass((v) => !v)} aria-label="Toggle password">
                        {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    {/* Password strength indicator */}
                    {form.password && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                        <div style={{ flex: 1, height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                          <div style={{
                            height: '100%', borderRadius: 2,
                            width: passwordStrong ? '100%' : '40%',
                            background: passwordStrong ? '#4ade80' : '#f59e0b',
                            transition: 'width 0.3s, background 0.3s',
                          }} />
                        </div>
                        <span style={{ fontSize: 11, color: passwordStrong ? '#4ade80' : '#f59e0b', fontFamily: 'Montserrat, sans-serif' }}>
                          {passwordStrong ? 'Mạnh' : 'Yếu'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Confirm password */}
                  <div className="ct-reg-field">
                    <label className="ct-reg-label">Xác nhận mật khẩu</label>
                    <div className="ct-reg-input-wrap">
                      <span className="ct-reg-input-icon"><Lock size={15} /></span>
                      <input
                        type={showConfirm ? 'text' : 'password'} required
                        className="ct-reg-input"
                        placeholder="Nhập lại mật khẩu"
                        value={form.confirm}
                        onChange={(e) => setForm((p) => ({ ...p, confirm: e.target.value }))}
                        autoComplete="new-password"
                        style={{ borderColor: form.confirm ? (passwordMatch ? 'rgba(74,222,128,0.5)' : 'rgba(248,113,113,0.5)') : undefined }}
                      />
                      <button type="button" className="ct-reg-eye" onClick={() => setShowConfirm((v) => !v)} aria-label="Toggle confirm">
                        {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    {form.confirm && (
                      <p style={{
                        fontSize: 11, marginTop: 6,
                        color: passwordMatch ? '#4ade80' : 'rgba(248,113,113,0.9)',
                        fontFamily: 'Montserrat, sans-serif',
                      }}>
                        {passwordMatch ? '✓ Mật khẩu khớp' : '✗ Mật khẩu không khớp'}
                      </p>
                    )}
                  </div>

                  {errorMsg && <div className="ct-reg-error">{errorMsg}</div>}

                  <button type="submit" className="ct-reg-btn" disabled={isSubmitting}>
                    <ArrowRight size={16} />
                    {isSubmitting ? 'Đang gửi OTP...' : 'Tiếp tục'}
                  </button>
                </form>

                <p className="ct-reg-footer-link">
                  Đã có tài khoản? <Link href="/login">Đăng nhập</Link>
                </p>
              </>
            )}

            {/* ══ STEP 2: OTP verification ════════════════ */}
            {step === 2 && (
              <>
                <h1 className="ct-reg-title">Xác thực OTP</h1>
                <p className="ct-reg-sub">Nhập mã 6 số đã gửi đến</p>
                <p style={{
                  textAlign: 'center', fontSize: 13,
                  color: '#D4AF37', marginBottom: 24,
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 500,
                }}>
                  {form.email}
                </p>

                {successMsg && <div className="ct-reg-success">{successMsg}</div>}
                {errorMsg && <div className="ct-reg-error">{errorMsg}</div>}

                <form onSubmit={handleVerifyOtp}>
                  <OtpInput value={otp} onChange={setOtp} />

                  <button
                    type="submit"
                    className="ct-reg-btn"
                    disabled={isSubmitting || otp.replace(/\D/g, '').length !== 6}
                    style={{ marginTop: 24 }}
                  >
                    <ArrowRight size={16} />
                    {isSubmitting ? 'Đang xác thực...' : 'Xác nhận OTP'}
                  </button>
                </form>

                {/* Resend + Back */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={countdown > 0}
                    style={{
                      background: 'none', border: 'none',
                      fontSize: 13, cursor: countdown > 0 ? 'not-allowed' : 'pointer',
                      color: countdown > 0 ? 'rgba(240,235,224,0.35)' : '#D4AF37',
                      fontFamily: 'Montserrat, sans-serif',
                      textAlign: 'center', transition: 'color 0.2s',
                    }}
                  >
                    {countdown > 0 ? `Gửi lại sau ${countdown}s` : 'Gửi lại OTP'}
                  </button>

                  <button
                    type="button"
                    className="ct-reg-btn-ghost"
                    onClick={() => { setStep(1); setErrorMsg(''); setOtp(''); }}
                  >
                    ← Quay lại
                  </button>
                </div>
              </>
            )}

            {/* ══ STEP 3: Success ══════════════════════════ */}
            {step === 3 && (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div style={{
                  width: 72, height: 72, borderRadius: '50%',
                  background: 'rgba(74,222,128,0.1)',
                  border: '1px solid rgba(74,222,128,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 20px',
                }}>
                  <CheckCircle2 size={32} style={{ color: '#4ade80' }} />
                </div>
                <h2 style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: 28, fontWeight: 400,
                  color: '#f0ebe0', margin: '0 0 8px',
                }}>
                  Đăng ký thành công!
                </h2>
                <p style={{
                  fontSize: 13, color: 'rgba(240,235,224,0.5)',
                  fontFamily: 'Montserrat, sans-serif',
                }}>
                  Chào mừng đến với CentralTaste. Đang chuyển hướng...
                </p>
                <div style={{
                  width: 48, height: 2, borderRadius: 1,
                  background: '#D4AF37', margin: '20px auto 0',
                  animation: 'skeleton-pulse 1.4s ease infinite',
                }} />
              </div>
            )}
          </div>

          {/* Footer links */}
          <nav className="ct-reg-footer-links">
            <Link href="/terms">Điều khoản</Link>
            <span style={{ color: 'rgba(240,235,224,0.15)', fontSize: 11 }}>•</span>
            <Link href="/privacy">Bảo mật</Link>
            <span style={{ color: 'rgba(240,235,224,0.15)', fontSize: 11 }}>•</span>
            <Link href="/#contact">Hỗ trợ</Link>
          </nav>
        </div>
      </div>
    </>
  );
}