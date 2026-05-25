'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Play, Pause, Quote, ChevronDown } from 'lucide-react';

/* ─────────────────────────────────────────────────────────
   MEDIA REGISTRY
───────────────────────────────────────────────────────── */
const MEDIA = {
  hero:      'https://images.unsplash.com/photo-1506368249639-73a05d6f6488?w=2000&q=85',
  origin:    'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=1200&q=85',
  honey:     'https://images.unsplash.com/photo-1587049352851-8d4e89133924?w=2000&q=85',
  craft:     'https://images.unsplash.com/photo-1506368249639-73a05d6f6488?w=1200&q=85',
  videoPoster:'https://images.unsplash.com/photo-1433891248364-3ce993ff0e92?w=1600&q=85',
  curation:  'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=1200&q=85',
  giftbox:   'https://images.unsplash.com/photo-1674620213535-9b2a2553ef40?w=2000&q=85',
  promise:   'https://images.unsplash.com/photo-1675306408031-a9aad9f23308?w=1200&q=85',
};

/* ─────────────────────────────────────────────────────────
   TINY ATOMS
───────────────────────────────────────────────────────── */
const gold    = '#c9a84c';
const ink     = '#f0ebe0';
const ink2    = 'rgba(240,235,224,0.6)';
const darkBg  = '#0c0b09';

function GoldRule({ opacity = 0.25, my = 0 }) {
  return (
    <div style={{
      height: 1, margin: `${my}px 0`,
      background: `linear-gradient(90deg, transparent, rgba(201,168,76,${opacity}) 30%, rgba(201,168,76,${opacity}) 70%, transparent)`,
    }} />
  );
}

function Eyebrow({ children, center }) {
  return (
    <p style={{
      fontSize: 10, letterSpacing: '0.38em', textTransform: 'uppercase',
      color: 'rgba(201,168,76,0.75)',
      textAlign: center ? 'center' : undefined,
      margin: 0,
    }}>
      {children}
    </p>
  );
}

function ChapterNum({ n }) {
  return (
    <span style={{
      fontFamily: "'Cormorant Garamond', 'Georgia', serif",
      fontSize: 'clamp(88px,14vw,160px)',
      fontWeight: 300, lineHeight: 1,
      color: 'rgba(201,168,76,0.07)',
      position: 'absolute', top: 0, right: 0,
      userSelect: 'none', pointerEvents: 'none',
      letterSpacing: '-0.06em',
    }}>
      {n}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────
   FULL-BLEED IMAGE DIVIDER
───────────────────────────────────────────────────────── */
function CinematicDivider({ src, height = '60vh', caption, overlay = 0.45 }) {
  return (
    <div style={{ position: 'relative', width: '100%', height, overflow: 'hidden' }}>
      <img
        src={src}
        alt={caption || ''}
        loading="lazy"
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%', objectFit: 'cover',
          objectPosition: 'center',
        }}
      />
      {/* vignette */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(180deg, rgba(12,11,9,0.65) 0%, rgba(12,11,9,${overlay}) 40%, rgba(12,11,9,${overlay}) 60%, rgba(12,11,9,0.8) 100%)`,
      }} />
      {/* decorative vertical gold lines */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: '12%', width: 1, background: 'linear-gradient(180deg, transparent, rgba(201,168,76,0.35) 30%, rgba(201,168,76,0.35) 70%, transparent)' }} />
        <div style={{ position: 'absolute', top: 0, bottom: 0, right: '12%', width: 1, background: 'linear-gradient(180deg, transparent, rgba(201,168,76,0.35) 30%, rgba(201,168,76,0.35) 70%, transparent)' }} />
      </div>
      {caption && (
        <div style={{
          position: 'absolute', bottom: 24, left: 0, right: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16,
        }}>
          <div style={{ width: 40, height: 1, background: 'rgba(201,168,76,0.5)' }} />
          <span style={{ fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.7)' }}>{caption}</span>
          <div style={{ width: 40, height: 1, background: 'rgba(201,168,76,0.5)' }} />
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   PULL QUOTE
───────────────────────────────────────────────────────── */
function PullQuote({ text, author }) {
  return (
    <div style={{
      position: 'relative',
      padding: '40px 48px',
      borderRadius: 24,
      border: '1px solid rgba(201,168,76,0.15)',
      background: 'rgba(201,168,76,0.04)',
      textAlign: 'center',
    }}>
      {/* giant quote marks */}
      <Quote size={48} style={{
        position: 'absolute', top: -16, left: '50%', transform: 'translateX(-50%)',
        color: gold, opacity: 0.3,
      }} />
      <p style={{
        fontFamily: "'Cormorant Garamond','Georgia',serif",
        fontSize: 'clamp(18px,2.5vw,26px)',
        fontStyle: 'italic', fontWeight: 300,
        lineHeight: 1.6, color: ink,
        margin: '16px 0 0',
      }}>
        {text}
      </p>
      {author && (
        <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <div style={{ width: 32, height: 1, background: 'rgba(201,168,76,0.4)' }} />
          <span style={{ fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.65)' }}>{author}</span>
          <div style={{ width: 32, height: 1, background: 'rgba(201,168,76,0.4)' }} />
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   DECORATED IMAGE FRAME
───────────────────────────────────────────────────────── */
function ImageFrame({ src, alt, aspect = '4/5' }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ position: 'relative', aspectRatio: aspect, overflow: 'visible' }}
    >
      {/* offset decorative frame */}
      <div style={{
        position: 'absolute', top: -12, left: -12,
        right: 12, bottom: 12,
        borderRadius: 20,
        border: '1px solid rgba(201,168,76,0.25)',
        zIndex: 0,
        transition: 'transform 0.4s cubic-bezier(0.22,1,0.36,1)',
        transform: hovered ? 'translate(-3px,-3px)' : 'translate(0,0)',
      }} />
      {/* image */}
      <div style={{
        position: 'relative', zIndex: 1,
        width: '100%', height: '100%',
        borderRadius: 18, overflow: 'hidden',
        boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
      }}>
        <img
          src={src} alt={alt}
          loading="lazy"
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            transition: 'transform 0.8s cubic-bezier(0.22,1,0.36,1)',
            transform: hovered ? 'scale(1.06)' : 'scale(1)',
          }}
        />
        {/* subtle gold overlay on hover */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, rgba(201,168,76,0.08), transparent)',
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.4s',
        }} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   VIDEO SECTION
───────────────────────────────────────────────────────── */
function VideoSection() {
  const [playing, setPlaying] = useState(false);
  return (
    <div style={{ padding: '0 0' }}>
      {/* label */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <Eyebrow center>Phim ngắn · Hành trình</Eyebrow>
        <h3 style={{
          fontFamily: "'Cormorant Garamond','Georgia',serif",
          fontSize: 'clamp(24px,3vw,36px)',
          fontWeight: 300, color: ink,
          margin: '10px 0 0', letterSpacing: '-0.02em',
        }}>
          Từ làng nghề đến bàn tiệc
        </h3>
      </div>

      {/* video frame */}
      <div style={{
        position: 'relative', aspectRatio: '16/9',
        borderRadius: 20, overflow: 'hidden',
        boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
        border: '1px solid rgba(201,168,76,0.15)',
      }}>
        <img
          src={MEDIA.videoPoster}
          alt="Video poster"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <button
            onClick={() => setPlaying(v => !v)}
            style={{
              width: 80, height: 80, borderRadius: '50%',
              border: '1.5px solid rgba(201,168,76,0.7)',
              background: 'rgba(12,11,9,0.6)',
              backdropFilter: 'blur(8px)',
              color: gold,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              transition: 'transform 0.3s, background 0.3s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.background = 'rgba(201,168,76,0.15)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = 'rgba(12,11,9,0.6)'; }}
            aria-label="Phát video"
          >
            {playing ? <Pause size={28} /> : <Play size={28} style={{ marginLeft: 4 }} />}
          </button>
        </div>
        {/* decorative corner marks */}
        {['topleft','topright','bottomleft','bottomright'].map(pos => (
          <div key={pos} style={{
            position: 'absolute',
            top: pos.includes('top') ? 16 : undefined,
            bottom: pos.includes('bottom') ? 16 : undefined,
            left: pos.includes('left') ? 16 : undefined,
            right: pos.includes('right') ? 16 : undefined,
            width: 24, height: 24,
            borderTop: pos.includes('top') ? `1.5px solid rgba(201,168,76,0.6)` : undefined,
            borderBottom: pos.includes('bottom') ? `1.5px solid rgba(201,168,76,0.6)` : undefined,
            borderLeft: pos.includes('left') ? `1.5px solid rgba(201,168,76,0.6)` : undefined,
            borderRight: pos.includes('right') ? `1.5px solid rgba(201,168,76,0.6)` : undefined,
            borderRadius: pos === 'topleft' ? '4px 0 0 0' : pos === 'topright' ? '0 4px 0 0' : pos === 'bottomleft' ? '0 0 0 4px' : '0 0 4px 0',
          }} />
        ))}
        {/* caption strip */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          padding: '32px 24px 16px',
          background: 'linear-gradient(transparent, rgba(0,0,0,0.75))',
          fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase',
          color: 'rgba(201,168,76,0.75)',
          textAlign: 'center',
        }}>
          Hành trình của những hạt cà phê đến từ cao nguyên Tây Nguyên
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   STAT BLOCK
───────────────────────────────────────────────────────── */
function StatGrid({ stats }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: `repeat(${stats.length}, 1fr)`,
      gap: 1, borderRadius: 16, overflow: 'hidden',
      border: '1px solid rgba(201,168,76,0.14)',
      background: 'rgba(201,168,76,0.06)',
    }}>
      {stats.map(({ value, label }, i) => (
        <div key={i} style={{
          padding: '22px 18px', textAlign: 'center',
          borderRight: i < stats.length - 1 ? '1px solid rgba(201,168,76,0.12)' : undefined,
        }}>
          <p style={{
            fontFamily: "'Cormorant Garamond','Georgia',serif",
            fontSize: 32, fontWeight: 300, color: gold, margin: 0, lineHeight: 1,
          }}>{value}</p>
          <p style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: ink2, margin: '6px 0 0' }}>{label}</p>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────── */
export default function BrandStoryPage() {
  const heroRef = useRef(null);
  const [heroLoaded, setHeroLoaded] = useState(false);

  useEffect(() => {
    // preload hero
    const img = new Image();
    img.src = MEDIA.hero;
    img.onload = () => setHeroLoaded(true);
  }, []);

  const sectionPad = { padding: '80px 0' };
  const maxW = { maxWidth: 1200, margin: '0 auto', padding: '0 32px' };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        .ct-story-root{
          background: #0c0b09;
          color: #f0ebe0;
          font-family: 'DM Sans', sans-serif;
          overflow-x: hidden;
        }

        /* Fade-in animation for sections */
        @keyframes fadeUp{
          from{opacity:0;transform:translateY(28px)}
          to{opacity:1;transform:translateY(0)}
        }
        .ct-fadein{
          animation: fadeUp 0.9s cubic-bezier(0.22,1,0.36,1) both;
        }

        /* Scroll indicator bounce */
        @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(8px)}}
        .ct-bounce{animation:bounce 1.8s ease-in-out infinite;}

        /* TOC hover */
        .ct-toc-link{
          display:flex;align-items:center;justify-content:space-between;
          padding:10px 14px;border-radius:12px;
          font-size:12px;color:rgba(240,235,224,0.55);
          border:1px solid transparent;
          text-decoration:none;
          transition:all 0.2s;
          letter-spacing:0.06em;
        }
        .ct-toc-link:hover{
          color:#f0ebe0;
          border-color:rgba(201,168,76,0.2);
          background:rgba(201,168,76,0.06);
        }

        /* Checklist items */
        .ct-check{
          display:flex;align-items:flex-start;gap:12px;
          padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05);
        }
        .ct-check:last-child{border-bottom:none;}
        .ct-check-dot{
          width:20px;height:20px;border-radius:50%;flex-shrink:0;margin-top:1px;
          background:rgba(201,168,76,0.12);
          border:1px solid rgba(201,168,76,0.35);
          display:flex;align-items:center;justify-content:center;
          color:#c9a84c;font-size:11px;
        }

        .ct-cta-gold{
          display:inline-flex;align-items:center;gap:10px;
          padding:14px 32px;border-radius:999px;
          background:linear-gradient(135deg,#c9a84c,#e8d49a);
          color:#1a1208;font-size:12px;font-weight:700;
          letter-spacing:0.16em;text-transform:uppercase;
          text-decoration:none;border:none;cursor:pointer;
          transition:filter 0.25s,gap 0.25s;
        }
        .ct-cta-gold:hover{filter:brightness(1.08);gap:14px;}

        .ct-cta-ghost{
          display:inline-flex;align-items:center;gap:10px;
          padding:14px 32px;border-radius:999px;
          background:transparent;
          color:rgba(240,235,224,0.7);font-size:12px;
          letter-spacing:0.16em;text-transform:uppercase;
          text-decoration:none;
          border:1px solid rgba(201,168,76,0.25);
          transition:border-color 0.25s,color 0.25s;
        }
        .ct-cta-ghost:hover{border-color:rgba(201,168,76,0.6);color:#c9a84c;}
      `}</style>

      <div className="ct-story-root">

        {/* ══════════════════════════════════════════════════════
            HERO — FULLSCREEN CINEMATIC
        ══════════════════════════════════════════════════════ */}
        <section ref={heroRef} style={{
          position: 'relative', height: '100svh', minHeight: 600,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden',
        }}>
          {/* bg */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url(${MEDIA.hero})`,
            backgroundSize: 'cover', backgroundPosition: 'center',
            filter: 'brightness(0.32)',
            opacity: heroLoaded ? 1 : 0,
            transition: 'opacity 1.2s ease',
          }} />
          {/* overlays */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(180deg, rgba(12,11,9,0.5) 0%, rgba(12,11,9,0.15) 40%, rgba(12,11,9,0.15) 60%, rgba(12,11,9,0.9) 100%)',
          }} />
          {/* gold grid texture */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `linear-gradient(rgba(201,168,76,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.04) 1px, transparent 1px)`,
            backgroundSize: '64px 64px',
          }} />
          {/* vertical gold rules */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: '8%', width: 1, background: 'linear-gradient(180deg,transparent,rgba(201,168,76,0.28) 20%,rgba(201,168,76,0.28) 80%,transparent)' }} />
            <div style={{ position: 'absolute', top: 0, bottom: 0, right: '8%', width: 1, background: 'linear-gradient(180deg,transparent,rgba(201,168,76,0.28) 20%,rgba(201,168,76,0.28) 80%,transparent)' }} />
          </div>

          {/* Content */}
          <div className="ct-fadein" style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '0 24px', maxWidth: 900 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 28 }}>
              <div style={{ height: 1, width: 48, background: 'rgba(201,168,76,0.5)' }} />
              <Eyebrow center>Câu Chuyện Của Chúng Tôi</Eyebrow>
              <div style={{ height: 1, width: 48, background: 'rgba(201,168,76,0.5)' }} />
            </div>

            <h1 style={{
              fontFamily: "'Cormorant Garamond','Georgia',serif",
              fontSize: 'clamp(44px,8vw,88px)',
              fontWeight: 300, lineHeight: 1.05,
              color: ink, margin: '0 0 12px',
              letterSpacing: '-0.03em',
            }}>
              Tinh hoa từ<br />
              <em style={{ color: gold, fontStyle: 'italic' }}>đất mặn miền Trung</em>
            </h1>

            <p style={{
              fontFamily: "'Cormorant Garamond','Georgia',serif",
              fontSize: 'clamp(16px,2vw,21px)',
              fontStyle: 'italic', fontWeight: 300,
              color: 'rgba(240,235,224,0.62)',
              margin: '20px 0 0', lineHeight: 1.7,
            }}>
              "Thiên nhiên chưa bao giờ dịu dàng với miền Trung — chính sự khắc nghiệt ấy đã tạo ra những hương vị không nơi nào sánh được."
            </p>
          </div>

          {/* scroll cue */}
          <div className="ct-bounce" style={{
            position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, zIndex: 2,
          }}>
            <span style={{ fontSize: 9, letterSpacing: '0.36em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.5)' }}>Cuộn xuống</span>
            <ChevronDown size={18} color="rgba(201,168,76,0.5)" />
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            MAGAZINE INTRO BAR
        ══════════════════════════════════════════════════════ */}
        <div style={{
          ...maxW,
          padding: '0 32px',
          margin: '0 auto',
        }}>
          <GoldRule opacity={0.3} my={0} />
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: 16, padding: '18px 0',
          }}>
            <span style={{ fontSize: 10, letterSpacing: '0.38em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.55)' }}>CentralTaste Magazine · Editorial Issue 01</span>
            <nav style={{ display: 'flex', gap: 24 }}>
              {['Nguồn cội', 'Chất phác', 'Chắt lọc', 'Cam kết'].map((s, i) => (
                <a key={s} href={`#ch0${i+1}`} style={{
                  fontSize: 11, letterSpacing: '0.14em', color: ink2,
                  textDecoration: 'none', transition: 'color 0.2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.color = gold}
                  onMouseLeave={e => e.currentTarget.style.color = ink2}
                >
                  0{i+1} — {s}
                </a>
              ))}
            </nav>
          </div>
          <GoldRule opacity={0.3} my={0} />
        </div>

        {/* ══════════════════════════════════════════════════════
            CH01 — NGUỒN CỘI
        ══════════════════════════════════════════════════════ */}
        <section id="ch01" style={{ ...sectionPad, ...maxW }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px 80px', alignItems: 'center' }}>

            {/* Left: text */}
            <div style={{ position: 'relative' }}>
              <ChapterNum n="01" />
              <Eyebrow>Chương 01 · Nguồn cội</Eyebrow>
              <h2 style={{
                fontFamily: "'Cormorant Garamond','Georgia',serif",
                fontSize: 'clamp(32px,4vw,52px)',
                fontWeight: 300, color: ink,
                margin: '14px 0 24px', lineHeight: 1.15, letterSpacing: '-0.02em',
              }}>
                Dải đất khắc nghiệt,<br/>
                <em style={{ color: gold }}>hương vị mang hồn</em>
              </h2>

              <p style={{ fontSize: 15, lineHeight: 1.85, color: ink2, margin: '0 0 18px' }}>
                Miền Trung Việt Nam là một dải đất hẹp bị kẹp giữa Trường Sơn và biển Đông. Nắng nhiều, gió lào, đất cằn — nhưng chính những điều kiện ấy đã thôi thúc người dân nơi đây phải sáng tạo với những gì họ có.
              </p>
              <p style={{ fontSize: 15, lineHeight: 1.85, color: ink2, margin: '0 0 32px' }}>
                Chúng tôi tin rằng cội nguồn của sự xa xỉ không đến từ sự phô trương, mà từ tính nguyên bản — từ lớp bùn đất quê hương, và từ sự bền bỉ của những nghệ nhân thầm lặng.
              </p>

              <StatGrid stats={[
                { value: '100+', label: 'Làng nghề' },
                { value: '3 TH', label: 'Thế hệ' },
                { value: '0',    label: 'Phụ gia' },
              ]} />
            </div>

            {/* Right: image */}
            <div style={{ paddingTop: 40 }}>
              <ImageFrame src={MEDIA.origin} alt="Nghệ nhân làng nghề" aspect="3/4" />
            </div>
          </div>

          {/* pull quote */}
          <div style={{ maxWidth: 720, margin: '60px auto 0' }}>
            <PullQuote
              text="Thiên nhiên chưa bao giờ dịu dàng với miền Trung — chính sự khắc nghiệt ấy đã chắt lọc ra những tinh túy không nơi nào có được."
              author="Triết lý thương hiệu"
            />
          </div>
        </section>

        {/* FULL BLEED DIVIDER — honey */}
        <CinematicDivider src={MEDIA.honey} height="55vh" caption="Mật ong rừng nguyên chất — Quảng Ngãi" />

        {/* ══════════════════════════════════════════════════════
            CH02 — CHẤT PHÁC
        ══════════════════════════════════════════════════════ */}
        <section id="ch02" style={{ ...sectionPad, ...maxW }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px 80px', alignItems: 'center' }}>

            {/* Left: image */}
            <div>
              <ImageFrame src={MEDIA.craft} alt="Quy trình thủ công" aspect="4/5" />
            </div>

            {/* Right: text */}
            <div style={{ position: 'relative' }}>
              <ChapterNum n="02" />
              <Eyebrow>Chương 02 · Tinh thần</Eyebrow>
              <h2 style={{
                fontFamily: "'Cormorant Garamond','Georgia',serif",
                fontSize: 'clamp(32px,4vw,52px)',
                fontWeight: 300, color: ink,
                margin: '14px 0 24px', lineHeight: 1.15, letterSpacing: '-0.02em',
              }}>
                Chất phác không phải<br/>
                <em style={{ color: gold }}>sự đơn giản</em>
              </h2>

              <p style={{ fontSize: 15, lineHeight: 1.85, color: ink2, margin: '0 0 18px' }}>
                Chúng tôi lội ngược những ồn ào của nền công nghiệp thực phẩm nhanh, tìm về những ngôi làng khuất sau rặng tre. Ở đó, có những gia tộc ba đời chỉ làm đúng một việc: ủ mắm, tráng bánh, hay sên kẹo mè.
              </p>

              <div style={{ margin: '24px 0' }}>
                {[
                  'Nghệ nhân nhất quyết chờ đủ nắng mới phơi bánh tráng',
                  'Không có máy móc thay thế đôi bàn tay thuần thục 30 năm',
                  'Công thức gia truyền — không có phiên bản số hoá',
                  'Mỗi mẻ là một cam kết, không phải một quy trình',
                ].map(item => (
                  <div key={item} className="ct-check">
                    <div className="ct-check-dot">✓</div>
                    <span style={{ fontSize: 14, color: ink2, lineHeight: 1.6 }}>{item}</span>
                  </div>
                ))}
              </div>

              <div style={{
                padding: '20px 24px', borderRadius: 14,
                border: '1px solid rgba(201,168,76,0.2)',
                background: 'rgba(201,168,76,0.05)',
              }}>
                <p style={{
                  fontFamily: "'Cormorant Garamond','Georgia',serif",
                  fontSize: 17, fontStyle: 'italic', color: ink,
                  margin: 0, lineHeight: 1.65,
                }}>
                  "Vẻ đẹp thực sự không nằm ở sự phô trương — nó nằm ở sự kiên định với những điều tử tế nhất."
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* VIDEO SECTION */}
        <div style={{ ...maxW, paddingTop: 0, paddingBottom: 80 }}>
          <GoldRule opacity={0.2} my={0} />
          <div style={{ paddingTop: 60 }}>
            <VideoSection />
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            CH03 — CHẮT LỌC
        ══════════════════════════════════════════════════════ */}
        <section id="ch03">
          {/* dark accent bg */}
          <div style={{ background: '#100e0a', padding: '80px 0' }}>
            <div style={maxW}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px 80px', alignItems: 'center' }}>

                {/* Left: text */}
                <div style={{ position: 'relative' }}>
                  <ChapterNum n="03" />
                  <Eyebrow>Chương 03 · Chắt lọc</Eyebrow>
                  <h2 style={{
                    fontFamily: "'Cormorant Garamond','Georgia',serif",
                    fontSize: 'clamp(32px,4vw,52px)',
                    fontWeight: 300, color: ink,
                    margin: '14px 0 24px', lineHeight: 1.15, letterSpacing: '-0.02em',
                  }}>
                    Nghệ thuật của sự<br/>
                    <em style={{ color: gold }}>chắt lọc tinh tế</em>
                  </h2>

                  <p style={{ fontSize: 15, lineHeight: 1.85, color: ink2, margin: '0 0 28px' }}>
                    Đem cái chân phương bước vào không gian đương đại là một nghệ thuật. Chúng tôi rũ bỏ sự rườm rà, giữ lại linh hồn. Mỗi sản phẩm của CentralTaste trước khi đến tay bạn đã vượt qua những tiêu chuẩn khắt khe nhất.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
                    {[
                      { h: 'Golden Ratio', d: 'Tỷ lệ vàng trong chế tác và đóng gói' },
                      { h: 'Purity Test', d: 'Kiểm định 7 tầng trước khi xuất xưởng' },
                      { h: 'Zero Additive', d: 'Tuyệt đối không phụ gia hay chất bảo quản' },
                      { h: 'Origin Map', d: 'Truy xuất nguồn gốc minh bạch từng lô' },
                    ].map(({ h, d }) => (
                      <div key={h} style={{
                        padding: '18px', borderRadius: 14,
                        border: '1px solid rgba(201,168,76,0.12)',
                        background: 'rgba(201,168,76,0.04)',
                      }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: gold, margin: '0 0 6px', letterSpacing: '0.06em' }}>{h}</p>
                        <p style={{ fontSize: 12, color: ink2, margin: 0, lineHeight: 1.6 }}>{d}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: image */}
                <div style={{ paddingTop: 20 }}>
                  <ImageFrame src={MEDIA.curation} alt="Plating nghệ thuật" aspect="3/4" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STANDALONE PULL QUOTE */}
        <div style={{ ...maxW, paddingTop: 80, paddingBottom: 80 }}>
          <PullQuote
            text="Không chỉ là thưởng thức — đó là một nghi thức. Khi bạn mở hộp, bạn không chỉ nhận được sản phẩm, bạn nhận được cả một câu chuyện."
            author="Biên tập viên · CentralTaste"
          />
        </div>

        {/* FULL BLEED DIVIDER — giftbox */}
        <CinematicDivider src={MEDIA.giftbox} height="100vh" caption="Hộp quà — Tinh thần của sự trân trọng" overlay={0.3} />

        {/* ══════════════════════════════════════════════════════
            CH04 — CAM KẾT
        ══════════════════════════════════════════════════════ */}
        <section id="ch04" style={{ ...sectionPad, ...maxW }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px 80px', alignItems: 'center' }}>

            {/* Left: image */}
            <div>
              <ImageFrame src={MEDIA.promise} alt="Cam kết thương hiệu" aspect="4/5" />
            </div>

            {/* Right: text */}
            <div style={{ position: 'relative' }}>
              <ChapterNum n="04" />
              <Eyebrow>Chương 04 · Cam kết</Eyebrow>
              <h2 style={{
                fontFamily: "'Cormorant Garamond','Georgia',serif",
                fontSize: 'clamp(32px,4vw,52px)',
                fontWeight: 300, color: gold,
                fontStyle: 'italic',
                margin: '14px 0 24px', lineHeight: 1.15, letterSpacing: '-0.02em',
              }}>
                Lời cam kết di sản
              </h2>

              <p style={{ fontSize: 15, lineHeight: 1.85, color: ink2, margin: '0 0 18px' }}>
                Mỗi hộp quà bạn nhận được mang theo hơi thở của đất, mồ hôi của người thợ và chuẩn mực của một thương hiệu cao cấp. Chúng tôi làm việc trực tiếp với làng nghề để đảm bảo dòng chảy giá trị được trao lại xứng đáng.
              </p>

              {/* Brand card */}
              <div style={{
                margin: '28px 0',
                borderRadius: 20,
                padding: '24px',
                background: 'linear-gradient(135deg, rgba(201,168,76,0.12), rgba(201,168,76,0.04))',
                border: '1px solid rgba(201,168,76,0.25)',
                position: 'relative', overflow: 'hidden',
              }}>
                {/* bg watermark */}
                <div style={{
                  position: 'absolute', top: -10, right: -10,
                  fontFamily: "'Cormorant Garamond',serif",
                  fontSize: 80, fontWeight: 300,
                  color: 'rgba(201,168,76,0.06)',
                  lineHeight: 1, userSelect: 'none',
                }}>DAIF</div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'linear-gradient(135deg,#c9a84c,#e8d49a)',
                    flexShrink: 0,
                  }} />
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: ink, margin: 0, letterSpacing: '0.06em' }}>DAIF CENTRALTASTE</p>
                    <p style={{ fontSize: 10, color: 'rgba(201,168,76,0.7)', margin: 0, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Đặc sản miền Trung</p>
                  </div>
                </div>
                <p style={{ fontSize: 13, color: ink2, margin: 0, lineHeight: 1.7 }}>
                  Chúng tôi không thay thế làng nghề. Chúng tôi làm nhiệm vụ nâng niu câu chuyện của làng nghề để câu chuyện ấy đi xa hơn — đến những bàn tiệc xứng đáng.
                </p>
              </div>

              <p style={{
                fontFamily: "'Cormorant Garamond','Georgia',serif",
                fontSize: 18, fontStyle: 'italic', fontWeight: 300,
                color: 'rgba(240,235,224,0.65)', lineHeight: 1.7, margin: 0,
              }}>
                "Tinh tế ở hình thức, chính gốc ở nội dung — đây là tiêu chí duy nhất mà không ai trong chúng tôi được phép thỏa hiệp."
              </p>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            CTA SECTION
        ══════════════════════════════════════════════════════ */}
        <section style={{
          position: 'relative', overflow: 'hidden',
          padding: '100px 24px',
          textAlign: 'center',
        }}>
          {/* bg */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url(${MEDIA.honey})`,
            backgroundSize: 'cover', backgroundPosition: 'center',
            filter: 'brightness(0.15)',
          }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #0c0b09 0%, rgba(12,11,9,0.3) 50%, #0c0b09 100%)' }} />

          <div style={{ position: 'relative', zIndex: 2 }}>
            <Eyebrow center>Bắt đầu hành trình</Eyebrow>
            <h2 style={{
              fontFamily: "'Cormorant Garamond','Georgia',serif",
              fontSize: 'clamp(32px,5vw,60px)',
              fontWeight: 300, color: ink,
              margin: '16px 0 8px', letterSpacing: '-0.03em',
            }}>
              Khám phá bộ sưu tập<br />
              <em style={{ color: gold }}>đặc sản tinh tuyển</em>
            </h2>
            <p style={{
              fontFamily: "'Cormorant Garamond','Georgia',serif",
              fontSize: 18, fontStyle: 'italic', fontWeight: 300,
              color: ink2, margin: '0 0 44px', lineHeight: 1.7,
            }}>
              Mỗi sản phẩm là một trang của câu chuyện miền Trung.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/products" className="ct-cta-gold">
                Khám phá sản phẩm <ArrowRight size={16} />
              </Link>
              <Link href="/contact" className="ct-cta-ghost">
                Liên hệ tư vấn
              </Link>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}