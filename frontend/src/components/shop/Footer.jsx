'use client';

import Link from 'next/link';

const navLeft = [
  { href: '/products',  label: 'Sản phẩm' },
  { href: '/cart',      label: 'Giỏ hàng' },
  { href: '/checkout',  label: 'Thanh toán' },
  { href: '/admin',     label: 'Admin' },
];

const navRight = [
  { href: '#', label: 'Chính sách đổi trả' },
  { href: '#', label: 'Vận chuyển' },
  { href: '#', label: 'Câu hỏi thường gặp' },
  { href: '#', label: 'Liên hệ' },
];

export default function Footer() {
  return (
    <footer style={{
      background: '#0a0908',
      borderTop: '1px solid rgba(201,168,76,0.18)',
      padding: '48px 0 0',
      fontFamily: "'DM Sans', sans-serif",
      color: '#f0ebe0',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px' }}>

        {/* Top row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr', gap: 40, paddingBottom: 40 }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <span style={{
                width: 14, height: 14, borderRadius: '50%',
                background: 'linear-gradient(135deg,#c9a84c,#e8d49a)',
              }} />
              <span style={{
                fontFamily: "'Cormorant Garamond','Georgia',serif",
                fontSize: 17, fontWeight: 400, letterSpacing: '0.06em',
                color: '#f0ebe0',
              }}>
                DAIF
              </span>
              <span style={{
                fontSize: 10, fontWeight: 300, letterSpacing: '0.22em',
                color: 'rgba(240,235,224,0.35)', marginLeft: 2,
              }}>
                CENTRALTASTE
              </span>
            </div>
            <p style={{
              fontSize: 13, lineHeight: 1.75,
              color: 'rgba(240,235,224,0.4)',
              maxWidth: 280,
            }}>
              CentralTaste kết nối trực tiếp các nghệ nhân làng nghề miền Trung với người tiêu dùng — không qua trung gian, giữ nguyên hương vị gốc.
            </p>
          </div>

          {/* Nav left */}
          <div>
            <p style={{
              fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase',
              color: 'rgba(201,168,76,0.55)', marginBottom: 14,
            }}>
              Điều hướng
            </p>
            {navLeft.map((item) => (
              <Link key={item.href} href={item.href} style={{
                display: 'block', fontSize: 13,
                color: 'rgba(240,235,224,0.45)',
                marginBottom: 10, transition: 'color 0.2s',
              }}>
                {item.label}
              </Link>
            ))}
          </div>

          {/* Nav right */}
          <div>
            <p style={{
              fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase',
              color: 'rgba(201,168,76,0.55)', marginBottom: 14,
            }}>
              Hỗ trợ
            </p>
            {navRight.map((item) => (
              <Link key={item.label} href={item.href} style={{
                display: 'block', fontSize: 13,
                color: 'rgba(240,235,224,0.45)',
                marginBottom: 10, transition: 'color 0.2s',
              }}>
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Gold rule */}
        <div style={{
          height: 1,
          background: 'linear-gradient(90deg,transparent,rgba(201,168,76,0.3) 30%,rgba(201,168,76,0.3) 70%,transparent)',
        }} />

        {/* Bottom row */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 0',
          flexWrap: 'wrap', gap: 12,
        }}>
          <p style={{ fontSize: 11, color: 'rgba(240,235,224,0.25)', letterSpacing: '0.06em' }}>
            © 2025 CentralTaste · DAIF · Đặc sản miền Trung Việt Nam
          </p>
          <div style={{ display: 'flex', gap: 16 }}>
            {['Điều khoản', 'Bảo mật', 'Cookie'].map((t) => (
              <Link key={t} href="#" style={{
                fontSize: 11, color: 'rgba(240,235,224,0.22)',
                letterSpacing: '0.06em', transition: 'color 0.2s',
              }}>
                {t}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
