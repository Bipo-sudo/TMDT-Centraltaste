'use client';

/**
 * app/admin/dashboard/page.jsx
 *
 * Dashboard chính của admin:
 *   - 4 metric cards (doanh thu, đơn hàng, sản phẩm, khách hàng)
 *   - Mini inventory bar chart (tồn kho theo danh mục)
 *   - Bảng đơn hàng gần đây
 *   - Quick-link sang các trang quản lý
 *
 * Dữ liệu: GET /api/dashboard → { total_revenue_vnd, total_orders,
 *   total_products, total_customers, recent_orders[], category_stocks[] }
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BarChart2,
  Package,
  ShoppingCart,
  Users,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import api from '../../../lib/api';

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
function fmtVnd(v) {
  return Number(v || 0).toLocaleString('vi-VN');
}

function fmtDate(v) {
  if (!v) return '--';
  return new Date(v).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function normalizeStatus(s) {
  return String(s || '').trim().toLowerCase();
}

const STATUS_STYLES = {
  pending:    'border-[rgba(250,204,21,0.25)]   bg-[rgba(250,204,21,0.07)]   text-[rgba(253,224,71,0.85)]',
  processing: 'border-[rgba(147,197,253,0.25)]  bg-[rgba(147,197,253,0.07)]  text-[rgba(147,197,253,0.85)]',
  shipped:    'border-[rgba(167,139,250,0.25)]  bg-[rgba(167,139,250,0.07)]  text-[rgba(196,181,253,0.85)]',
  delivered:  'border-[rgba(134,239,172,0.25)]  bg-[rgba(134,239,172,0.07)]  text-[rgba(134,239,172,0.85)]',
  completed:  'border-[rgba(134,239,172,0.25)]  bg-[rgba(134,239,172,0.07)]  text-[rgba(134,239,172,0.85)]',
  cancelled:  'border-[rgba(248,113,113,0.25)]  bg-[rgba(248,113,113,0.07)]  text-[rgba(248,113,113,0.85)]',
};
function statusStyle(s) {
  return STATUS_STYLES[normalizeStatus(s)] ?? STATUS_STYLES.pending;
}

/* ─────────────────────────────────────────────
   METRIC CARD
───────────────────────────────────────────── */
function MetricCard({ title, value, description, icon: Icon, trend, trendLabel, accent = false }) {
  return (
    <article
      className={
        'relative overflow-hidden rounded-[20px] border p-[20px] ' +
        'bg-[linear-gradient(145deg,#16130e,#11100d)] ' +
        (accent
          ? 'border-[rgba(201,168,76,0.3)]'
          : 'border-[rgba(201,168,76,0.12)]')
      }
    >
      {/* Soft glow top-right */}
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[rgba(201,168,76,0.06)]" />

      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-[9px] uppercase tracking-[0.26em] text-[rgba(240,235,224,0.36)]">
            {title}
          </p>
          <p
            className="mt-[10px] text-[1.9rem] leading-none tracking-[-0.03em] text-[var(--ink)]"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 300 }}
          >
            {value}
          </p>
          <p className="mt-[8px] text-[12px] leading-[1.5] text-[rgba(240,235,224,0.42)]">
            {description}
          </p>
          {trend != null && (
            <span
              className={
                'mt-[10px] inline-flex items-center gap-[4px] rounded-full border px-[8px] py-[2px] text-[10px] ' +
                (trend >= 0
                  ? 'border-[rgba(134,239,172,0.25)] bg-[rgba(134,239,172,0.06)] text-[rgba(134,239,172,0.8)]'
                  : 'border-[rgba(248,113,113,0.25)] bg-[rgba(248,113,113,0.06)] text-[rgba(248,113,113,0.8)]')
              }
            >
              <TrendingUp size={10} strokeWidth={1.8} />
              {trendLabel}
            </span>
          )}
        </div>

        {/* Icon circle */}
        <div className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-full border border-[rgba(201,168,76,0.18)] bg-[rgba(201,168,76,0.07)]">
          <Icon size={15} strokeWidth={1.5} className="text-[var(--gold)]" />
        </div>
      </div>
    </article>
  );
}

/* ─────────────────────────────────────────────
   MINI BAR CHART — tồn kho theo danh mục
   data: [{ label, value, max }]
───────────────────────────────────────────── */
function StockBarChart({ data = [] }) {
  if (!data.length) return null;
  const peak = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="flex h-[72px] items-end gap-[4px] px-[2px]">
      {data.map((d, i) => {
        const pct = Math.max(8, (d.value / peak) * 100);
        const isLow = d.value <= 10;
        return (
          <div key={i} className="group relative flex flex-1 flex-col items-center gap-[4px]">
            {/* Tooltip */}
            <div className="pointer-events-none absolute bottom-[calc(100%+4px)] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-[6px] border border-[rgba(201,168,76,0.2)] bg-[#1a1710] px-[8px] py-[4px] text-[10px] text-[rgba(240,235,224,0.7)] opacity-0 transition-opacity group-hover:opacity-100">
              {d.label}: {d.value}
            </div>
            <div
              className={
                'w-full rounded-[3px_3px_0_0] transition-all duration-300 ' +
                (isLow
                  ? 'bg-[rgba(248,113,113,0.45)]'
                  : 'bg-[rgba(201,168,76,0.35)] group-hover:bg-[rgba(201,168,76,0.6)]')
              }
              style={{ height: `${pct}%` }}
            />
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────
   SECTION HEADER — dùng trong panel
───────────────────────────────────────────── */
function PanelHead({ title, href, linkLabel = 'Xem tất cả' }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[rgba(201,168,76,0.12)] px-[20px] py-[14px]">
      <h3
        className="text-[16px] leading-none text-[var(--ink)]"
        style={{ fontFamily: 'var(--font-display)', fontWeight: 400 }}
      >
        {title}
      </h3>
      {href && (
        <Link
          href={href}
          className="flex items-center gap-[5px] text-[10px] uppercase tracking-[0.1em] text-[rgba(201,168,76,0.65)] transition-all hover:text-[var(--gold)]"
        >
          {linkLabel}
          <ArrowRight size={11} strokeWidth={1.8} />
        </Link>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   SKELETON LOADER
───────────────────────────────────────────── */
function Skeleton({ h = 'h-[14px]', w = 'w-full', className = '' }) {
  return (
    <div
      className={`rounded-[4px] bg-[rgba(255,255,255,0.05)] animate-pulse ${h} ${w} ${className}`}
    />
  );
}

/* ─────────────────────────────────────────────
   PAGE
───────────────────────────────────────────── */
export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_revenue_vnd: 0,
    total_orders: 0,
    total_products: 0,
    total_customers: 0,
    recent_orders: [],
    category_stocks: [], // [{ label, value }] — nếu API chưa trả thì để []
  });

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await api.get('/dashboard');
        const d = data?.data;
        if (!alive || !d) return;
        setStats({
          total_revenue_vnd: Number(d.total_revenue_vnd || 0),
          total_orders:       Number(d.total_orders || 0),
          total_products:     Number(d.total_products || 0),
          total_customers:    Number(d.total_customers || 0),
          recent_orders:      Array.isArray(d.recent_orders) ? d.recent_orders : [],
          category_stocks:    Array.isArray(d.category_stocks) ? d.category_stocks : [],
        });
      } catch (e) {
        console.error('Dashboard fetch error:', e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  /* ── Low-stock warning ── */
  const lowStockCount = stats.category_stocks.filter((c) => c.value <= 10).length;

  return (
    <section className="flex flex-col gap-[22px]">

      {/* ── Page header ── */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[9px] uppercase tracking-[0.28em] text-[rgba(201,168,76,0.6)]">
            Admin / Dashboard
          </p>
          <h1
            className="mt-[6px] text-[2.2rem] leading-[1.05] tracking-[-0.03em] text-[var(--ink)]"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 300 }}
          >
            Bảng điều <em className="italic text-[var(--gold)]">khiển</em>
          </h1>
          <p className="mt-[5px] text-[12px] text-[rgba(240,235,224,0.38)]">
            Theo dõi doanh thu, đơn hàng và hoạt động gần đây.
          </p>
        </div>

        <Link
          href="/admin/products"
          className={
            'flex items-center gap-[6px] rounded-full border border-[rgba(240,235,224,0.12)] ' +
            'px-[16px] py-[8px] text-[11px] uppercase tracking-[0.1em] text-[rgba(240,235,224,0.6)] ' +
            'transition-all hover:border-[rgba(201,168,76,0.35)] hover:text-[var(--gold)]'
          }
        >
          Quản lý sản phẩm
          <ArrowRight size={12} strokeWidth={1.6} />
        </Link>
      </div>

      {/* ── Low stock alert (nếu có) ── */}
      {!loading && lowStockCount > 0 && (
        <div className="flex items-center gap-[10px] rounded-[12px] border border-[rgba(248,113,113,0.25)] bg-[rgba(248,113,113,0.06)] px-[16px] py-[10px]">
          <AlertTriangle size={14} strokeWidth={1.6} className="shrink-0 text-[rgba(248,113,113,0.8)]" />
          <p className="text-[12px] text-[rgba(248,113,113,0.8)]">
            {lowStockCount} danh mục đang ở mức tồn kho thấp. 
            <Link href="/admin/products" className="ml-[6px] underline underline-offset-2 hover:text-[rgba(248,113,113,1)]">
              Kiểm tra ngay
            </Link>
          </p>
        </div>
      )}

      {/* ── Metric cards ── */}
      {loading ? (
        <div className="grid grid-cols-4 gap-[10px]">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-[20px] border border-[rgba(201,168,76,0.12)] bg-[rgba(255,255,255,0.02)] p-[20px]">
              <Skeleton h="h-[9px]" w="w-[60%]" />
              <Skeleton h="h-[32px]" w="w-[70%]" className="mt-[14px]" />
              <Skeleton h="h-[11px]" w="w-[85%]" className="mt-[10px]" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-[10px] xl:grid-cols-4">
          <MetricCard
            title="Doanh thu"
            value={`${fmtVnd(stats.total_revenue_vnd)} ₫`}
            description="Tổng doanh thu tích lũy từ các đơn đã ghi nhận."
            icon={BarChart2}
            accent
            trend={1}
            trendLabel="Đang tăng trưởng"
          />
          <MetricCard
            title="Đơn hàng"
            value={fmtVnd(stats.total_orders)}
            description="Tổng số đơn hàng trong hệ thống."
            icon={ShoppingCart}
          />
          <MetricCard
            title="Sản phẩm"
            value={fmtVnd(stats.total_products)}
            description="Tổng số sản phẩm đang quản lý."
            icon={Package}
          />
          <MetricCard
            title="Khách hàng"
            value={fmtVnd(stats.total_customers)}
            description="Tài khoản khách hàng đã phát sinh đơn."
            icon={Users}
          />
        </div>
      )}

      {/* ── Content row: orders + stock chart ── */}
      <div className="grid grid-cols-[1fr_300px] gap-[14px]">

        {/* Orders table */}
        <div className="overflow-hidden rounded-[20px] border border-[rgba(201,168,76,0.12)] bg-[rgba(255,255,255,0.02)]">
          <PanelHead title="Đơn hàng gần đây" href="/admin/orders" />

          {loading ? (
            <div className="flex flex-col gap-[12px] p-[20px]">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-[12px]">
                  <Skeleton h="h-[28px]" w="w-[28px]" className="rounded-full shrink-0" />
                  <div className="flex flex-1 flex-col gap-[6px]">
                    <Skeleton h="h-[11px]" w="w-[40%]" />
                    <Skeleton h="h-[10px]" w="w-[60%]" />
                  </div>
                  <Skeleton h="h-[11px]" w="w-[80px]" />
                </div>
              ))}
            </div>
          ) : stats.recent_orders.length === 0 ? (
            <div className="px-[20px] py-[40px] text-center text-[12px] text-[rgba(240,235,224,0.36)]">
              Chưa có đơn hàng nào.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-separate border-spacing-0 text-left">
                <thead>
                  <tr className="text-[9px] uppercase tracking-[0.26em] text-[rgba(240,235,224,0.3)]">
                    {['Mã đơn', 'Ngày đặt', 'Khách hàng', 'Tổng tiền', 'Trạng thái', ''].map((h) => (
                      <th key={h} className="border-b border-[rgba(201,168,76,0.1)] px-[16px] py-[12px] font-medium">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stats.recent_orders.map((order) => {
                    const status = normalizeStatus(order.order_status);
                    return (
                      <tr
                        key={order.id}
                        className="text-[12px] text-[rgba(240,235,224,0.65)] transition-colors hover:bg-[rgba(201,168,76,0.03)]"
                      >
                        <td className="border-b border-[rgba(201,168,76,0.07)] px-[16px] py-[12px] font-medium text-[var(--ink)]">
                          {order.id}
                        </td>
                        <td className="border-b border-[rgba(201,168,76,0.07)] px-[16px] py-[12px] text-[rgba(240,235,224,0.48)]">
                          {fmtDate(order.created_at)}
                        </td>
                        <td className="border-b border-[rgba(201,168,76,0.07)] px-[16px] py-[12px]">
                          <p className="font-medium text-[var(--ink)]">
                            {order.user_full_name || 'Khách hàng'}
                          </p>
                          <p className="text-[10px] text-[rgba(240,235,224,0.36)]">
                            {order.user_email || '--'}
                          </p>
                        </td>
                        <td className="border-b border-[rgba(201,168,76,0.07)] px-[16px] py-[12px]">
                          {fmtVnd(order.total_amount_vnd)} ₫
                        </td>
                        <td className="border-b border-[rgba(201,168,76,0.07)] px-[16px] py-[12px]">
                          <span
                            className={`inline-flex rounded-full border px-[8px] py-[2px] text-[9px] font-medium capitalize ${statusStyle(status)}`}
                          >
                            {status || 'pending'}
                          </span>
                        </td>
                        <td className="border-b border-[rgba(201,168,76,0.07)] px-[16px] py-[12px] text-right">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="flex items-center justify-end gap-[4px] text-[10px] uppercase tracking-[0.08em] text-[rgba(240,235,224,0.4)] transition-colors hover:text-[var(--gold)]"
                          >
                            Chi tiết
                            <ArrowRight size={10} strokeWidth={1.8} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right column: stock chart + quick links */}
        <div className="flex flex-col gap-[14px]">

          {/* Stock chart panel */}
          <div className="overflow-hidden rounded-[20px] border border-[rgba(201,168,76,0.12)] bg-[rgba(255,255,255,0.02)]">
            <PanelHead title="Tồn kho" href="/admin/products" linkLabel="Quản lý" />
            <div className="px-[16px] pb-[14px] pt-[12px]">
              {loading ? (
                <div className="flex h-[72px] items-end gap-[4px]">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton
                      key={i}
                      h={`h-[${30 + i * 8}%]`}
                      w="w-full"
                      className="rounded-[3px_3px_0_0]"
                    />
                  ))}
                </div>
              ) : stats.category_stocks.length > 0 ? (
                <>
                  <StockBarChart data={stats.category_stocks} />
                  <div className="mt-[8px] flex flex-wrap gap-x-[10px] gap-y-[4px]">
                    {stats.category_stocks.map((c, i) => (
                      <span key={i} className="text-[9px] text-[rgba(240,235,224,0.3)]">
                        {c.label}
                      </span>
                    ))}
                  </div>
                </>
              ) : (
                <p className="py-[24px] text-center text-[11px] text-[rgba(240,235,224,0.3)]">
                  Chưa có dữ liệu tồn kho.
                </p>
              )}
            </div>
          </div>

          {/* Quick links */}
          <div className="overflow-hidden rounded-[20px] border border-[rgba(201,168,76,0.12)] bg-[rgba(255,255,255,0.02)]">
            <PanelHead title="Truy cập nhanh" />
            <div className="flex flex-col divide-y divide-[rgba(201,168,76,0.08)]">
              {[
                { href: '/admin/products/new', label: 'Thêm sản phẩm mới',  icon: Package      },
                { href: '/admin/orders',        label: 'Quản lý đơn hàng',   icon: ShoppingCart },
                { href: '/admin/customers',     label: 'Danh sách khách hàng', icon: Users      },
              ].map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-[10px] px-[16px] py-[12px] text-[12px] text-[rgba(240,235,224,0.55)] transition-all hover:bg-[rgba(201,168,76,0.04)] hover:text-[var(--gold)]"
                >
                  <Icon size={13} strokeWidth={1.5} className="shrink-0 opacity-60" />
                  {label}
                  <ArrowRight size={11} strokeWidth={1.6} className="ml-auto opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>

    </section>
  );
}