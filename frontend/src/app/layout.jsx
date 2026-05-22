import './globals.css';

export const metadata = {
  title: 'CentralTaste',
  description: 'CentralTaste storefront and admin experience',
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}