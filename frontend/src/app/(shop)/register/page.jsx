'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '../../../lib/api';
import useStore from '../../../store/useStore';

export default function RegisterPage() {
  const router = useRouter();
  const login = useStore((state) => state.login);

  const [step, setStep] = useState(1);
  const [registerForm, setRegisterForm] = useState({
    full_name: '',
    email: '',
    password: '',
  });
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const normalizedOtp = useMemo(() => otp.replace(/\D/g, '').slice(0, 6), [otp]);

  async function handleRegister(event) {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      setErrorMessage('');
      setSuccessMessage('');

      await api.post('/auth/register', registerForm);
      setStep(2);
      setSuccessMessage('Mã OTP đã được gửi qua email. Vui lòng kiểm tra hộp thư.');
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || 'Đăng ký thất bại.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleVerifyOtp(event) {
    event.preventDefault();

    if (normalizedOtp.length !== 6) {
      setErrorMessage('OTP phải gồm 6 chữ số.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage('');

      const res = await api.post('/auth/verify-otp', {
        email: registerForm.email,
        otp: normalizedOtp,
      });

      const token = res.data?.data?.token;
      const user = res.data?.data?.user;

      if (!token || !user) {
        throw new Error('Invalid verify payload');
      }

      window.localStorage.setItem('token', token);
      login(user);
      router.push('/');
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || 'Xác thực OTP thất bại.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="flex min-h-[calc(100vh-7rem)] items-center justify-center bg-[#fafaf8] px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md rounded-[28px] bg-white/92 p-8 shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:p-10">
        <p className="text-[11px] uppercase tracking-[0.4em] text-neutral-400">Auth</p>
        <h1 className="mt-4 text-4xl font-light tracking-[-0.05em] text-neutral-950">Đăng ký</h1>
        <p className="mt-2 text-sm leading-7 text-neutral-500">
          {step === 1 ? 'Tạo tài khoản để bắt đầu mua sắm.' : 'Nhập OTP 6 số đã gửi về email của bạn.'}
        </p>

        {step === 1 ? (
          <form onSubmit={handleRegister} className="mt-8 space-y-6">
            <label className="block border-b border-neutral-200 pb-3">
              <span className="sr-only">Họ tên</span>
              <input
                type="text"
                required
                value={registerForm.full_name}
                onChange={(event) => setRegisterForm((prev) => ({ ...prev, full_name: event.target.value }))}
                placeholder="Họ và tên"
                className="w-full bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-400"
              />
            </label>

            <label className="block border-b border-neutral-200 pb-3">
              <span className="sr-only">Email</span>
              <input
                type="email"
                required
                value={registerForm.email}
                onChange={(event) => setRegisterForm((prev) => ({ ...prev, email: event.target.value }))}
                placeholder="Email"
                className="w-full bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-400"
              />
            </label>

            <label className="block border-b border-neutral-200 pb-3">
              <span className="sr-only">Password</span>
              <input
                type="password"
                required
                minLength={6}
                value={registerForm.password}
                onChange={(event) => setRegisterForm((prev) => ({ ...prev, password: event.target.value }))}
                placeholder="Mật khẩu"
                className="w-full bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-400"
              />
            </label>

            {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}
            {successMessage ? <p className="text-sm text-emerald-700">{successMessage}</p> : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-12 w-full items-center justify-center rounded-full bg-neutral-950 px-5 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Đang gửi OTP...' : 'Xác nhận'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="mt-8 space-y-6">
            <label className="block border-b border-neutral-200 pb-3">
              <span className="sr-only">OTP</span>
              <input
                type="text"
                inputMode="numeric"
                required
                value={normalizedOtp}
                onChange={(event) => setOtp(event.target.value)}
                placeholder="Nhập 6 số OTP"
                className="w-full bg-transparent text-sm tracking-[0.28em] text-neutral-900 outline-none placeholder:tracking-normal placeholder:text-neutral-400"
              />
            </label>

            {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}
            {successMessage ? <p className="text-sm text-emerald-700">{successMessage}</p> : null}

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setErrorMessage('');
                }}
                className="inline-flex h-12 w-full items-center justify-center rounded-full border border-neutral-300 bg-white px-5 text-sm font-medium text-neutral-800 transition hover:bg-neutral-50"
              >
                Quay lại
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex h-12 w-full items-center justify-center rounded-full bg-neutral-950 px-5 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? 'Đang xác thực...' : 'Xác nhận OTP'}
              </button>
            </div>
          </form>
        )}

        <p className="mt-8 text-center text-sm text-neutral-500">
          Đã có tài khoản?{' '}
          <Link href="/login" className="font-medium text-neutral-900 underline-offset-4 transition hover:underline">
            Đăng nhập
          </Link>
        </p>
      </div>
    </section>
  );
}
