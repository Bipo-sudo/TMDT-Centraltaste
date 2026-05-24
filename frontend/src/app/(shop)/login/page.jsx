'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useGoogleLogin } from '@react-oauth/google';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import api from '../../../lib/api';
import useStore from '../../../store/useStore';

/* ─── Background images ─────────────────────────────────── */
const BG_IMAGES = [
  'https://images.unsplash.com/photo-1621873495868-6c5774cf6012?w=1920',
  'https://images.unsplash.com/photo-1590741664176-7fbd7e2592a0?w=1920',
  'https://images.unsplash.com/photo-1629272040444-2f7553ec7466?w=1920',
  'https://images.unsplash.com/photo-1458253756247-1e4ed949191b?w=1920',
  'https://images.unsplash.com/photo-1506458539166-34079f9e1d2c?w=1920',
];

/* ─── 20 random particles ────────────────────────────────── */
const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  left:     `${5 + Math.random() * 90}%`,
  size:     2 + Math.random() * 3,
  delay:    Math.random() * 8,
  duration: 8 + Math.random() * 10,
  opacity:  0.25 + Math.random() * 0.45,
}));

/* ─── Google SVG ─────────────────────────────────────────── */
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

/* ─── Main Component ─────────────────────────────────────── */
export default function LoginPage() {
  const router = useRouter();
  const loginStore = useStore((s) => s.login);

  const [bgIndex,       setBgIndex]       = useState(0);
  const [prevIndex,     setPrevIndex]     = useState(null);
  const [showPass,      setShowPass]      = useState(false);
  const [remember,      setRemember]      = useState(false);
  const [form,          setForm]          = useState({ email: '', password: '' });
  const [isSubmitting,  setIsSubmitting]  = useState(false);
  const [isGoogleBusy,  setIsGoogleBusy]  = useState(false);
  const [errorMsg,      setErrorMsg]      = useState('');
  const [mounted,       setMounted]       = useState(false);

  /* Mount guard for SSR */
  useEffect(() => { setMounted(true); }, []);

  /* Slideshow timer */
  useEffect(() => {
    const t = setInterval(() => {
      setBgIndex(prev => {
        setPrevIndex(prev);
        return (prev + 1) % BG_IMAGES.length;
      });
    }, 5000);
    return () => clearInterval(t);
  }, []);

  /* Google OAuth */
  const googleLogin = useGoogleLogin({
    flow: 'implicit',
    scope: 'openid email profile',
    onSuccess: async (tok) => {
      try {
        setIsGoogleBusy(true);
        setErrorMsg('');
        const res = await api.post('/auth/google', { token: tok.access_token });
        const { token, user } = res.data?.data || {};
        if (!token || !user) throw new Error('Invalid payload');
        window.localStorage.setItem('token', token);
        loginStore(user);
        router.push('/');
      } catch (e) {
        setErrorMsg(e?.response?.data?.message || 'Đăng nhập Google thất bại.');
      } finally {
        setIsGoogleBusy(false);
      }
    },
    onError: () => { setIsGoogleBusy(false); setErrorMsg('Không thể mở Google login.'); },
  });

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setErrorMsg('');
      const res = await api.post('/auth/login', form);
      const { token, user } = res.data?.data || {};
      if (!token || !user) throw new Error('Invalid payload');
      window.localStorage.setItem('token', token);
      loginStore(user);
      router.push('/');
    } catch (e) {
      setErrorMsg(e?.response?.data?.message || 'Email hoặc mật khẩu không đúng.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      {/* ── Injected styles ─────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Montserrat:wght@300;400;500;600&display=swap');

        .ct-login-root {
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

        /* Slideshow layers */
        .ct-bg-slide {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          transition: opacity 2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .ct-bg-overlay {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(135deg, rgba(8,6,2,0.82) 0%, rgba(18,15,8,0.70) 50%, rgba(8,6,2,0.85) 100%);
          z-index: 1;
        }

        /* Particles */
        @keyframes floatUp {
          0%   { transform: translateY(100vh) scale(0.6); opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 0.8; }
          100% { transform: translateY(-12vh) scale(1); opacity: 0; }
        }
        .ct-particle {
          position: absolute;
          bottom: 0;
          border-radius: 50%;
          background: radial-gradient(circle, #D4AF37 0%, rgba(212,175,55,0.3) 60%, transparent 100%);
          animation: floatUp linear infinite;
          z-index: 2;
          pointer-events: none;
        }

        /* Content above everything */
        .ct-content {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 460px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 28px;
        }

        /* Logo */
        .ct-logo {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }
        .ct-logo-ring {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          border: 1.5px solid rgba(212,175,55,0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        .ct-logo-ring::before {
          content: '';
          position: absolute;
          inset: 5px;
          border-radius: 50%;
          border: 1px solid rgba(212,175,55,0.35);
        }
        .ct-logo-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: linear-gradient(135deg, #D4AF37, #f0d878);
        }
        .ct-logo-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px;
          font-weight: 300;
          letter-spacing: 0.38em;
          text-transform: uppercase;
          color: #f0ebe0;
        }
        .ct-logo-sub {
          font-family: 'Montserrat', sans-serif;
          font-size: 9px;
          font-weight: 300;
          letter-spacing: 0.38em;
          text-transform: uppercase;
          color: rgba(212,175,55,0.65);
          margin-top: -6px;
        }

        /* Glass card */
        .ct-card {
          width: 100%;
          border-radius: 24px;
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

        .ct-card-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 32px;
          font-weight: 400;
          color: #f0ebe0;
          text-align: center;
          margin: 0 0 6px;
          letter-spacing: -0.01em;
        }
        .ct-card-sub {
          font-family: 'Cormorant Garamond', serif;
          font-size: 15px;
          font-style: italic;
          font-weight: 300;
          color: rgba(240,235,224,0.5);
          text-align: center;
          margin: 0 0 28px;
        }

        /* Google button */
        .ct-btn-google {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          height: 48px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.14);
          background: rgba(255,255,255,0.97);
          color: #1f1f1f;
          font-family: 'Montserrat', sans-serif;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.02em;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.22,1,0.36,1);
          margin-bottom: 20px;
        }
        .ct-btn-google:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.35);
        }
        .ct-btn-google:disabled { opacity: 0.65; cursor: not-allowed; transform: none; }

        /* Divider */
        .ct-divider {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 24px;
        }
        .ct-divider-line {
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.08);
        }
        .ct-divider-text {
          font-size: 11px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(240,235,224,0.35);
          white-space: nowrap;
          font-family: 'Montserrat', sans-serif;
        }

        /* Input group */
        .ct-field { margin-bottom: 16px; }
        .ct-field-label {
          display: block;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: rgba(240,235,224,0.55);
          margin-bottom: 8px;
          font-family: 'Montserrat', sans-serif;
        }
        .ct-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .ct-input-icon {
          position: absolute;
          left: 14px;
          color: rgba(212,175,55,0.45);
          pointer-events: none;
          transition: color 0.2s;
        }
        .ct-input {
          width: 100%;
          height: 50px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04);
          color: #f0ebe0;
          font-family: 'Montserrat', sans-serif;
          font-size: 14px;
          padding: 0 44px;
          outline: none;
          transition: border-color 0.25s, box-shadow 0.25s;
          box-sizing: border-box;
        }
        .ct-input::placeholder { color: rgba(240,235,224,0.25); }
        .ct-input:focus {
          border-color: rgba(212,175,55,0.55);
          box-shadow: 0 0 0 3px rgba(212,175,55,0.08);
        }
        .ct-input:focus + .ct-input-icon-after,
        .ct-input-wrap:focus-within .ct-input-icon {
          color: rgba(212,175,55,0.75);
        }
        .ct-eye-btn {
          position: absolute;
          right: 14px;
          background: none;
          border: none;
          color: rgba(240,235,224,0.35);
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s;
        }
        .ct-eye-btn:hover { color: #D4AF37; }

        /* Row: remember + forgot */
        .ct-row-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          margin-top: -4px;
        }
        .ct-remember {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          user-select: none;
        }
        .ct-checkbox {
          width: 16px;
          height: 16px;
          border-radius: 4px;
          border: 1px solid rgba(255,255,255,0.2);
          background: rgba(255,255,255,0.04);
          appearance: none;
          cursor: pointer;
          position: relative;
          transition: border-color 0.2s, background 0.2s;
          flex-shrink: 0;
        }
        .ct-checkbox:checked {
          background: #D4AF37;
          border-color: #D4AF37;
        }
        .ct-checkbox:checked::after {
          content: '';
          position: absolute;
          left: 4px; top: 2px;
          width: 5px; height: 8px;
          border: 1.5px solid #1a1208;
          border-top: none; border-left: none;
          transform: rotate(45deg);
        }
        .ct-remember-label {
          font-size: 12px;
          color: rgba(240,235,224,0.5);
          font-family: 'Montserrat', sans-serif;
        }
        .ct-forgot {
          font-size: 12px;
          color: #D4AF37;
          text-decoration: none;
          font-family: 'Montserrat', sans-serif;
          transition: opacity 0.2s;
        }
        .ct-forgot:hover { opacity: 0.75; }

        /* Error */
        .ct-error {
          font-size: 12px;
          color: rgba(252,165,165,0.9);
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.18);
          border-radius: 10px;
          padding: 10px 14px;
          margin-bottom: 16px;
          font-family: 'Montserrat', sans-serif;
        }

        /* Submit button */
        .ct-btn-submit {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          height: 52px;
          border-radius: 12px;
          border: none;
          background: linear-gradient(135deg, #D4AF37 0%, #c9a030 60%, #b8921f 100%);
          color: #1a1208;
          font-family: 'Montserrat', sans-serif;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.28s cubic-bezier(0.22,1,0.36,1);
          box-shadow: 0 4px 20px rgba(212,175,55,0.3);
          margin-bottom: 20px;
        }
        .ct-btn-submit:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(212,175,55,0.45);
          filter: brightness(1.06);
        }
        .ct-btn-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        /* Sign up link */
        .ct-signup {
          text-align: center;
          font-size: 13px;
          color: rgba(240,235,224,0.45);
          font-family: 'Montserrat', sans-serif;
        }
        .ct-signup a {
          color: #D4AF37;
          font-weight: 600;
          text-decoration: none;
          transition: opacity 0.2s;
        }
        .ct-signup a:hover { opacity: 0.8; }

        /* Footer */
        .ct-footer {
          display: flex;
          gap: 20px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .ct-footer a {
          font-size: 11px;
          letter-spacing: 0.12em;
          color: rgba(240,235,224,0.28);
          text-decoration: none;
          font-family: 'Montserrat', sans-serif;
          transition: color 0.2s;
        }
        .ct-footer a:hover { color: rgba(212,175,55,0.7); }
        .ct-footer-dot {
          font-size: 11px;
          color: rgba(240,235,224,0.15);
          display: flex;
          align-items: center;
        }
      `}</style>

      <div className="ct-login-root">

        {/* ── Background slideshow ── */}
        {BG_IMAGES.map((src, i) => (
          <div
            key={src}
            className="ct-bg-slide"
            style={{
              backgroundImage: `url(${src})`,
              opacity: i === bgIndex ? 1 : 0,
              zIndex: i === bgIndex ? 0 : -1,
            }}
          />
        ))}
        <div className="ct-bg-overlay" />

        {/* ── Particles ── */}
        {mounted && PARTICLES.map(p => (
          <span
            key={p.id}
            className="ct-particle"
            style={{
              left: p.left,
              width: p.size,
              height: p.size,
              opacity: p.opacity,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
            }}
          />
        ))}

        {/* ── Content ── */}
        <div className="ct-content">

          {/* Logo */}
          <div className="ct-logo">
            <div className="ct-logo-ring">
              <div className="ct-logo-dot" />
            </div>
            <div className="ct-logo-name">Centraltaste</div>
            <div className="ct-logo-sub">Gourmet Boutique</div>
          </div>

          {/* Card */}
          <div className="ct-card">
            <h1 className="ct-card-title">Đăng Nhập</h1>
            <p className="ct-card-sub">Chào mừng trở lại với thế giới ẩm thực tinh hoa</p>

            {/* Google */}
            <button
              type="button"
              className="ct-btn-google"
              onClick={() => { setIsGoogleBusy(true); setErrorMsg(''); googleLogin(); }}
              disabled={isGoogleBusy}
            >
              <GoogleIcon />
              {isGoogleBusy ? 'Đang xử lý...' : 'Đăng nhập với Google'}
            </button>

            {/* Divider */}
            <div className="ct-divider">
              <span className="ct-divider-line" />
              <span className="ct-divider-text">Hoặc đăng nhập với email</span>
              <span className="ct-divider-line" />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              {/* Email */}
              <div className="ct-field">
                <label className="ct-field-label">Email</label>
                <div className="ct-input-wrap">
                  <span className="ct-input-icon"><Mail size={15} /></span>
                  <input
                    type="email"
                    required
                    className="ct-input"
                    placeholder="your.email@example.com"
                    value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="ct-field">
                <label className="ct-field-label">Mật khẩu</label>
                <div className="ct-input-wrap">
                  <span className="ct-input-icon"><Lock size={15} /></span>
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    className="ct-input"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="ct-eye-btn"
                    onClick={() => setShowPass(v => !v)}
                    aria-label={showPass ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Remember + Forgot */}
              <div className="ct-row-meta">
                <label className="ct-remember">
                  <input
                    type="checkbox"
                    className="ct-checkbox"
                    checked={remember}
                    onChange={e => setRemember(e.target.checked)}
                  />
                  <span className="ct-remember-label">Ghi nhớ đăng nhập</span>
                </label>
                <Link href="/forgot" className="ct-forgot">Quên mật khẩu?</Link>
              </div>

              {/* Error */}
              {errorMsg && <div className="ct-error">{errorMsg}</div>}

              {/* Submit */}
              <button type="submit" className="ct-btn-submit" disabled={isSubmitting}>
                <ArrowRight size={16} />
                {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </button>
            </form>

            {/* Sign up */}
            <p className="ct-signup">
              Chưa có tài khoản?{' '}
              <Link href="/register">Đăng ký ngay</Link>
            </p>
          </div>

          {/* Footer links */}
          <nav className="ct-footer" aria-label="Footer links">
            <Link href="/terms">Điều khoản</Link>
            <span className="ct-footer-dot">•</span>
            <Link href="/privacy">Bảo mật</Link>
            <span className="ct-footer-dot">•</span>
            <Link href="/#contact">Hỗ trợ</Link>
          </nav>
        </div>
      </div>
    </>
  );
}