export default function AdminDashboardPage() {
  return (
    <section className="grid gap-6 xl:grid-cols-3">
      <div className="rounded-[28px] border border-neutral-200 bg-white p-6 xl:col-span-2">
        <p className="text-xs uppercase tracking-[0.35em] text-neutral-400">Dashboard</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-neutral-950">Tổng quan vận hành</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">
          Đây là placeholder cho biểu đồ doanh thu, trạng thái đơn hàng, và shortcut quản trị.
        </p>
      </div>
      <div className="rounded-[28px] border border-neutral-200 bg-white p-6">
        <p className="text-xs uppercase tracking-[0.35em] text-neutral-400">Status</p>
        <div className="mt-4 space-y-3 text-sm text-neutral-600">
          <div className="flex items-center justify-between"><span>Shop shell</span><span className="font-medium text-neutral-950">Ready</span></div>
          <div className="flex items-center justify-between"><span>Admin shell</span><span className="font-medium text-neutral-950">Ready</span></div>
          <div className="flex items-center justify-between"><span>UploadThing</span><span className="font-medium text-neutral-950">Planned</span></div>
        </div>
      </div>
    </section>
  );
}
