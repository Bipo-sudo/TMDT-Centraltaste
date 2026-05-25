'use client';

/**
 * app/admin/layout.jsx
 *
 * Admin shell layout — sidebar cố định 224px + topbar 52px.
 * Nút "Giao diện khách" chỉ render khi session.user.role === 'admin'.
 *
 * Phụ thuộc:
 *   - next-auth/react  (useSession)
 *   - next/navigation  (usePathname)
 *   - lucide-react
 *   - globals.css      (CSS variables đã có sẵn)
 */

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Tag,
  BarChart2,
  Settings,
  LogOut,
  ArrowLeftRight,
  Bell,
  Layers,
} from 'lucide-react';

/* ─────────────────────────────────────────────
   NAV CONFIG
───────────────────────────────────────────── */
const NAV_PRIMARY = [
  { href: '/admin/dashboard', label: 'Bảng điều khiển', icon: LayoutDashboard },
  { href: '/admin/products',  label: 'Sản phẩm',        icon: Package },
  { href: '/admin/orders',    label: 'Đơn hàng',         icon: ShoppingCart },
  { href: '/admin/customers', label: 'Khách hàng',       icon: Users },
];

const NAV_SECONDARY = [
  { href: '/admin/categories', label: 'Danh mục',    icon: Layers,    soon: false },
  { href: '/admin/coupons',    label: 'Mã giảm giá', icon: Tag,       soon: true  },
  { href: '/admin/analytics',  label: 'Phân tích',   icon: BarChart2, soon: true  },
  { href: '/admin/settings',   label: 'Cài đặt',     icon: Settings,  soon: false },
];

/* ─────────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────────── */
function NavItem({ href, label, icon: Icon, soon = false, active = false }) {
  const base =
    'group flex items-center gap-[10px] px-[22px] py-[8px] text-[12px] tracking-[0.02em] ' +
    'border-l-2 transition-all duration-150 select-none';

  const state = active
    ? 'border-l-[var(--gold)] bg-[rgba(201,168,76,0.06)] text-[var(--gold)]'
    : soon
    ? 'border-l-transparent text-[rgba(240,235,224,0.28)] cursor-default pointer-events-none'
    : 'border-l-transparent text-[rgba(240,235,224,0.36)] hover:text-[rgba(240,235,224,0.72)] hover:bg-[rgba(255,255,255,0.02)] cursor-pointer';

  return (
    <Link
      href={soon ? '#' : href}
      tabIndex={soon ? -1 : undefined}
      aria-disabled={soon}
      className={`${base} ${state}`}
    >
      <Icon
        className="shrink-0 transition-opacity duration-150"
        size={15}
        strokeWidth={1.5}
        style={{ opacity: active ? 1 : soon ? 0.35 : 0.6 }}
      />
      <span className="flex-1 leading-none">{label}</span>
      {soon && (
        <span className="ml-auto text-[9px] italic tracking-[0.06em] text-[rgba(240,235,224,0.26)]">
          sắp ra
        </span>
      )}
    </Link>
  );
}

function SectionLabel({ children }) {
  return (
    <p className="px-[22px] pb-[6px] pt-[18px] text-[9px] uppercase tracking-[0.26em] text-[rgba(240,235,224,0.3)]">
      {children}
    </p>
  );
}

function Rule() {
  return <div className="mx-[22px] my-[8px] h-px bg-[rgba(201,168,76,0.12)]" />;
}

/* ─────────────────────────────────────────────
   TOPBAR ICON BUTTON
───────────────────────────────────────────── */
function IconBtn({ children, label, hasPip = false }) {
  return (
    <button
      aria-label={label}
      className={
        'relative flex h-[30px] w-[30px] items-center justify-center rounded-full ' +
        'border border-[rgba(201,168,76,0.12)] bg-transparent text-[rgba(240,235,224,0.36)] ' +
        'transition-all duration-150 hover:border-[rgba(201,168,76,0.35)] hover:text-[rgba(240,235,224,0.7)]'
      }
    >
      {children}
      {hasPip && (
        <span className="absolute right-[6px] top-[6px] h-[5px] w-[5px] rounded-full bg-[var(--gold)]" />
      )}
    </button>
  );
}

/* ─────────────────────────────────────────────
   MAIN LAYOUT
───────────────────────────────────────────── */
export default function AdminLayout({ children }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const isAdmin = session?.user?.role === 'admin';

  /* breadcrumb: lấy segment cuối */
  const segments = (pathname || '').split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1] ?? 'admin';
  const breadcrumbLabel =
    lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);

  return (
    <div
      className="grid h-screen overflow-hidden"
      style={{ gridTemplateColumns: '224px 1fr', gridTemplateRows: '52px 1fr' }}
    >
      {/* ══════════════════════════════════════
          TOPBAR  (spans full width)
      ══════════════════════════════════════ */}
      <header
        className="col-span-2 flex items-center border-b border-[rgba(201,168,76,0.12)] bg-[var(--bg-2)]"
        style={{ gridColumn: '1 / -1' }}
      >
        {/* Brand */}
        <div className="flex h-full w-[224px] shrink-0 items-center gap-[10px] border-r border-[rgba(201,168,76,0.12)] px-[22px]">
          <div className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full border border-[rgba(201,168,76,0.4)]">
            {/* Diamond mark — svg inline */}
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
              <polygon
                points="8,2 14,8 8,14 2,8"
                stroke="var(--gold)"
                strokeWidth="1.4"
              />
            </svg>
          </div>
          <div>
            <p
              className="text-[14px] leading-none tracking-[0.04em] text-[var(--ink)]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              CentralTaste
            </p>
            <p className="mt-[2px] text-[9px] uppercase tracking-[0.22em] text-[rgba(240,235,224,0.3)]">
              Quản trị
            </p>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="flex flex-1 items-center gap-[6px] px-[22px]">
          <span className="text-[11px] text-[rgba(240,235,224,0.3)]">Admin</span>
          <span className="text-[rgba(240,235,224,0.16)]">›</span>
          <span className="text-[11px] text-[rgba(240,235,224,0.6)]">
            {breadcrumbLabel}
          </span>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-[8px] px-[20px]">
          {/* Switch interface — CHỈ HIỆN VỚI ADMIN */}
          {isAdmin && (
            <Link
              href="/"
              className={
                'flex h-[30px] items-center gap-[7px] rounded-full ' +
                'border border-[rgba(201,168,76,0.35)] bg-[rgba(201,168,76,0.06)] ' +
                'px-[13px] text-[10px] uppercase tracking-[0.14em] text-[var(--gold)] ' +
                'transition-all duration-150 hover:bg-[rgba(201,168,76,0.12)] hover:border-[rgba(201,168,76,0.6)] ' +
                'whitespace-nowrap'
              }
            >
              <ArrowLeftRight size={13} strokeWidth={1.6} />
              Giao diện khách
            </Link>
          )}

          {/* Divider */}
          <div className="mx-[2px] h-[18px] w-px bg-[rgba(201,168,76,0.12)]" />

          {/* Notification */}
          <IconBtn label="Thông báo" hasPip>
            <Bell size={14} strokeWidth={1.5} />
          </IconBtn>

          {/* Avatar */}
          <button
            aria-label="Tài khoản"
            className={
              'flex h-[30px] w-[30px] items-center justify-center rounded-full ' +
              'border border-[rgba(201,168,76,0.4)] bg-[rgba(201,168,76,0.08)] ' +
              'text-[10px] font-bold tracking-[0.04em] text-[var(--gold)] ' +
              'transition-all duration-150 hover:bg-[rgba(201,168,76,0.16)]'
            }
          >
            {session?.user?.name
              ? session.user.name.slice(0, 2).toUpperCase()
              : 'AD'}
          </button>
        </div>
      </header>

      {/* ══════════════════════════════════════
          SIDEBAR
      ══════════════════════════════════════ */}
      <aside className="flex flex-col overflow-y-auto border-r border-[rgba(201,168,76,0.12)] bg-[var(--bg-2)] pb-0 pt-[8px]">
        <SectionLabel>Tổng quan</SectionLabel>
        {NAV_PRIMARY.map((item) => (
          <NavItem
            key={item.href}
            {...item}
            active={
              item.href === '/admin/dashboard'
                ? pathname === item.href
                : pathname?.startsWith(item.href)
            }
          />
        ))}

        <Rule />
        <SectionLabel>Quản lý</SectionLabel>
        {NAV_SECONDARY.map((item) => (
          <NavItem
            key={item.href}
            {...item}
            active={pathname?.startsWith(item.href)}
          />
        ))}

        {/* Footer */}
        <div className="mt-auto border-t border-[rgba(201,168,76,0.12)] px-[22px] py-[14px]">
          <div className="flex items-center gap-[9px]">
            {/* User avatar */}
            <div className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-full border border-[rgba(201,168,76,0.4)] bg-[rgba(201,168,76,0.08)] text-[9px] font-bold text-[var(--gold)]">
              {session?.user?.name
                ? session.user.name.slice(0, 2).toUpperCase()
                : 'AD'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-[12px] text-[rgba(240,235,224,0.7)]">
                {session?.user?.name || 'Admin'}
              </p>
              <p className="text-[9px] uppercase tracking-[0.08em] text-[var(--gold)] opacity-80">
                Quản trị viên
              </p>
            </div>
            {/* Logout */}
            <button
              aria-label="Đăng xuất"
              onClick={() => signOut({ callbackUrl: '/' })}
              className={
                'flex h-[26px] w-[26px] items-center justify-center rounded-full ' +
                'border border-[rgba(240,235,224,0.1)] bg-transparent ' +
                'text-[rgba(240,235,224,0.3)] transition-all duration-150 ' +
                'hover:border-[rgba(240,235,224,0.25)] hover:text-[rgba(240,235,224,0.7)]'
              }
            >
              <LogOut size={12} strokeWidth={1.6} />
            </button>
          </div>
        </div>
      </aside>

      {/* ══════════════════════════════════════
          MAIN CONTENT AREA
      ══════════════════════════════════════ */}
      <main className="overflow-y-auto bg-[var(--bg)] p-[26px_28px]">
        {children}
      </main>
    </div>
  );
}