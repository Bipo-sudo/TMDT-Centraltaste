import Link from 'next/link';
import { BarChart3, LayoutDashboard, Package, ShoppingCart, Settings } from 'lucide-react';
import BrandLogo from '../../components/common/BrandLogo';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
];

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#f6f7fb] text-neutral-900 lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="border-b border-neutral-200 bg-white/90 px-6 py-8 lg:min-h-screen lg:border-b-0 lg:border-r">
        <BrandLogo className="mb-10" width={150} height={44} />
        <div className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-neutral-600 transition hover:bg-neutral-50 hover:text-neutral-950"
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
        <div className="mt-10 rounded-[28px] border border-neutral-200 bg-neutral-50 p-4">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-5 w-5 text-neutral-900" />
            <p className="text-sm font-medium text-neutral-900">Admin shell</p>
          </div>
          <p className="mt-3 text-sm leading-6 text-neutral-600">
            Tách riêng luồng vận hành, không lẫn với trải nghiệm mua hàng.
          </p>
        </div>
      </aside>

      <div className="flex min-h-screen flex-col">
        <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-neutral-400">Admin</p>
            <h1 className="mt-2 text-xl font-semibold text-neutral-950">CentralTaste Control Room</h1>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-600 transition hover:border-neutral-300 hover:text-neutral-950"
          >
            <Settings className="h-4 w-4" />
            Settings
          </button>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
