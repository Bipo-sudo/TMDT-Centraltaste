'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X, Menu, Search, ShoppingBag, User, ArrowRight } from 'lucide-react';
import { useStore } from '../../store/useStore';

const navItems = [
  { href: '/',           label: 'Trang chủ' },
  { href: '/products',   label: 'Sản phẩm' },
  { href: '/#story',     label: 'Câu chuyện' },
  { href: '/#brand',     label: 'Vùng nguyên liệu' },
  { href: '/#contact',   label: 'Liên hệ' },
];

// ─── Inline Logo ──────────────────────────────────────────────
function Logo() {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
      <span style={{
        width:16, height:16, borderRadius:'50%',
        background:'linear-gradient(135deg,#c9a84c,#e8d49a)',
        flexShrink:0,
      }} />
      <span style={{
        fontFamily:"'Cormorant Garamond','Georgia',serif",
        fontSize:18, fontWeight:400, letterSpacing:'0.06em',
        color:'#f0ebe0',
      }}>
        DAIF
      </span>
      <span style={{
        fontFamily:"'DM Sans',sans-serif",
        fontSize:10, fontWeight:300, letterSpacing:'0.22em',
        color:'rgba(240,235,224,0.38)', marginLeft:2,
      }}>
        CENTRALTASTE
      </span>
    </div>
  );
}

// ─── Icon button ──────────────────────────────────────────────
function IconBtn({ onClick, href, label, badge, children }) {
  const style = {
    width:38, height:38, borderRadius:'50%',
    border:'1px solid rgba(201,168,76,0.22)',
    background:'rgba(255,255,255,0.04)',
    color:'rgba(240,235,224,0.7)',
    display:'inline-flex', alignItems:'center', justifyContent:'center',
    position:'relative', cursor:'pointer', transition:'all 0.2s',
    flexShrink:0,
  };
  const inner = (
    <>
      {children}
      {badge > 0 && (
        <span style={{
          position:'absolute', top:-3, right:-3,
          width:16, height:16, borderRadius:'50%',
          background:'#c9a84c', color:'#1a1208',
          fontSize:9, fontWeight:700,
          display:'flex', alignItems:'center', justifyContent:'center',
        }}>
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </>
  );
  if (href) return <Link href={href} style={style} aria-label={label}>{inner}</Link>;
  return <button type="button" onClick={onClick} style={style} aria-label={label}>{inner}</button>;
}

// ─── Search overlay ───────────────────────────────────────────
function SearchOverlay({ open, onClose }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position:'fixed', inset:0, zIndex:80,
        background:'rgba(12,11,9,0.85)', backdropFilter:'blur(8px)',
        display:'flex', alignItems:'flex-start', justifyContent:'center',
        paddingTop:'14vh', paddingInline:16,
        opacity: open ? 1 : 0,
        pointerEvents: open ? 'auto' : 'none',
        transition:'opacity 0.3s',
      }}
    >
      <div style={{
        width:'100%', maxWidth:560, borderRadius:16, overflow:'hidden',
        background:'#1a1810', border:'1px solid rgba(201,168,76,0.25)',
        transform: open ? 'translateY(0) scale(1)' : 'translateY(-12px) scale(0.97)',
        transition:'transform 0.3s cubic-bezier(0.22,1,0.36,1)',
      }}>
        <div style={{
          display:'flex', alignItems:'center', gap:12,
          padding:'12px 16px',
          borderBottom:'1px solid rgba(201,168,76,0.12)',
        }}>
          <Search size={16} style={{ color:'rgba(201,168,76,0.5)', flexShrink:0 }} aria-hidden="true" />
          <input
            autoFocus={open}
            type="search"
            placeholder="Tìm sản phẩm, hương vị, vùng nguyên liệu..."
            style={{
              flex:1, background:'transparent', border:'none', outline:'none',
              fontSize:14, color:'#f0ebe0',
              fontFamily:"'DM Sans',sans-serif",
            }}
          />
          <button
            onClick={onClose}
            style={{
              fontSize:10, letterSpacing:'0.18em', textTransform:'uppercase',
              color:'rgba(240,235,224,0.35)', padding:'4px 8px',
              borderRadius:6, cursor:'pointer',
              border:'1px solid rgba(240,235,224,0.1)', background:'transparent',
            }}
          >
            ESC
          </button>
        </div>
        <div style={{ padding:16 }}>
          <p style={{ fontSize:10, letterSpacing:'0.22em', textTransform:'uppercase', color:'rgba(201,168,76,0.6)', marginBottom:10 }}>
            Gợi ý
          </p>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
            {['Mè xửng', 'Trà Huế', 'Mắm nêm', 'Cà phê', 'Bánh tét'].map((t) => (
              <button key={t} style={{
                padding:'6px 14px', borderRadius:999,
                background:'rgba(201,168,76,0.08)',
                border:'1px solid rgba(201,168,76,0.2)',
                color:'rgba(240,235,224,0.6)', fontSize:12, cursor:'pointer',
              }}>
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Header ──────────────────────────────────────────────
export default function Header() {
  const cartCount  = useStore((s) => s.cartCount ?? 0);
  const user       = useStore((s) => s.user);
  const pathname   = usePathname();
  const [menuOpen,   setMenuOpen]   = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled,   setScrolled]   = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive:true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  const headerBg = scrolled
    ? 'rgba(12,11,9,0.95)'
    : 'rgba(12,11,9,0.6)';
  const headerBorder = scrolled
    ? 'rgba(201,168,76,0.22)'
    : 'rgba(201,168,76,0.1)';

  return (
    <>
      <header style={{
        position:'sticky', top:0, zIndex:50,
        background: headerBg,
        backdropFilter:'blur(20px)',
        WebkitBackdropFilter:'blur(20px)',
        borderBottom:`1px solid ${headerBorder}`,
        transition:'background 0.4s, border-color 0.4s, box-shadow 0.4s',
        boxShadow: scrolled ? '0 4px 32px rgba(0,0,0,0.4)' : 'none',
      }}>
        <div style={{
          maxWidth:1280, margin:'0 auto',
          padding:'0 32px',
          display:'flex', alignItems:'center',
          justifyContent:'space-between', gap:16,
          height:60,
        }}>
          {/* Hamburger */}
          <IconBtn onClick={() => setMenuOpen(true)} label="Mở menu">
            <Menu size={17} />
          </IconBtn>

          {/* Logo */}
          <Link href="/" style={{ flexShrink:0 }}>
            <Logo />
          </Link>

          {/* Desktop nav */}
          <nav style={{ display:'flex', gap:24, alignItems:'center' }} aria-label="Điều hướng chính">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link key={item.href} href={item.href} style={{
                  fontSize:12, letterSpacing:'0.12em', textTransform:'uppercase',
                  color: active ? '#c9a84c' : 'rgba(240,235,224,0.5)',
                  transition:'color 0.2s',
                  position:'relative', paddingBottom:2,
                  borderBottom: active ? '1px solid rgba(201,168,76,0.7)' : '1px solid transparent',
                }}>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Action icons */}
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            <IconBtn onClick={() => setSearchOpen(true)} label="Tìm kiếm">
              <Search size={16} />
            </IconBtn>
            <IconBtn href={user ? '/me' : '/login'} label="Tài khoản">
              <User size={16} />
            </IconBtn>
            <IconBtn href="/cart" label="Giỏ hàng" badge={cartCount}>
              <ShoppingBag size={16} />
            </IconBtn>
          </div>
        </div>
      </header>

      {/* Search overlay */}
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Mobile menu backdrop */}
      <div
        onClick={() => setMenuOpen(false)}
        style={{
          position:'fixed', inset:0, zIndex:60,
          background:'rgba(12,11,9,0.7)', backdropFilter:'blur(4px)',
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? 'auto' : 'none',
          transition:'opacity 0.3s',
        }}
        aria-hidden="true"
      />

      {/* Mobile drawer */}
      <aside style={{
        position:'fixed', inset:0, right:'auto', zIndex:65,
        width:'min(320px,90vw)',
        background:'#131108',
        borderRight:'1px solid rgba(201,168,76,0.2)',
        display:'flex', flexDirection:'column',
        transform: menuOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition:'transform 0.35s cubic-bezier(0.22,1,0.36,1)',
        boxShadow: menuOpen ? '12px 0 60px rgba(0,0,0,0.6)' : 'none',
      }} aria-label="Menu điều hướng" aria-hidden={!menuOpen}>

        {/* Header */}
        <div style={{
          display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'16px 20px',
          borderBottom:'1px solid rgba(201,168,76,0.12)',
        }}>
          <Logo />
          <button
            onClick={() => setMenuOpen(false)}
            style={{
              width:34, height:34, borderRadius:'50%',
              border:'1px solid rgba(201,168,76,0.2)',
              background:'transparent', color:'rgba(240,235,224,0.6)',
              display:'flex', alignItems:'center', justifyContent:'center',
              cursor:'pointer',
            }}
            aria-label="Đóng menu"
          >
            <X size={15} />
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', padding:'0 20px', gap:4 }} aria-label="Menu chính">
          {navItems.map((item, i) => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}
                onClick={() => setMenuOpen(false)}
                style={{
                  display:'flex', alignItems:'center', justifyContent:'space-between',
                  padding:'14px 12px',
                  borderRadius:12,
                  fontFamily:"'Cormorant Garamond','Georgia',serif",
                  fontSize:24, fontWeight:300, letterSpacing:'-0.02em',
                  color: active ? '#c9a84c' : 'rgba(240,235,224,0.75)',
                  background: active ? 'rgba(201,168,76,0.08)' : 'transparent',
                  transition:'all 0.2s',
                  animationDelay:`${i*50}ms`,
                }}
              >
                {item.label}
                <ArrowRight size={14} style={{ color:'rgba(201,168,76,0.4)', opacity: active ? 1 : 0 }} aria-hidden="true" />
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{
          padding:'20px',
          borderTop:'1px solid rgba(201,168,76,0.12)',
        }}>
          <Link href="/products" onClick={() => setMenuOpen(false)} style={{
            display:'flex', alignItems:'center', justifyContent:'center', gap:8,
            background:'#c9a84c', color:'#1a1208',
            padding:'12px', borderRadius:999,
            fontSize:11, fontWeight:500, letterSpacing:'0.15em', textTransform:'uppercase',
          }}>
            Mua sắm ngay <ArrowRight size={13} aria-hidden="true" />
          </Link>
          <p style={{
            marginTop:12, textAlign:'center',
            fontSize:10, letterSpacing:'0.15em', textTransform:'uppercase',
            color:'rgba(240,235,224,0.25)',
          }}>
            Tinh hoa đặc sản miền Trung
          </p>
        </div>
      </aside>
    </>
  );
}
