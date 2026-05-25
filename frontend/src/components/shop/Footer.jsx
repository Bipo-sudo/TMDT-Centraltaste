'use client';

import Link from 'next/link';

/* ── LinkedIn SVG ── */
function LinkedInIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );
}

const NAV_LEFT = [
  { href: '/products',  label: 'Sản phẩm' },
  { href: '/cart',      label: 'Giỏ hàng' },
  { href: '/checkout',  label: 'Thanh toán' },
  { href: '/#story',    label: 'Câu chuyện' },
];

const NAV_SUPPORT = [
  { href: '/contact',   label: 'Liên hệ' },
  { href: '#',          label: 'Chính sách đổi trả' },
  { href: '#',          label: 'Vận chuyển' },
  { href: '#',          label: 'Câu hỏi thường gặp' },
];

const NAV_LEGAL = [
  { href: '/terms',     label: 'Điều khoản' },
  { href: '/privacy',   label: 'Bảo mật' },
  { href: '#',          label: 'Cookie' },
];

export default function Footer() {
  return (
    <footer style={{
      background: '#0a0908',
      borderTop: '1px solid rgba(201,168,76,0.14)',
      fontFamily: "'DM Sans', sans-serif",
      color: '#f0ebe0',
    }}>

      {/* ── TOP SECTION ─────────────────────────────── */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '56px 32px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr 1fr 1fr', gap: 48, paddingBottom: 48 }}>

          {/* Brand column */}
          <div>
            {/* Logo mark */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <span style={{
                width: 14, height: 14, borderRadius: '50%',
                background: 'linear-gradient(135deg,#c9a84c,#e8d49a)',
                flexShrink: 0,
              }} />
              <span style={{
                fontFamily: "'Cormorant Garamond','Georgia',serif",
                fontSize: 17, fontWeight: 400, letterSpacing: '0.06em', color: '#f0ebe0',
              }}>
                DAIF
              </span>
              <span style={{ fontSize: 10, fontWeight: 300, letterSpacing: '0.22em', color: 'rgba(240,235,224,0.32)', marginLeft: 2 }}>
                CENTRALTASTE
              </span>
            </div>

            <p style={{ fontSize: 13, lineHeight: 1.78, color: 'rgba(240,235,224,0.4)', maxWidth: 280, marginBottom: 20 }}>
              Kết nối trực tiếp các nghệ nhân làng nghề miền Trung với người tiêu dùng — không qua trung gian, giữ nguyên hương vị gốc.
            </p>

            {/* Social links */}
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { label: 'Facebook', href: 'https://facebook.com', icon: (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                )},
                { label: 'LinkedIn', href: 'https://linkedin.com', icon: <LinkedInIcon /> },
                { label: 'Instagram', href: 'https://instagram.com', icon: (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                )},
              ].map(({ label, href, icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  style={{
                    width: 34, height: 34, borderRadius: '50%',
                    border: '1px solid rgba(201,168,76,0.18)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'rgba(240,235,224,0.4)',
                    transition: 'border-color 0.2s, color 0.2s, background 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.55)'; e.currentTarget.style.color = '#c9a84c'; e.currentTarget.style.background = 'rgba(201,168,76,0.08)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.18)'; e.currentTarget.style.color = 'rgba(240,235,224,0.4)'; e.currentTarget.style.background = 'transparent'; }}
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Nav — Products & Pages */}
          <div>
            <p style={{ fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.55)', marginBottom: 16 }}>
              Điều hướng
            </p>
            {NAV_LEFT.map(item => (
              <Link key={item.href} href={item.href} style={{
                display: 'block', fontSize: 13,
                color: 'rgba(240,235,224,0.42)', marginBottom: 10,
                textDecoration: 'none', transition: 'color 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.color = '#c9a84c'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(240,235,224,0.42)'}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Nav — Support */}
          <div>
            <p style={{ fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.55)', marginBottom: 16 }}>
              Hỗ trợ
            </p>
            {NAV_SUPPORT.map(item => (
              <Link key={item.label} href={item.href} style={{
                display: 'block', fontSize: 13,
                color: 'rgba(240,235,224,0.42)', marginBottom: 10,
                textDecoration: 'none', transition: 'color 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.color = '#c9a84c'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(240,235,224,0.42)'}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Concierge column */}
          <div>
            <p style={{ fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.55)', marginBottom: 16 }}>
              Liên hệ
            </p>
            {[
              { label: 'Hotline', value: '1900 8888', href: 'tel:19008888' },
              { label: 'Concierge Email', value: 'concierge.daif@gmail.com', href: 'mailto:concierge.daif@gmail.com' },
            ].map(({ label, value, href }) => (
              <div key={label} style={{ marginBottom: 14 }}>
                <p style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.4)', margin: '0 0 2px' }}>{label}</p>
                <a href={href} style={{
                  fontSize: 12, color: 'rgba(240,235,224,0.55)',
                  textDecoration: 'none', transition: 'color 0.2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.color = '#c9a84c'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(240,235,224,0.55)'}
                >
                  {value}
                </a>
              </div>
            ))}

            {/* Mini concierge status */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6, marginTop: 4,
              padding: '7px 10px', borderRadius: 8,
              background: 'rgba(34,197,94,0.07)',
              border: '1px solid rgba(34,197,94,0.16)',
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e', flexShrink: 0 }} />
              <span style={{ fontSize: 10, color: 'rgba(134,239,172,0.75)', letterSpacing: '0.06em' }}>Concierge đang trực tuyến</span>
            </div>
          </div>
        </div>

        {/* Gold rule */}
        <div style={{
          height: 1,
          background: 'linear-gradient(90deg,transparent,rgba(201,168,76,0.25) 30%,rgba(201,168,76,0.25) 70%,transparent)',
        }} />

        {/* ── CORPORATE TIER — D'ONYX GROUP ───────────── */}
        <div style={{
          padding: '20px 0',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 24, flexWrap: 'wrap',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{
              fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase',
              color: 'rgba(201,168,76,0.35)',
            }}>
              A D'Onyx Group Company
            </span>
            <span style={{ width: 1, height: 12, background: 'rgba(201,168,76,0.15)' }} />
            <a
              href="mailto:hq.donyxgroup@gmail.com"
              style={{
                fontSize: 11, color: 'rgba(240,235,224,0.28)',
                textDecoration: 'none', letterSpacing: '0.06em',
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgba(201,168,76,0.6)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(240,235,224,0.28)'}
            >
              Corporate &amp; Strategic Relations
            </a>
          </div>

          {/* LinkedIn — subtle icon for partners to find */}
          <a
            href="https://linkedin.com"
            target="_blank" rel="noopener noreferrer"
            aria-label="D'Onyx Group on LinkedIn"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 10, letterSpacing: '0.14em',
              color: 'rgba(240,235,224,0.22)', textDecoration: 'none',
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(201,168,76,0.6)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(240,235,224,0.22)'}
          >
            <LinkedInIcon />
            D'Onyx Group
          </a>
        </div>

        {/* ── BOTTOM ROW ───────────────────────────────── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 0',
          flexWrap: 'wrap', gap: 12,
        }}>
          {/* Tiered copyright */}
          <p style={{ fontSize: 11, color: 'rgba(240,235,224,0.2)', letterSpacing: '0.06em', margin: 0 }}>
            © 2026 <span style={{ color: 'rgba(240,235,224,0.35)' }}>CentralTaste</span>
            <span style={{ color: 'rgba(240,235,224,0.18)' }}> · Operated by </span>
            <span style={{ color: 'rgba(201,168,76,0.45)' }}>DAIF</span>
            <span style={{ color: 'rgba(240,235,224,0.18)' }}> · An </span>
            <a
              href="mailto:hq.donyxgroup@gmail.com"
              style={{ color: 'rgba(201,168,76,0.38)', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgba(201,168,76,0.7)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(201,168,76,0.38)'}
            >
              D'Onyx Group
            </a>
            <span style={{ color: 'rgba(240,235,224,0.18)' }}> Company</span>
          </p>

          {/* Legal links */}
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            {NAV_LEGAL.map((item, i) => (
              <span key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                {i > 0 && <span style={{ width: 1, height: 10, background: 'rgba(255,255,255,0.08)' }} />}
                <Link href={item.href} style={{
                  fontSize: 11, color: 'rgba(240,235,224,0.2)',
                  letterSpacing: '0.06em', textDecoration: 'none',
                  transition: 'color 0.2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.color = 'rgba(201,168,76,0.55)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(240,235,224,0.2)'}
                >
                  {item.label}
                </Link>
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}