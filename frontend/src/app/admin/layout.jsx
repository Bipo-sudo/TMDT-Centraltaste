"use client";

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ExternalLink, LayoutDashboard, LogOut, Package, ShoppingCart } from 'lucide-react';
import BrandLogo from '../../components/common/BrandLogo';
import useStore from '../../store/useStore';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
];

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useStore((state) => state.user);
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  const clearUser = useStore((state) => state.clearUser);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.replace('/');
    }
  }, [isAuthenticated, router, user]);

  const adminName = useMemo(() => user?.full_name || user?.email || 'Admin', [user]);

  function handleLogout() {
    window.localStorage.removeItem('token');
    clearUser();
    router.push('/');
  }

  return (
    <div className="min-h-screen bg-[#0c0b09] text-[#f0ebe0]">
      <header className="sticky top-0 z-40 border-b border-[rgba(201,168,76,0.12)] bg-[rgba(12,11,9,0.88)] backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-4">
            <BrandLogo width={140} height={40} variant="light" />
            <div className="hidden sm:block">
              <p className="text-[10px] uppercase tracking-[0.38em] text-[rgba(201,168,76,0.7)]">Admin</p>
              <p className="mt-1 text-sm text-[rgba(240,235,224,0.7)]">CentralTaste Control Room</p>
            </div>
          </div>

          <nav className="flex items-center gap-2 overflow-x-auto rounded-full border border-[rgba(201,168,76,0.12)] bg-[rgba(255,255,255,0.03)] p-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={item.label}
                  aria-label={item.label}
                  className={`inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-medium transition ${
                    isActive ? 'bg-[#c9a84c] text-[#1a1208]' : 'text-[rgba(240,235,224,0.76)] hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden md:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-[#f0ebe0]">{adminName}</p>
            </div>

            <Link
              href="/"
              title="Vào cửa hàng"
              aria-label="Vào cửa hàng"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(240,235,224,0.18)] bg-[rgba(255,255,255,0.03)] text-[rgba(240,235,224,0.78)] transition hover:border-[rgba(201,168,76,0.55)] hover:text-[#c9a84c]"
            >
              <ExternalLink className="h-4 w-4" />
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              title="Đăng xuất"
              aria-label="Đăng xuất"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(240,235,224,0.18)] bg-[rgba(255,255,255,0.03)] text-[rgba(240,235,224,0.78)] transition hover:border-[rgba(201,168,76,0.55)] hover:text-[#c9a84c]"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
