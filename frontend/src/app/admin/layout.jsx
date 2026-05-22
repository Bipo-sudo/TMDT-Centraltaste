"use client";

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BarChart3, LayoutDashboard, LogOut, Package, ShoppingCart } from 'lucide-react';
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
    <div className="min-h-screen bg-[#f3f4f6] text-neutral-900 lg:grid lg:grid-cols-[292px_minmax(0,1fr)]">
      <aside className="border-b border-white/10 bg-neutral-950 px-6 py-8 text-white lg:min-h-screen lg:border-b-0 lg:border-r lg:border-white/10">
        <BrandLogo className="mb-10" width={156} height={46} variant="light" />
        <div className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  isActive ? 'bg-white/10 text-white' : 'text-white/65 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
        <div className="mt-10 rounded-[28px] border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-5 w-5 text-white/85" />
            <p className="text-sm font-medium text-white">Admin shell</p>
          </div>
          <p className="mt-3 text-sm leading-6 text-white/65">
            Tách riêng luồng vận hành, không lẫn với trải nghiệm mua hàng.
          </p>
        </div>
      </aside>

      <div className="flex min-h-screen flex-col">
        <header className="flex items-center justify-between border-b border-neutral-200 bg-[#f3f4f6] px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-neutral-400">Admin</p>
            <h1 className="mt-2 text-xl font-medium text-neutral-950">CentralTaste Control Room</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-neutral-900">{adminName}</p>
              <p className="text-xs text-neutral-500">Administrator</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:border-neutral-400 hover:text-neutral-950"
            >
              <LogOut className="h-4 w-4" />
              Đăng xuất
            </button>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
