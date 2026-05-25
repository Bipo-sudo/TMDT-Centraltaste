'use client';

/**
 * app/admin/products/page.jsx
 *
 * Trang danh sách sản phẩm:
 *   - Tab filter: Tất cả / Đang bán / Sắp hết (≤10) / Hết kho (=0)
 *   - Search real-time (client-side)
 *   - Bulk select + bulk delete
 *   - Grid card với drag-and-drop (thứ tự hiển thị — dùng @dnd-kit/core)
 *   - Nút "Thêm sản phẩm" → /admin/products/new
 *   - Confirm modal xóa
 *
 * Cài thêm nếu chưa có:  npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
 */

import { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Plus, Search, Upload, Trash2, PencilLine,
  LayoutGrid, List, AlertTriangle, X,
} from 'lucide-react';
import api from '../../../lib/api';
import AdminProductCard from '../../../components/admin/AdminProductCard';

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
const TABS = [
  { key: 'all',      label: 'Tất cả'   },
  { key: 'active',   label: 'Đang bán' },
  { key: 'low',      label: 'Sắp hết'  },
  { key: 'empty',    label: 'Hết kho'  },
];

function applyTab(products, tab) {
  if (tab === 'active') return products.filter((p) => Number(p.stock) > 10);
  if (tab === 'low')    return products.filter((p) => Number(p.stock) > 0 && Number(p.stock) <= 10);
  if (tab === 'empty')  return products.filter((p) => Number(p.stock) === 0);
  return products;
}

function applySearch(products, q) {
  const query = q.trim().toLowerCase();
  if (!query) return products;
  return products.filter((p) =>
    [p.name_vi, p.name_en, p.category_slug, p.id, p.summary_vi]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(query))
  );
}

/* ─────────────────────────────────────────────
   SKELETON CARD
───────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-[18px] border border-[rgba(201,168,76,0.1)] bg-[rgba(255,255,255,0.02)]">
      <div className="aspect-[4/3] animate-pulse bg-[rgba(255,255,255,0.05)]" />
      <div className="flex flex-col gap-[8px] p-[14px]">
        <div className="h-[10px] w-[55%] animate-pulse rounded bg-[rgba(255,255,255,0.05)]" />
        <div className="h-[10px] w-[80%] animate-pulse rounded bg-[rgba(255,255,255,0.04)]" />
        <div className="mt-[4px] h-[10px] w-[40%] animate-pulse rounded bg-[rgba(255,255,255,0.04)]" />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   SORTABLE WRAPPER (dnd-kit)
───────────────────────────────────────────── */
function SortableCard({ product, ...rest }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: product.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <AdminProductCard
        product={product}
        isDragging={isDragging}
        dragHandleProps={listeners}
        {...rest}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────
   DELETE CONFIRM MODAL
───────────────────────────────────────────── */
function DeleteModal({ count = 1, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.7)] backdrop-blur-[2px]">
      <div className="w-full max-w-[380px] overflow-hidden rounded-[24px] border border-[rgba(248,113,113,0.25)] bg-[#131108] shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
        <div className="flex items-start gap-[14px] p-[24px]">
          <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full border border-[rgba(248,113,113,0.25)] bg-[rgba(248,113,113,0.08)]">
            <AlertTriangle size={16} strokeWidth={1.6} className="text-[rgba(248,113,113,0.8)]" />
          </div>
          <div>
            <h3
              className="text-[18px] font-light leading-snug text-[var(--ink)]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Xác nhận xóa
            </h3>
            <p className="mt-[6px] text-[12px] leading-[1.65] text-[rgba(240,235,224,0.5)]">
              Bạn sắp xóa <strong className="text-[rgba(240,235,224,0.8)]">{count} sản phẩm</strong>.
              Hành động này không thể hoàn tác.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-[8px] border-t border-[rgba(255,255,255,0.06)] px-[24px] py-[16px]">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex h-[34px] items-center rounded-full border border-[rgba(240,235,224,0.12)] px-[16px] text-[11px] uppercase tracking-[0.1em] text-[rgba(240,235,224,0.55)] transition-all hover:border-[rgba(240,235,224,0.25)] hover:text-[rgba(240,235,224,0.8)]"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex h-[34px] items-center gap-[6px] rounded-full border border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.1)] px-[16px] text-[11px] uppercase tracking-[0.1em] text-[rgba(248,113,113,0.85)] transition-all hover:bg-[rgba(248,113,113,0.18)] disabled:opacity-50"
          >
            <Trash2 size={12} strokeWidth={1.8} />
            {loading ? 'Đang xóa...' : 'Xóa'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PAGE
───────────────────────────────────────────── */
export default function AdminProductsPage() {
  const router = useRouter();

  const [products, setProducts]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [tab, setTab]                 = useState('all');
  const [search, setSearch]           = useState('');
  const [viewMode, setViewMode]       = useState('grid'); // 'grid' | 'list'
  const [selected, setSelected]       = useState(new Set());
  const [deleteTarget, setDeleteTarget] = useState(null); // null | 'bulk' | productId
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast]             = useState('');

  /* sensors cho dnd */
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  /* ── Fetch ── */
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await api.get('/products');
        if (alive) setProducts(Array.isArray(data?.data) ? data.data : []);
      } catch (e) {
        console.error('Products fetch error:', e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  /* ── Toast auto-dismiss ── */
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  /* ── Filtered list ── */
  const filtered = useMemo(() => applySearch(applyTab(products, tab), search), [products, tab, search]);

  /* Tab counts */
  const counts = useMemo(() => ({
    all:    products.length,
    active: products.filter((p) => Number(p.stock) > 10).length,
    low:    products.filter((p) => Number(p.stock) > 0 && Number(p.stock) <= 10).length,
    empty:  products.filter((p) => Number(p.stock) === 0).length,
  }), [products]);

  /* ── Select handlers ── */
  const handleSelect = useCallback((id, checked) => {
    setSelected((prev) => {
      const next = new Set(prev);
      checked ? next.add(id) : next.delete(id);
      return next;
    });
  }, []);

  const handleSelectAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((p) => p.id)));
  };

  /* ── Delete ── */
  async function execDelete(ids) {
    setDeleteLoading(true);
    try {
      await Promise.all(ids.map((id) => api.delete(`/products/${id}`)));
      setProducts((prev) => prev.filter((p) => !ids.includes(p.id)));
      setSelected((prev) => {
        const next = new Set(prev);
        ids.forEach((id) => next.delete(id));
        return next;
      });
      setToast(`Đã xóa ${ids.length} sản phẩm`);
    } catch (e) {
      setToast('Xóa thất bại, vui lòng thử lại');
    } finally {
      setDeleteLoading(false);
      setDeleteTarget(null);
    }
  }

  function handleDeleteOne(id) { setDeleteTarget(id); }
  function handleDeleteBulk()  { setDeleteTarget('bulk'); }

  function confirmDelete() {
    if (deleteTarget === 'bulk') execDelete([...selected]);
    else execDelete([deleteTarget]);
  }

  /* ── DnD ── */
  function handleDragEnd({ active, over }) {
    if (!over || active.id === over.id) return;
    setProducts((prev) => {
      const oldIdx = prev.findIndex((p) => p.id === active.id);
      const newIdx = prev.findIndex((p) => p.id === over.id);
      return arrayMove(prev, oldIdx, newIdx);
    });
    // TODO: gọi API PATCH /products/reorder nếu backend hỗ trợ
  }

  /* ── Navigate to edit ── */
  function handleEdit(product) {
    router.push(`/admin/products/${product.id}/edit`);
  }

  /* ─────────────────────────────────────────
     RENDER
  ───────────────────────────────────────── */
  return (
    <>
      {/* Delete modal */}
      {deleteTarget && (
        <DeleteModal
          count={deleteTarget === 'bulk' ? selected.size : 1}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-[24px] right-[24px] z-50 flex items-center gap-[10px] rounded-[12px] border border-[rgba(201,168,76,0.25)] bg-[#1a1710] px-[16px] py-[12px] text-[12px] text-[rgba(240,235,224,0.8)] shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
          {toast}
          <button onClick={() => setToast('')} className="text-[rgba(240,235,224,0.4)] hover:text-[rgba(240,235,224,0.8)]">
            <X size={13} />
          </button>
        </div>
      )}

      <section className="flex flex-col gap-[20px]">

        {/* ── Page header ── */}
        <div className="flex items-end justify-between gap-[16px]">
          <div>
            <p className="text-[9px] uppercase tracking-[0.28em] text-[rgba(201,168,76,0.6)]">
              Admin / Sản phẩm
            </p>
            <h1
              className="mt-[6px] text-[2.1rem] leading-[1.05] tracking-[-0.03em] text-[var(--ink)]"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 300 }}
            >
              Quản lý <em className="italic text-[var(--gold)]">sản phẩm</em>
            </h1>
            <p className="mt-[4px] text-[12px] text-[rgba(240,235,224,0.38)]">
              Kéo thả để sắp xếp · chỉnh sửa nhanh · thêm mới hàng loạt.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-[8px]">
            {/* Import CSV — chức năng đang phát triển */}
            <button
              type="button"
              title="Nhập CSV — đang phát triển"
              className="flex h-[34px] items-center gap-[6px] rounded-full border border-[rgba(240,235,224,0.1)] px-[14px] text-[11px] uppercase tracking-[0.1em] text-[rgba(240,235,224,0.4)] transition-all hover:border-[rgba(240,235,224,0.2)] hover:text-[rgba(240,235,224,0.65)] disabled:cursor-not-allowed"
              disabled
            >
              <Upload size={12} strokeWidth={1.6} />
              Nhập CSV
              <span className="rounded-full border border-[rgba(240,235,224,0.1)] px-[5px] py-[1px] text-[8px] text-[rgba(240,235,224,0.3)]">
                sắp ra
              </span>
            </button>

            <Link
              href="/admin/products/new"
              className="flex h-[34px] items-center gap-[6px] rounded-full bg-[var(--gold)] px-[18px] text-[11px] font-semibold uppercase tracking-[0.1em] text-[#1a1208] transition-opacity hover:opacity-88"
            >
              <Plus size={13} strokeWidth={2.2} />
              Thêm sản phẩm
            </Link>
          </div>
        </div>

        {/* ── Toolbar: search + view toggle ── */}
        <div className="flex items-center gap-[10px]">
          {/* Search */}
          <div className="flex flex-1 items-center gap-[8px] rounded-full border border-[rgba(201,168,76,0.14)] bg-[rgba(255,255,255,0.02)] px-[14px] py-[8px] transition-colors focus-within:border-[rgba(201,168,76,0.35)]">
            <Search size={13} strokeWidth={1.5} className="shrink-0 text-[rgba(240,235,224,0.3)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên, danh mục, mã sản phẩm..."
              className="w-full bg-transparent text-[12px] text-[var(--ink)] outline-none placeholder:text-[rgba(240,235,224,0.28)]"
            />
            {search && (
              <button onClick={() => setSearch('')} className="shrink-0 text-[rgba(240,235,224,0.3)] hover:text-[rgba(240,235,224,0.7)]">
                <X size={12} />
              </button>
            )}
          </div>

          {/* View toggle */}
          <div className="flex overflow-hidden rounded-[8px] border border-[rgba(201,168,76,0.14)]">
            {[
              { mode: 'grid', Icon: LayoutGrid },
              { mode: 'list', Icon: List },
            ].map(({ mode, Icon }) => (
              <button
                key={mode}
                type="button"
                aria-label={mode === 'grid' ? 'Dạng lưới' : 'Dạng danh sách'}
                onClick={() => setViewMode(mode)}
                className={[
                  'flex h-[34px] w-[38px] items-center justify-center transition-all',
                  viewMode === mode
                    ? 'bg-[rgba(201,168,76,0.12)] text-[var(--gold)]'
                    : 'bg-transparent text-[rgba(240,235,224,0.35)] hover:text-[rgba(240,235,224,0.65)]',
                ].join(' ')}
              >
                <Icon size={14} strokeWidth={1.5} />
              </button>
            ))}
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex border-b border-[rgba(201,168,76,0.12)]">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => { setTab(key); setSelected(new Set()); }}
              className={[
                'flex items-center gap-[6px] px-[16px] py-[10px] text-[11px] uppercase tracking-[0.08em]',
                'border-b-[2px] -mb-px transition-colors',
                tab === key
                  ? 'border-[var(--gold)] text-[var(--gold)]'
                  : 'border-transparent text-[rgba(240,235,224,0.35)] hover:text-[rgba(240,235,224,0.6)]',
              ].join(' ')}
            >
              {label}
              <span
                className={[
                  'rounded-full border px-[6px] py-[1px] text-[9px]',
                  tab === key
                    ? 'border-[rgba(201,168,76,0.35)] bg-[rgba(201,168,76,0.1)] text-[rgba(201,168,76,0.85)]'
                    : 'border-[rgba(240,235,224,0.1)] text-[rgba(240,235,224,0.3)]',
                ].join(' ')}
              >
                {counts[key]}
              </span>
            </button>
          ))}
        </div>

        {/* ── Bulk action bar (conditional) ── */}
        {selected.size > 0 && (
          <div className="flex items-center gap-[10px] rounded-[12px] border border-[rgba(201,168,76,0.2)] bg-[rgba(201,168,76,0.05)] px-[16px] py-[10px]">
            <button
              type="button"
              onClick={handleSelectAll}
              className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[4px] border border-[rgba(201,168,76,0.5)] bg-[rgba(201,168,76,0.15)]"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M2 5l2 2 4-4" stroke="var(--gold)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <p className="flex-1 text-[12px] text-[rgba(201,168,76,0.8)]">
              {selected.size} sản phẩm được chọn
            </p>
            <button
              type="button"
              onClick={() => {
                /* bulk edit — đang phát triển */
              }}
              title="Đang phát triển"
              disabled
              className="flex h-[30px] items-center gap-[5px] rounded-full border border-[rgba(201,168,76,0.2)] px-[12px] text-[10px] uppercase tracking-[0.1em] text-[rgba(201,168,76,0.5)] disabled:cursor-not-allowed"
            >
              <PencilLine size={11} strokeWidth={1.6} />
              Sửa loạt
              <span className="rounded-full border border-[rgba(240,235,224,0.1)] px-[4px] text-[8px] text-[rgba(240,235,224,0.25)]">
                sắp ra
              </span>
            </button>
            <button
              type="button"
              onClick={handleDeleteBulk}
              className="flex h-[30px] items-center gap-[5px] rounded-full border border-[rgba(248,113,113,0.25)] px-[12px] text-[10px] uppercase tracking-[0.1em] text-[rgba(248,113,113,0.7)] transition-all hover:bg-[rgba(248,113,113,0.08)]"
            >
              <Trash2 size={11} strokeWidth={1.6} />
              Xóa ({selected.size})
            </button>
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="ml-[2px] text-[rgba(240,235,224,0.3)] hover:text-[rgba(240,235,224,0.7)]"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* ── Product grid / list ── */}
        {loading ? (
          <div className="grid grid-cols-2 gap-[12px] sm:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-[10px] rounded-[20px] border border-dashed border-[rgba(201,168,76,0.15)] py-[60px] text-center">
            <p className="text-[12px] text-[rgba(240,235,224,0.36)]">
              {search ? 'Không tìm thấy sản phẩm phù hợp.' : 'Chưa có sản phẩm nào trong danh mục này.'}
            </p>
            {!search && (
              <Link
                href="/admin/products/new"
                className="mt-[4px] flex items-center gap-[5px] text-[11px] uppercase tracking-[0.1em] text-[rgba(201,168,76,0.6)] hover:text-[var(--gold)]"
              >
                <Plus size={11} strokeWidth={2} />
                Thêm sản phẩm đầu tiên
              </Link>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={filtered.map((p) => p.id)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-2 gap-[12px] sm:grid-cols-3 xl:grid-cols-4">
                {filtered.map((product) => (
                  <SortableCard
                    key={product.id}
                    product={product}
                    selected={selected.has(product.id)}
                    onSelect={handleSelect}
                    onEdit={handleEdit}
                    onDelete={handleDeleteOne}
                  />
                ))}

                {/* Add new card */}
                <Link
                  href="/admin/products/new"
                  className="flex min-h-[200px] flex-col items-center justify-center gap-[8px] rounded-[18px] border border-dashed border-[rgba(240,235,224,0.08)] text-[rgba(240,235,224,0.3)] transition-all hover:border-[rgba(201,168,76,0.25)] hover:text-[rgba(201,168,76,0.55)]"
                >
                  <Plus size={20} strokeWidth={1.2} />
                  <span className="text-[10px] uppercase tracking-[0.14em]">Thêm mới</span>
                </Link>
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          /* ── List view ── */
          <div className="overflow-hidden rounded-[20px] border border-[rgba(201,168,76,0.12)] bg-[rgba(255,255,255,0.02)]">
            <table className="w-full border-separate border-spacing-0 text-left">
              <thead>
                <tr className="text-[9px] uppercase tracking-[0.24em] text-[rgba(240,235,224,0.3)]">
                  <th className="border-b border-[rgba(201,168,76,0.1)] px-[16px] py-[12px] font-medium w-[36px]">
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className={[
                        'flex h-[16px] w-[16px] items-center justify-center rounded-[3px] border transition-all',
                        selected.size === filtered.length && filtered.length > 0
                          ? 'border-[rgba(201,168,76,0.6)] bg-[rgba(201,168,76,0.15)]'
                          : 'border-[rgba(240,235,224,0.18)]',
                      ].join(' ')}
                    >
                      {selected.size === filtered.length && filtered.length > 0 && (
                        <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5l2 2 4-4" stroke="var(--gold)" strokeWidth="1.8" strokeLinecap="round" />
                        </svg>
                      )}
                    </button>
                  </th>
                  {['Sản phẩm', 'Danh mục', 'Giá', 'Kho', 'Trạng thái', ''].map((h) => (
                    <th key={h} className="border-b border-[rgba(201,168,76,0.1)] px-[14px] py-[12px] font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => {
                  const stock = Number(product.stock || 0);
                  const dotCls = stock === 0
                    ? 'bg-[rgba(248,113,113,0.7)]'
                    : stock <= 10
                    ? 'bg-[rgba(250,204,21,0.7)]'
                    : 'bg-[rgba(134,239,172,0.65)]';
                  const stockLabel = stock === 0 ? 'Hết kho' : stock <= 10 ? 'Sắp hết' : 'Còn hàng';

                  return (
                    <tr
                      key={product.id}
                      className="text-[12px] text-[rgba(240,235,224,0.62)] transition-colors hover:bg-[rgba(201,168,76,0.03)]"
                    >
                      <td className="border-b border-[rgba(201,168,76,0.07)] px-[16px] py-[12px]">
                        <button
                          type="button"
                          onClick={() => handleSelect(product.id, !selected.has(product.id))}
                          className={[
                            'flex h-[16px] w-[16px] items-center justify-center rounded-[3px] border transition-all',
                            selected.has(product.id)
                              ? 'border-[rgba(201,168,76,0.6)] bg-[rgba(201,168,76,0.15)]'
                              : 'border-[rgba(240,235,224,0.16)]',
                          ].join(' ')}
                        >
                          {selected.has(product.id) && (
                            <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                              <path d="M2 5l2 2 4-4" stroke="var(--gold)" strokeWidth="1.8" strokeLinecap="round" />
                            </svg>
                          )}
                        </button>
                      </td>
                      <td className="border-b border-[rgba(201,168,76,0.07)] px-[14px] py-[12px]">
                        <div className="flex items-center gap-[10px]">
                          <div className="h-[40px] w-[40px] shrink-0 overflow-hidden rounded-[8px] border border-[rgba(201,168,76,0.1)] bg-[#1c1810]">
                            {product.main_image_url
                              ? <img src={product.main_image_url} alt={product.name_vi} className="h-full w-full object-cover" />
                              : <div className="flex h-full items-center justify-center text-[rgba(201,168,76,0.2)]">◆</div>
                            }
                          </div>
                          <div>
                            <p className="font-medium text-[var(--ink)]">{product.name_vi}</p>
                            <p className="text-[10px] text-[rgba(240,235,224,0.35)]">{product.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="border-b border-[rgba(201,168,76,0.07)] px-[14px] py-[12px] text-[rgba(240,235,224,0.45)]">
                        {product.category_name_vi || product.category_slug}
                      </td>
                      <td className="border-b border-[rgba(201,168,76,0.07)] px-[14px] py-[12px] font-medium text-[var(--ink)]">
                        {Number(product.price_vnd || 0).toLocaleString('vi-VN')} ₫
                      </td>
                      <td className="border-b border-[rgba(201,168,76,0.07)] px-[14px] py-[12px]">
                        {stock}
                      </td>
                      <td className="border-b border-[rgba(201,168,76,0.07)] px-[14px] py-[12px]">
                        <span className="flex items-center gap-[6px]">
                          <span className={`h-[7px] w-[7px] rounded-full ${dotCls}`} />
                          <span className="text-[10px]">{stockLabel}</span>
                        </span>
                      </td>
                      <td className="border-b border-[rgba(201,168,76,0.07)] px-[14px] py-[12px]">
                        <div className="flex items-center justify-end gap-[6px]">
                          <button
                            type="button"
                            onClick={() => handleEdit(product)}
                            className="flex h-[28px] items-center gap-[4px] rounded-full border border-[rgba(201,168,76,0.18)] px-[10px] text-[10px] uppercase tracking-[0.08em] text-[rgba(201,168,76,0.6)] transition-all hover:bg-[rgba(201,168,76,0.08)] hover:text-[var(--gold)]"
                          >
                            <PencilLine size={11} strokeWidth={1.6} />
                            Sửa
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteOne(product.id)}
                            className="flex h-[28px] w-[28px] items-center justify-center rounded-full border border-[rgba(240,235,224,0.1)] text-[rgba(240,235,224,0.35)] transition-all hover:border-[rgba(248,113,113,0.3)] hover:text-[rgba(248,113,113,0.75)]"
                          >
                            <Trash2 size={12} strokeWidth={1.6} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </section>
    </>
  );
}