import { Cormorant_Garamond, DM_Sans } from 'next/font/google';
import './globals.css';
import Providers from './providers';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata = {
  title: 'CentralTaste — Tinh hoa Đặc sản',
  description: 'Bộ sưu tập đặc sản miền Trung được chọn lọc kỹ lưỡng. Rõ nguồn gốc, giao hàng toàn quốc.',
  openGraph: {
    title: 'CentralTaste — Tinh hoa Đặc sản',
    description: 'Đặc sản miền Trung chính gốc từ làng nghề đến tay bạn.',
    locale: 'vi_VN',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi" suppressHydrationWarning className={`${dmSans.variable} ${cormorant.variable}`}>
      <body className="font-sans antialiased bg-[#0b0a07] text-[#f0ebe0] min-h-screen" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
