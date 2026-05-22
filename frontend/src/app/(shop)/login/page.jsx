'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useGoogleLogin } from '@react-oauth/google';
import api from '../../../lib/api';
import useStore from '../../../store/useStore';

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
    <section className="flex min-h-[calc(100vh-7rem)] items-center justify-center bg-[#fafaf8] px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md rounded-[28px] bg-white/92 p-8 shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:p-10">
        <p className="text-[11px] uppercase tracking-[0.4em] text-neutral-400">Auth</p>
        <h1 className="mt-4 text-4xl font-light tracking-[-0.05em] text-neutral-950">Đăng nhập</h1>
        <p className="mt-2 text-sm leading-7 text-neutral-500">Tiếp tục hành trình mua sắm tinh gọn và thanh lịch.</p>

        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          <label className="block border-b border-neutral-200 pb-3">
            <span className="sr-only">Email</span>
            <input
              type="email"
              required
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              placeholder="Email"
              className="w-full bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-400"
            />
          </label>

          <label className="block border-b border-neutral-200 pb-3">
            <span className="sr-only">Password</span>
            <input
              type="password"
              required
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
              placeholder="Mật khẩu"
              className="w-full bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-400"
            />
          </label>

          {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-12 w-full items-center justify-center rounded-full bg-neutral-950 px-5 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isGoogleSubmitting}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-neutral-300 bg-white px-5 text-sm font-medium text-neutral-800 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <GoogleIcon />
            {isGoogleSubmitting ? 'Đang xử lý Google...' : 'Đăng nhập bằng Google'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-neutral-500">
          Chưa có tài khoản?{' '}
          <Link href="/register" className="font-medium text-neutral-900 underline-offset-4 transition hover:underline">
            Đăng ký
          </Link>
        </p>
      </div>
    </section>
  );
}
