const stats = [
  {
    label: 'Tổng doanh thu',
    value: '128,4M VND',
    hint: '+18% so với tháng trước',
    icon: '₫',
  },
  {
    label: 'Số đơn hàng',
    value: '1.284',
    hint: '96 đơn trong 7 ngày qua',
    icon: '●',
  },
  {
    label: 'Sản phẩm đang bán',
    value: '36',
    hint: '6 sản phẩm nổi bật',
    icon: '◌',
  },
  {
    label: 'Tỉ lệ hoàn tất',
    value: '94,8%',
    hint: 'Ổn định và tăng nhẹ',
    icon: '↗',
  },
];

const recentOrders = [
  { id: 'ORD-184221', customer: 'Nguyễn Minh Anh', total: '189.000 VND', status: 'Completed', date: '22/05/2026' },
  { id: 'ORD-184220', customer: 'Trần Quỳnh Như', total: '258.000 VND', status: 'Shipping', date: '22/05/2026' },
  { id: 'ORD-184219', customer: 'Lê Hoàng Long', total: '99.000 VND', status: 'Pending', date: '21/05/2026' },
  { id: 'ORD-184218', customer: 'Phạm Gia Hân', total: '329.000 VND', status: 'Completed', date: '21/05/2026' },
  { id: 'ORD-184217', customer: 'Võ Thanh Tùng', total: '149.000 VND', status: 'Processing', date: '20/05/2026' },
];

function statusClass(status) {
  switch (status) {
    case 'Completed':
      return 'bg-emerald-100 text-emerald-700';
    case 'Shipping':
      return 'bg-sky-100 text-sky-700';
    case 'Processing':
      return 'bg-amber-100 text-amber-700';
    case 'Pending':
      return 'bg-neutral-100 text-neutral-600';
    default:
      return 'bg-neutral-100 text-neutral-600';
  }
}

function StatCard({ stat }) {
  return (
    <article className="relative overflow-hidden rounded-[24px] bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.04)]">
      <span className="pointer-events-none absolute -right-2 -top-2 select-none text-7xl font-semibold text-neutral-950/5">
        {stat.icon}
      </span>
      <p className="text-xs uppercase tracking-[0.35em] text-neutral-400">{stat.label}</p>
      <h3 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-neutral-950">{stat.value}</h3>
      <p className="mt-2 text-sm text-neutral-500">{stat.hint}</p>
    </article>
  );
}

export default function AdminDashboardPage() {
  return (
    <section className="space-y-8">
      <div className="max-w-3xl space-y-3">
        <p className="text-xs uppercase tracking-[0.35em] text-neutral-400">Dashboard</p>
        <h2 className="text-4xl font-light tracking-[-0.05em] text-neutral-950">Tổng quan hệ thống</h2>
        <p className="text-sm leading-7 text-neutral-500">
          Bảng điều khiển tối giản, giàu thông tin và đủ thoáng để xử lý dữ liệu vận hành hàng ngày.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </div>

      <div className="rounded-[28px] bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.04)]">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-neutral-400">Recent Orders</p>
            <h3 className="mt-2 text-2xl font-medium tracking-[-0.03em] text-neutral-950">5 đơn hàng gần nhất</h3>
          </div>
          <p className="text-sm text-neutral-500">Cập nhật theo dữ liệu mock</p>
        </div>

        <div className="mt-6 overflow-hidden">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-neutral-200 text-xs uppercase tracking-[0.3em] text-neutral-400">
                <th className="pb-4 font-medium">Đơn hàng</th>
                <th className="pb-4 font-medium">Khách hàng</th>
                <th className="pb-4 font-medium">Ngày đặt</th>
                <th className="pb-4 font-medium">Trạng thái</th>
                <th className="pb-4 font-medium text-right">Tổng tiền</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-b border-neutral-100 text-sm text-neutral-700 last:border-b-0">
                  <td className="py-4 font-medium text-neutral-950">{order.id}</td>
                  <td className="py-4">{order.customer}</td>
                  <td className="py-4">{order.date}</td>
                  <td className="py-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusClass(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-4 text-right font-medium text-neutral-950">{order.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
