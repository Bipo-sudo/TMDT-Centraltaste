import Link from 'next/link';
import BrandLogo from '../common/BrandLogo';

const footerLinks = [
  { href: '/products', label: 'Sản phẩm' },
  { href: '/cart', label: 'Giỏ hàng' },
  { href: '/checkout', label: 'Thanh toán' },
  { href: '/admin', label: 'Admin' },
];

export default function Footer() {
  return (
    <footer className="border-t border-neutral-200/70 bg-neutral-50/80">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.4fr_1fr] lg:px-8">
        <div className="space-y-5">
          <BrandLogo width={150} height={44} />
          <p className="max-w-xl text-sm leading-6 text-neutral-600">
            CentralTaste được quy hoạch theo hướng sạch, thoáng, và dễ mở rộng cho cả trải nghiệm mua hàng lẫn khu vực quản trị.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-400">Điều hướng</p>
            <div className="mt-4 flex flex-col gap-3">
              {footerLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm text-neutral-600 transition hover:text-neutral-950"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-400">Hỗ trợ</p>
            <p className="mt-4 text-sm leading-6 text-neutral-600">
              Dùng UploadThing cho media, cấu hình ảnh remote ở `next.config.mjs`, và giữ toàn bộ asset tĩnh trong `public/assets`.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
