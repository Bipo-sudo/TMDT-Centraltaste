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
    <section className="relative min-h-screen bg-[#0c0b09] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="mb-4 text-center">
          <p className="text-[10px] uppercase tracking-[0.28em] text-[rgba(201,168,76,0.64)]">Auth</p>
          <h1 className="mt-2 text-2xl font-semibold text-[#f0ebe0]" style={{ fontFamily: 'var(--font-display)' }}>
            Đăng ký
          </h1>
          <p className="mt-1 text-sm text-[rgba(240,235,224,0.6)]">{step === 1 ? 'Tạo tài khoản để bắt đầu mua sắm.' : 'Nhập OTP 6 số đã gửi về email của bạn.'}</p>
        </div>

        <div className="rounded-[28px] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] backdrop-blur-md p-6 shadow-[0_18px_50px_rgba(0,0,0,0.4)]">
          {step === 1 ? (
            <form onSubmit={handleRegister} className="space-y-4">
              <label className="block">
                <span className="sr-only">Họ tên</span>
                <input
                  type="text"
                  required
                  value={registerForm.full_name}
                  onChange={(event) => setRegisterForm((prev) => ({ ...prev, full_name: event.target.value }))}
                  placeholder="Họ và tên"
                  className="w-full rounded-[12px] border border-[rgba(240,235,224,0.06)] bg-[rgba(255,255,255,0.01)] px-3 py-2 text-sm text-[#f0ebe0] outline-none placeholder:text-[rgba(240,235,224,0.36)]"
                />
              </label>

              <label className="block">
                <span className="sr-only">Email</span>
                <input
                  type="email"
                  required
                  value={registerForm.email}
                  onChange={(event) => setRegisterForm((prev) => ({ ...prev, email: event.target.value }))}
                  placeholder="Email"
                  className="w-full rounded-[12px] border border-[rgba(240,235,224,0.06)] bg-[rgba(255,255,255,0.01)] px-3 py-2 text-sm text-[#f0ebe0] outline-none placeholder:text-[rgba(240,235,224,0.36)]"
                />
              </label>

              <label className="block">
                <span className="sr-only">Password</span>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={registerForm.password}
                  onChange={(event) => setRegisterForm((prev) => ({ ...prev, password: event.target.value }))}
                  placeholder="Mật khẩu"
                  className="w-full rounded-[12px] border border-[rgba(240,235,224,0.06)] bg-[rgba(255,255,255,0.01)] px-3 py-2 text-sm text-[#f0ebe0] outline-none placeholder:text-[rgba(240,235,224,0.36)]"
                />
              </label>

              {errorMessage ? <p className="text-sm text-rose-400">{errorMessage}</p> : null}
              {successMessage ? <p className="text-sm text-emerald-400">{successMessage}</p> : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex h-11 w-full items-center justify-center rounded-[12px] bg-[#c9a84c] px-4 text-sm font-medium text-[#1a1208] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? 'Đang gửi OTP...' : 'Xác nhận'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <label className="block">
                <span className="sr-only">OTP</span>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  value={normalizedOtp}
                  onChange={(event) => setOtp(event.target.value)}
                  placeholder="Nhập 6 số OTP"
                  className="w-full rounded-[12px] border border-[rgba(240,235,224,0.06)] bg-[rgba(255,255,255,0.01)] px-3 py-2 text-sm tracking-[0.28em] text-[#f0ebe0] outline-none placeholder:tracking-normal placeholder:text-[rgba(240,235,224,0.36)]"
                />
              </label>

              {errorMessage ? <p className="text-sm text-rose-400">{errorMessage}</p> : null}
              {successMessage ? <p className="text-sm text-emerald-400">{successMessage}</p> : null}

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setErrorMessage('');
                  }}
                  className="inline-flex h-11 w-full items-center justify-center rounded-[12px] border border-[rgba(201,168,76,0.08)] bg-transparent px-4 text-sm font-medium text-[rgba(240,235,224,0.9)] transition hover:bg-[rgba(201,168,76,0.02)]"
                >
                  Quay lại
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                    className="inline-flex h-11 w-full items-center justify-center rounded-[12px] bg-[#c9a84c] px-4 text-sm font-medium text-[#1a1208] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? 'Đang xác thực...' : 'Xác nhận OTP'}
                </button>
              </div>
            </form>
          )}

          <p className="mt-4 text-center text-sm text-[rgba(240,235,224,0.56)]">
            Đã có tài khoản?{' '}
            <Link href="/login" className="font-medium text-[#c9a84c] underline-offset-4 transition hover:underline">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
