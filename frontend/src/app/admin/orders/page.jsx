export default function AdminOrdersPage() {
  return (
    <section className="rounded-[28px] border border-neutral-200 bg-white p-6">
      <p className="text-xs uppercase tracking-[0.35em] text-neutral-400">Admin</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-neutral-950">Quản lý đơn hàng</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">
        Nơi đặt danh sách đơn, trạng thái thanh toán, shipment, và thao tác xử lý đơn.
      </p>
    </section>
  );
}
