'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { X, Menu, Search, ShoppingBag, User } from 'lucide-react';
import BrandLogo from '../common/BrandLogo';
import { useStore } from '../../store/useStore';

const navItems = [
  { href: '/', label: 'Trang chủ' },
  { href: '/products', label: 'Danh sách Sản phẩm' },
  { href: '/#brand', label: 'Về thương hiệu' },
  { href: '/#contact', label: 'Liên hệ' },
];

export default function Header() {
  const cartCount = useStore((state) => state.cartCount);
  const user = useStore((state) => state.user);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (!isMenuOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMenuOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200/70 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => setIsMenuOpen(true)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-900 transition hover:border-neutral-300 hover:bg-neutral-50"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <Link href="/" className="shrink-0">
          <BrandLogo width={142} height={42} />
        </Link>

        <div className="hidden items-center gap-7 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-neutral-600 transition hover:text-neutral-950"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-900 transition hover:border-neutral-300 hover:bg-neutral-50"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>
          <Link
            href={user ? '/me' : '/login'}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-900 transition hover:border-neutral-300 hover:bg-neutral-50"
            aria-label="Account"
          >
            <User className="h-5 w-5" />
          </Link>
          <Link
            href="/cart"
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-900 transition hover:border-neutral-300 hover:bg-neutral-50"
            aria-label="Cart"
          >
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 ? (
              <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-neutral-900 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                {cartCount}
              </span>
            ) : null}
          </Link>
        </div>
      </div>

      <div
        className={`fixed inset-0 z-[60] transition ${isMenuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}
        aria-hidden={!isMenuOpen}
      >
        <button
          type="button"
          onClick={() => setIsMenuOpen(false)}
          className="absolute inset-0 bg-neutral-950/35 backdrop-blur-[2px]"
          aria-label="Close menu overlay"
        />
        <aside
          className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-neutral-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.12)] transition-transform duration-300 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-5">
            <BrandLogo width={132} height={40} />
            <button
              type="button"
              onClick={() => setIsMenuOpen(false)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 text-neutral-900 transition hover:border-neutral-300 hover:bg-neutral-50"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex flex-1 flex-col justify-center px-6">
            <div className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="block rounded-2xl px-2 py-4 text-2xl font-light tracking-[-0.04em] text-neutral-900 transition hover:bg-neutral-50"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>

          <div className="border-t border-neutral-100 px-6 py-5 text-sm text-neutral-500">
            Minimal shop experience for CentralTaste.
          </div>
        </aside>
      </div>
    </header>
  );
}
