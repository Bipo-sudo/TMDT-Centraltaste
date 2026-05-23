'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useGoogleLogin } from '@react-oauth/google';
import { ArrowRight, ChevronRight, Crown, ShieldCheck, Sparkles, Store } from 'lucide-react';
import api from '../../../lib/api';
import useStore from '../../../store/useStore';
import BrandLogo from '../../../components/common/BrandLogo';

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path d="M23.04 12.261c0-.816-.066-1.636-.207-2.438H12v4.621h6.204a5.3 5.3 0 0 1-2.3 3.478v2.998h3.866c2.271-2.09 3.57-5.176 3.57-8.66Z" fill="#4285F4" />
      <path d="M12 23.5c3.1 0 5.713-1.018 7.618-2.58l-3.866-2.998c-1.075.731-2.463 1.146-3.752 1.146-2.998 0-5.54-2.023-6.449-4.743H1.56v3.092C3.511 21.328 7.494 23.5 12 23.5Z" fill="#34A853" />
      <path d="M5.551 14.325a7.014 7.014 0 0 1 0-4.462V6.771H1.56a11.49 11.49 0 0 0 0 10.646l3.991-3.092Z" fill="#FBBC04" />
      <path d="M12 4.932c1.736 0 3.294.598 4.511 1.777l3.357-3.357C17.707 1.341 15.094.5 12 .5 7.494.5 3.511 2.672 1.56 6.771l3.991 3.092C6.46 6.955 9.002 4.932 12 4.932Z" fill="#EA4335" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const login = useStore((state) => state.login);

  const [form, setForm] = useState({ email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const googleLogin = useGoogleLogin({
    flow: 'implicit',
    scope: 'openid email profile',
    onSuccess: async (tokenResponse) => {
      try {
        setIsGoogleSubmitting(true);
        setErrorMessage('');

        const token = tokenResponse?.access_token;

        if (!token) {
          throw new Error('Google token is missing');
        }

        const res = await api.post('/auth/google', { token });
        const authToken = res.data?.data?.token;
        const user = res.data?.data?.user;

        if (!authToken || !user) {
          throw new Error('Invalid Google auth payload');
        }

        window.localStorage.setItem('token', authToken);
        login(user);
        router.push('/');
      } catch (error) {
        setErrorMessage(error?.response?.data?.message || 'Đăng nhập Google thất bại.');
      } finally {
        setIsGoogleSubmitting(false);
      }
    },
    onError: () => {
      setIsGoogleSubmitting(false);
      setErrorMessage('Không thể mở Google login.');
    },
  });

  async function handleLogin(event) {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      setErrorMessage('');

      const res = await api.post('/auth/login', form);
      const token = res.data?.data?.token;
      const user = res.data?.data?.user;

      if (!token || !user) {
        throw new Error('Invalid auth payload');
      }

      window.localStorage.setItem('token', token);
      login(user);
      router.push('/');
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || 'Đăng nhập thất bại.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleGoogleLogin() {
    setIsGoogleSubmitting(true);
    setErrorMessage('');
    googleLogin();
  }

  return (
    <section className="relative min-h-screen bg-[#0c0b09] flex items-center justify-center px-4 py-12">
      {/* background accents */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-8 -translate-x-1/2 h-96 w-[140%] -translate-y-6 rounded-[28%] bg-gradient-to-r from-[#111010] via-[#1b1a18] to-[#0c0b09] opacity-95" />
        <div className="absolute left-[-8%] top-[-6%] h-80 w-80 rounded-full bg-[#c9a84c]/[0.08] blur-3xl" />
        <div className="absolute right-[-6%] top-[18%] h-96 w-96 rounded-full bg-sky-500/[0.04] blur-3xl" />
      </div>

      <div className="w-full max-w-md">
        <div className="mx-auto mb-6 flex items-center justify-center">
          <BrandLogo variant="light" width={42} height={42} />
        </div>

        <div className="rounded-[28px] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] backdrop-blur-md p-6 shadow-[0_10px_40px_rgba(0,0,0,0.6)]">
          <h2 className="text-center text-2xl font-semibold text-[#f0ebe0]">Welcome back</h2>
          <p className="mt-2 text-center text-sm text-[rgba(240,235,224,0.56)]">Login with your Apple or Google account</p>

          <div className="mt-6 space-y-3">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isGoogleSubmitting}
              className="flex w-full items-center justify-center gap-3 rounded-[12px] border border-[rgba(240,235,224,0.08)] bg-[rgba(255,255,255,0.02)] px-4 py-2 text-sm text-[rgba(240,235,224,0.9)] hover:bg-[rgba(255,255,255,0.03)] disabled:opacity-70"
            >
              <span className="inline-flex h-5 w-5 items-center justify-center"><GoogleIcon /></span>
              <span>{isGoogleSubmitting ? 'Đang xử lý...' : 'Login with Google'}</span>
            </button>

            <button
              type="button"
              disabled
              className="flex w-full items-center justify-center gap-3 rounded-[12px] border border-[rgba(240,235,224,0.08)] bg-[rgba(255,255,255,0.02)] px-4 py-2 text-sm text-[rgba(240,235,224,0.7)] opacity-80"
            >
              <span className="text-base leading-none"></span>
              <span>Login with Apple</span>
            </button>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-[rgba(240,235,224,0.06)]" />
            <span className="text-sm text-[rgba(240,235,224,0.46)]">Or continue with</span>
            <span className="h-px flex-1 bg-[rgba(240,235,224,0.06)]" />
          </div>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <label className="block">
              <span className="text-xs font-medium text-[rgba(240,235,224,0.56)]">Email</span>
              <input
                type="email"
                required
                value={form.email}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                placeholder="m@example.com"
                className="mt-1 w-full rounded-[12px] border border-[rgba(240,235,224,0.06)] bg-[rgba(255,255,255,0.01)] px-3 py-2 text-sm text-[#f0ebe0] outline-none placeholder:text-[rgba(240,235,224,0.28)]"
              />
            </label>

            <label className="block">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[rgba(240,235,224,0.56)]">Password</span>
                <Link href="/forgot" className="text-sm text-[rgba(240,235,224,0.46)] hover:underline">Forgot your password?</Link>
              </div>
              <input
                type="password"
                required
                value={form.password}
                onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                placeholder="••••••••"
                className="mt-1 w-full rounded-[12px] border border-[rgba(240,235,224,0.06)] bg-[rgba(255,255,255,0.01)] px-3 py-2 text-sm text-[#f0ebe0] outline-none placeholder:text-[rgba(240,235,224,0.28)]"
              />
            </label>

            {errorMessage ? <p className="text-sm text-rose-400">{errorMessage}</p> : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-1 w-full rounded-[12px] bg-[#f3f3f3] px-4 py-2 text-sm font-semibold text-[#0b0a09] hover:opacity-95 disabled:opacity-60"
            >
              {isSubmitting ? 'Đang đăng nhập...' : 'Login'}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-[rgba(240,235,224,0.5)]">
            Don't have an account?{' '}
            <Link href="/register" className="font-medium text-[#c9a84c] underline-offset-4 hover:underline">Sign up</Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-[rgba(240,235,224,0.36)]">By clicking continue, you agree to our Terms of Service and Privacy Policy.</p>
      </div>
    </section>
  );
}
