'use client';

import { useEffect, useRef, useState } from 'react';
import emailjs from '@emailjs/browser';
import Link from 'next/link';
import {
  Phone, Mail, MapPin, Clock, ArrowRight, Send,
  CheckCircle2, MessageSquare, Gift, Building2,
  ChevronDown, Sparkles, Quote
} from 'lucide-react';

/* ──────────────────────────────────────────────────────────
   EMAILJS CONFIG
────────────────────────────────────────────────────────── */
const EJS_SERVICE_ID  = 'service_8q44fpr';
const EJS_TEMPLATE_ID = 'template_bep3aor';
const EJS_ADMIN_TEMPLATE_ID = 'template_8nc5tq9';
const EJS_PUBLIC_KEY  = '168WkV2EuECMCgqLk';

/* ──────────────────────────────────────────────────────────
   MEDIA
────────────────────────────────────────────────────────── */
const MEDIA = {
  hero:    'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=2000&q=85',
  mid:     'https://images.unsplash.com/photo-1433891248364-3ce993ff0e92?w=2000&q=85',
  onyx:    'https://images.unsplash.com/photo-1675306408031-a9aad9f23308?w=2000&q=85',
};

/* ──────────────────────────────────────────────────────────
   DESIGN TOKENS
────────────────────────────────────────────────────────── */
const gold = '#c9a84c';
const ink  = '#f0ebe0';
const ink2 = 'rgba(240,235,224,0.6)';

const CONTACT_REASONS = [
  { value: 'order',   label: '📦  Hỏi về đơn hàng / Giao nhận' },
  { value: 'product', label: '🫙  Thông tin sản phẩm / Đặt số lượng lớn' },
  { value: 'gift',    label: '🎁  Quà tặng doanh nghiệp (B2B Gift)' },
  { value: 'quality', label: '⭐  Phản hồi chất lượng sản phẩm' },
  { value: 'press',   label: '📰  Báo chí / Truyền thông' },
  { value: 'other',   label: '💬  Khác' },
];

const FAQS = [
  {
    q: 'Đặt hàng số lượng lớn để làm quà tặng doanh nghiệp?',
    a: 'Có. DAIF CentralTaste cung cấp dịch vụ B2B Gift Curation từ 20 hộp trở lên — thiết kế bao bì riêng, in logo, giao hàng tận nơi. Chọn "Quà tặng doanh nghiệp" để được ưu tiên tư vấn.',
  },
  {
    q: 'Thời gian xử lý và giao hàng?',
    a: '1–2 ngày làm việc xử lý đơn, 2–5 ngày giao hàng toàn quốc. Gift Set cao cấp được đóng gói thủ công và kiểm tra trước khi xuất kho.',
  },
  {
    q: 'Chính sách đổi trả như thế nào?',
    a: 'Chấp nhận đổi trả trong 7 ngày kể từ ngày nhận nếu sản phẩm có vấn đề về chất lượng. Liên hệ concierge để được hỗ trợ ngay lập tức.',
  },
  {
    q: 'Làm sao để trở thành đại lý phân phối?',
    a: 'DAIF đang mở rộng mạng lưới đại lý. Gửi email tới hq.donyxgroup@gmail.com với tiêu đề "Partnership Inquiry" để kết nối bộ phận phát triển kinh doanh.',
  },
];

/* ──────────────────────────────────────────────────────────
   ATOMS (giữ cùng ngôn ngữ với stories/page.jsx)
────────────────────────────────────────────────────────── */
function GoldRule({ opacity = 0.25, my = 0 }) {
  return (
    <div style={{
      height: 1, margin: `${my}px 0`,
      background: `linear-gradient(90deg,transparent,rgba(201,168,76,${opacity}) 30%,rgba(201,168,76,${opacity}) 70%,transparent)`,
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

/* Full-bleed cinematic divider — identical to stories page */
function CinematicDivider({ src, height = '60vh', caption, overlay = 0.45, children }) {
  return (
    <div style={{ position: 'relative', width: '100%', height, overflow: 'hidden' }}>
      <img src={src} alt={caption || ''} loading="lazy" style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center',
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(180deg,rgba(12,11,9,0.7) 0%,rgba(12,11,9,${overlay}) 40%,rgba(12,11,9,${overlay}) 60%,rgba(12,11,9,0.85) 100%)`,
      }} />
      {/* gold vertical rules */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: '8%', width: 1, background: 'linear-gradient(180deg,transparent,rgba(201,168,76,0.3) 20%,rgba(201,168,76,0.3) 80%,transparent)' }} />
        <div style={{ position: 'absolute', top: 0, bottom: 0, right: '8%', width: 1, background: 'linear-gradient(180deg,transparent,rgba(201,168,76,0.3) 20%,rgba(201,168,76,0.3) 80%,transparent)' }} />
      </div>
      {/* slot for overlay content */}
      {children && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {children}
        </div>
      )}
      {caption && !children && (
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

/* ──────────────────────────────────────────────────────────
   CONTACT FORM (glassmorphism — like the login card)
────────────────────────────────────────────────────────── */
function ContactForm() {
  const scriptRef = useRef(false);
  const [form, setForm]       = useState({ name: '', email: '', phone: '', reason: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState('');

  useEffect(() => {
    if (scriptRef.current) return;
    scriptRef.current = true;
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
    s.async = true;
    s.onload = () => window.emailjs?.init(EJS_PUBLIC_KEY);
    document.head.appendChild(s);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setError('Vui lòng điền đầy đủ họ tên, email và nội dung.'); 
      return;
    }
    
    setSending(true); 
    setError('');
    
try {
      const templateParams = {
        user_name:  form.name,
        user_email: form.email,
        user_phone: form.phone || 'Không cung cấp',
        subject:    CONTACT_REASONS.find(r => r.value === form.reason)?.label || 'Chưa xác định chủ đề',
        message:    form.message,
      };

      // Kích hoạt gửi đồng thời cả 2 mẫu thư cùng một lúc
      await Promise.all([
        // Luồng 1: Thư luxury gửi tới hòm thư của khách hàng
        emailjs.send(EJS_SERVICE_ID, EJS_TEMPLATE_ID, templateParams, EJS_PUBLIC_KEY),
        
        // Luồng 2: Phiếu Ticket chứa dữ liệu gửi tới hòm thư của Ban quản trị
        emailjs.send(EJS_SERVICE_ID, EJS_ADMIN_TEMPLATE_ID, templateParams, EJS_PUBLIC_KEY)
      ]);
      
      setSent(true);
      setForm({ name: '', email: '', phone: '', reason: '', message: '' });
    } catch (err) {
      console.error('EmailJS Error:', err);
      setError('Hệ thống đang bận. Vui lòng thử lại sau.');
    } finally {
      setSending(false);
    }
  }

  const inputBase = {
    width: '100%', height: 50, borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.04)',
    color: ink, fontSize: 14, padding: '0 16px',
    outline: 'none', fontFamily: 'var(--font-sans)',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box',
  };
  const labelBase = {
    display: 'block', fontSize: 11,
    letterSpacing: '0.2em', textTransform: 'uppercase',
    color: 'rgba(240,235,224,0.5)', marginBottom: 8,
  };
  const focus = e => { e.target.style.borderColor = 'rgba(201,168,76,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(201,168,76,0.08)'; };
  const blur  = e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; };

  if (sent) return (
    <div style={{ textAlign: 'center', padding: '48px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
      <div style={{
        width: 68, height: 68, borderRadius: '50%',
        background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <CheckCircle2 size={30} color="#4ade80" />
      </div>
      <div>
        <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontStyle: 'italic', color: ink, margin: '0 0 10px' }}>
          Tin nhắn đã đến tay chúng tôi
        </p>
        <p style={{ fontSize: 13, color: ink2, margin: 0, lineHeight: 1.8 }}>
          Concierge sẽ phản hồi trong vòng 2 giờ làm việc.<br />
          Cảm ơn bạn đã tin tưởng DAIF CentralTaste.
        </p>
      </div>
      <button onClick={() => setSent(false)} style={{
        padding: '10px 28px', borderRadius: 999,
        border: '1px solid rgba(201,168,76,0.3)', background: 'transparent',
        color: gold, fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase',
        cursor: 'pointer', fontFamily: 'var(--font-sans)',
      }}>
        Gửi tin khác
      </button>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={labelBase}>Họ tên <span style={{ color: gold }}>*</span></label>
          <input type="text" required placeholder="Nguyễn Văn A"
            value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            style={inputBase} onFocus={focus} onBlur={blur} />
        </div>
        <div>
          <label style={labelBase}>Email <span style={{ color: gold }}>*</span></label>
          <input type="email" required placeholder="email@example.com"
            value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
            style={inputBase} onFocus={focus} onBlur={blur} />
        </div>
      </div>

      <div>
        <label style={labelBase}>Số điện thoại</label>
        <input type="tel" placeholder="0901 234 567"
          value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
          style={inputBase} onFocus={focus} onBlur={blur} />
      </div>

      <div>
        <label style={labelBase}>Chủ đề liên hệ</label>
        <select value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))}
          style={{
            ...inputBase, cursor: 'pointer', appearance: 'none',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23c9a84c' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center', paddingRight: 40,
          }}
          onFocus={focus} onBlur={blur}
        >
          <option value="" style={{ background: '#1a1810' }}>— Chọn chủ đề —</option>
          {CONTACT_REASONS.map(r => <option key={r.value} value={r.value} style={{ background: '#1a1810' }}>{r.label}</option>)}
        </select>
      </div>

      <div>
        <label style={labelBase}>Nội dung <span style={{ color: gold }}>*</span></label>
        <textarea required rows={4} placeholder="Chia sẻ với chúng tôi..."
          value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
          style={{ ...inputBase, height: 'auto', padding: '12px 16px', resize: 'vertical', lineHeight: 1.65 }}
          onFocus={focus} onBlur={blur}
        />
      </div>

      {error && (
        <div style={{
          fontSize: 12, color: 'rgba(252,165,165,0.9)',
          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)',
          borderRadius: 10, padding: '10px 14px',
        }}>{error}</div>
      )}

      <button type="submit" disabled={sending} style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        width: '100%', height: 52, borderRadius: 12, border: 'none',
        background: `linear-gradient(135deg, ${gold}, #e8d49a 50%, #c9a030)`,
        color: '#1a1208', fontSize: 12, fontWeight: 700,
        letterSpacing: '0.18em', textTransform: 'uppercase',
        cursor: sending ? 'not-allowed' : 'pointer',
        opacity: sending ? 0.6 : 1,
        fontFamily: 'var(--font-sans)',
        transition: 'filter 0.25s, transform 0.25s',
        boxShadow: '0 4px 20px rgba(201,168,76,0.28)',
      }}
        onMouseEnter={e => { if (!sending) { e.currentTarget.style.filter = 'brightness(1.08)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}}
        onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)'; e.currentTarget.style.transform = 'translateY(0)'; }}
      >
        {sending
          ? <><div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(26,18,8,0.3)', borderTopColor: '#1a1208', animation: 'spin 0.8s linear infinite' }} />Đang xử lý...</>
          : <><Send size={15} />Gửi yêu cầu</>
        }
      </button>

      <p style={{ fontSize: 11, color: 'rgba(240,235,224,0.28)', textAlign: 'center', margin: 0, lineHeight: 1.6 }}>
        Thông tin của bạn được bảo mật tuyệt đối bởi hệ thống của D'Onyx Group.
      </p>
    </form>
  );
}

/* ──────────────────────────────────────────────────────────
   MAIN PAGE
────────────────────────────────────────────────────────── */
export default function ContactPage() {
  const [heroLoaded, setHeroLoaded] = useState(false);
  const [faqOpen, setFaqOpen]       = useState(null);

  useEffect(() => {
    const img = new Image();
    img.src = MEDIA.hero;
    img.onload = () => setHeroLoaded(true);
  }, []);

  const maxW = { maxWidth: 1200, margin: '0 auto', padding: '0 32px' };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        .ct-contact-root {
          background: #0c0b09;
          color: #f0ebe0;
          font-family: 'DM Sans', sans-serif;
          overflow-x: hidden;
        }

        @keyframes fadeUp {
          from { opacity:0; transform:translateY(24px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .ct-fadein { animation: fadeUp 0.9s cubic-bezier(0.22,1,0.36,1) both; }

        @keyframes bounce {
          0%,100% { transform:translateX(-50%) translateY(0); }
          50%      { transform:translateX(-50%) translateY(8px); }
        }
        .ct-bounce { animation: bounce 1.8s ease-in-out infinite; }

        @keyframes spin { to { transform:rotate(360deg); } }

        .ct-info-card {
          display:flex; align-items:flex-start; gap:14px;
          padding:18px 20px; border-radius:16px;
          border:1px solid rgba(201,168,76,0.12);
          background:rgba(201,168,76,0.03);
          text-decoration:none;
          transition: border-color 0.25s, background 0.25s, transform 0.25s;
        }
        .ct-info-card:hover {
          border-color:rgba(201,168,76,0.35);
          background:rgba(201,168,76,0.07);
          transform:translateY(-2px);
        }

        .ct-channel {
          display:flex; align-items:center; gap:14px;
          padding:14px 18px; border-radius:14px;
          border:1px solid rgba(255,255,255,0.07);
          background:rgba(255,255,255,0.02);
          text-decoration:none;
          transition: border-color 0.2s, background 0.2s, transform 0.2s;
        }
        .ct-channel:hover {
          border-color:rgba(201,168,76,0.3);
          background:rgba(201,168,76,0.05);
          transform:translateX(5px);
        }

        .ct-faq-btn {
          width:100%; display:flex; align-items:center; justify-content:space-between;
          padding:18px 20px; border-radius:14px;
          border:1px solid rgba(201,168,76,0.1);
          background:rgba(255,255,255,0.02);
          color:#f0ebe0; text-align:left; cursor:pointer;
          font-family:'DM Sans',sans-serif; font-size:14px; font-weight:500;
          transition: border-color 0.2s, background 0.2s;
        }
        .ct-faq-btn:hover, .ct-faq-btn.open {
          border-color:rgba(201,168,76,0.3);
          background:rgba(201,168,76,0.05);
        }
        .ct-faq-chevron {
          transition:transform 0.3s cubic-bezier(0.22,1,0.36,1);
          color:rgba(201,168,76,0.55); flex-shrink:0; margin-left:12px;
        }
        .ct-faq-chevron.open { transform:rotate(180deg); }
        .ct-faq-answer {
          overflow:hidden;
          transition: max-height 0.4s cubic-bezier(0.22,1,0.36,1), opacity 0.3s;
        }

        .ct-onyx-wrap {
          position:relative; overflow:hidden;
          border-radius:24px;
          border:1px solid rgba(201,168,76,0.2);
          background:linear-gradient(135deg,rgba(201,168,76,0.07),rgba(255,255,255,0.02));
          padding:40px 44px;
        }
        .ct-onyx-wrap::before {
          content:"D'ONYX";
          position:absolute; right:-8px; bottom:-16px;
          font-family:'Cormorant Garamond',serif;
          font-size:96px; font-weight:300; letter-spacing:-0.04em;
          color:rgba(201,168,76,0.045);
          pointer-events:none; user-select:none; line-height:1;
        }

        .ct-glass {
          border-radius:24px;
          border:1px solid rgba(255,255,255,0.1);
          background:rgba(14,12,8,0.72);
          backdrop-filter:blur(24px);
          -webkit-backdrop-filter:blur(24px);
          box-shadow:
            0 0 0 1px rgba(201,168,76,0.06),
            0 8px 32px rgba(0,0,0,0.5),
            0 32px 64px rgba(0,0,0,0.35),
            inset 0 1px 0 rgba(255,255,255,0.05);
        }
      `}</style>

      <div className="ct-contact-root">

        {/* ══════════════════════════════════════════
            HERO — fullscreen, same DNA as stories
        ══════════════════════════════════════════ */}
        <section style={{
          position: 'relative', height: '100svh', minHeight: 600,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden',
        }}>
          {/* bg photo */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url(${MEDIA.hero})`,
            backgroundSize: 'cover', backgroundPosition: 'center 40%',
            filter: 'brightness(0.28)',
            opacity: heroLoaded ? 1 : 0,
            transition: 'opacity 1.2s ease',
          }} />
          {/* cinematic gradient */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(180deg,rgba(12,11,9,0.55) 0%,rgba(12,11,9,0.1) 40%,rgba(12,11,9,0.1) 60%,rgba(12,11,9,0.92) 100%)',
          }} />
          {/* gold grid */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'linear-gradient(rgba(201,168,76,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(201,168,76,0.04) 1px,transparent 1px)',
            backgroundSize: '64px 64px',
          }} />
          {/* vertical gold rules */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: '8%', width: 1, background: 'linear-gradient(180deg,transparent,rgba(201,168,76,0.28) 20%,rgba(201,168,76,0.28) 80%,transparent)' }} />
            <div style={{ position: 'absolute', top: 0, bottom: 0, right: '8%', width: 1, background: 'linear-gradient(180deg,transparent,rgba(201,168,76,0.28) 20%,rgba(201,168,76,0.28) 80%,transparent)' }} />
          </div>

          {/* Hero copy */}
          <div className="ct-fadein" style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '0 24px', maxWidth: 820 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 28 }}>
              <div style={{ height: 1, width: 48, background: 'rgba(201,168,76,0.5)' }} />
              <Eyebrow center>Customer Concierge · DAIF CentralTaste</Eyebrow>
              <div style={{ height: 1, width: 48, background: 'rgba(201,168,76,0.5)' }} />
            </div>

            <h1 style={{
              fontFamily: "'Cormorant Garamond','Georgia',serif",
              fontSize: 'clamp(44px,8vw,84px)',
              fontWeight: 300, lineHeight: 1.05, color: ink,
              margin: '0 0 20px', letterSpacing: '-0.03em',
            }}>
              Mỗi câu hỏi của bạn<br />
              <em style={{ color: gold, fontStyle: 'italic' }}>xứng đáng được lắng nghe</em>
            </h1>

            <p style={{
              fontFamily: "'Cormorant Garamond','Georgia',serif",
              fontSize: 'clamp(16px,2vw,21px)',
              fontStyle: 'italic', fontWeight: 300,
              color: 'rgba(240,235,224,0.6)',
              margin: 0, lineHeight: 1.7,
            }}>
              "Chúng tôi không có hộp thư rác — chỉ có những cuộc trò chuyện có ý nghĩa."
            </p>

            {/* scroll-down CTAs */}
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 40, flexWrap: 'wrap' }}>
              <a href="#contact-form" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '13px 28px', borderRadius: 999,
                background: `linear-gradient(135deg,${gold},#e8d49a)`,
                color: '#1a1208', fontSize: 12, fontWeight: 700,
                letterSpacing: '0.14em', textTransform: 'uppercase',
                textDecoration: 'none',
                transition: 'filter 0.25s',
              }}
                onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.08)'}
                onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}
              >
                <Send size={14} /> Gửi tin nhắn
              </a>
              <a href="#contact-info" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '13px 28px', borderRadius: 999,
                border: '1px solid rgba(201,168,76,0.3)',
                color: 'rgba(240,235,224,0.75)', fontSize: 12,
                letterSpacing: '0.14em', textTransform: 'uppercase',
                textDecoration: 'none', background: 'transparent',
                transition: 'border-color 0.25s, color 0.25s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.65)'; e.currentTarget.style.color = gold; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.3)'; e.currentTarget.style.color = 'rgba(240,235,224,0.75)'; }}
              >
                <Phone size={14} /> Xem thông tin
              </a>
            </div>
          </div>

          {/* bounce scroll cue */}
          <div className="ct-bounce" style={{
            position: 'absolute', bottom: 32, left: '50%',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, zIndex: 2,
          }}>
            <span style={{ fontSize: 9, letterSpacing: '0.36em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.5)' }}>Cuộn xuống</span>
            <ChevronDown size={18} color="rgba(201,168,76,0.5)" />
          </div>
        </section>

        {/* ══════════════════════════════════════════
            MAGAZINE NAV BAR (matches stories)
        ══════════════════════════════════════════ */}
        <div style={{ ...maxW }}>
          <GoldRule opacity={0.3} />
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: 16, padding: '18px 0',
          }}>
            <span style={{ fontSize: 10, letterSpacing: '0.38em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.55)' }}>
              CentralTaste · Concierge Service
            </span>
            <nav style={{ display: 'flex', gap: 24 }}>
              {[
                ['#contact-info',  'Thông tin'],
                ['#contact-form',  'Gửi yêu cầu'],
                ['#contact-faq',   'FAQ'],
                ['#contact-onyx',  'Đối tác'],
              ].map(([href, label]) => (
                <a key={href} href={href} style={{
                  fontSize: 11, letterSpacing: '0.14em', color: ink2,
                  textDecoration: 'none', transition: 'color 0.2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.color = gold}
                  onMouseLeave={e => e.currentTarget.style.color = ink2}
                >
                  {label}
                </a>
              ))}
            </nav>
          </div>
          <GoldRule opacity={0.3} />
        </div>

        {/* ══════════════════════════════════════════
            SECTION 1 — CONTACT INFO + FORM (2-col)
        ══════════════════════════════════════════ */}
        <section id="contact-info" style={{ padding: '80px 0' }}>
          <div style={{ ...maxW }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: '60px 80px', alignItems: 'start' }}>

              {/* LEFT — Contact info */}
              <div>
                {/* Section title */}
                <Eyebrow>Kênh liên lạc</Eyebrow>
                <h2 style={{
                  fontFamily: "'Cormorant Garamond','Georgia',serif",
                  fontSize: 'clamp(32px,4vw,48px)',
                  fontWeight: 300, color: ink,
                  margin: '14px 0 8px', lineHeight: 1.15, letterSpacing: '-0.02em',
                }}>
                  Dịch vụ Concierge
                  <br /><em style={{ color: gold }}>đặc quyền của bạn</em>
                </h2>
                <p style={{ fontSize: 15, color: ink2, lineHeight: 1.85, margin: '0 0 36px', maxWidth: 460 }}>
                  Đội ngũ DAIF trực tuyến từ 08:00 – 20:00, Thứ 2 đến Thứ 7. Mọi yêu cầu đều được phân loại và phản hồi có chủ đích — không chatbot, không trả lời mẫu.
                </p>

                {/* Info cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
                  {[
                    { icon: Phone,   label: 'Hotline CSKH (07:30 – 21:00)', value: '1900 8888',                href: 'tel:19008888' },
                    { icon: Mail,    label: 'Concierge Email',               value: 'concierge.daif@gmail.com', href: 'mailto:concierge.daif@gmail.com' },
                    { icon: MapPin,  label: 'Văn phòng vận hành',            value: 'Kon Tum, Việt Nam' },
                    { icon: Clock,   label: 'Giờ phản hồi',                  value: 'Thứ 2–7 · 08:00–20:00' },
                  ].map(({ icon: Icon, label, value, href }) => {
                    const inner = (
                      <>
                        <div style={{
                          width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                          background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', color: gold,
                        }}>
                          <Icon size={16} />
                        </div>
                        <div>
                          <p style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.55)', margin: '0 0 3px' }}>{label}</p>
                          <p style={{ fontSize: 14, color: ink, fontWeight: 500, margin: 0 }}>{value}</p>
                        </div>
                      </>
                    );
                    return href
                      ? <a key={label} href={href} className="ct-info-card">{inner}</a>
                      : <div key={label} className="ct-info-card">{inner}</div>;
                  })}
                </div>

                {/* Quick channels */}
                <p style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.55)', marginBottom: 12 }}>
                  Kênh nhanh
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { icon: MessageSquare, label: 'Facebook Chat',   sub: 'Fanpage DAIF CentralTaste',        href: 'https://facebook.com', color: '#1877f2' },
                    { icon: Phone,         label: 'Zalo OA',          sub: 'Phản hồi dưới 30 phút',           href: 'https://zalo.me',      color: '#0068ff' },
                    { icon: Gift,          label: 'B2B Gift Desk',    sub: 'Đặt quà tặng số lượng lớn',       href: `mailto:concierge.daif@gmail.com?subject=B2B%20Gift%20Inquiry`, color: gold },
                  ].map(({ icon: Icon, label, sub, href, color }) => (
                    <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="ct-channel">
                      <div style={{
                        width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                        background: `${color}18`, border: `1px solid ${color}28`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color,
                      }}>
                        <Icon size={15} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, color: ink, fontWeight: 500, margin: '0 0 2px' }}>{label}</p>
                        <p style={{ fontSize: 11, color: ink2, margin: 0 }}>{sub}</p>
                      </div>
                      <ArrowRight size={13} style={{ color: 'rgba(201,168,76,0.4)', flexShrink: 0 }} />
                    </a>
                  ))}
                </div>

                {/* Online badge */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  marginTop: 20, padding: '12px 16px', borderRadius: 12,
                  border: '1px solid rgba(34,197,94,0.18)', background: 'rgba(34,197,94,0.06)',
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e', flexShrink: 0 }} />
                  <p style={{ fontSize: 12, color: 'rgba(134,239,172,0.85)', margin: 0 }}>
                    Concierge đang trực tuyến · Phản hồi trung bình <strong>dưới 2 giờ</strong>
                  </p>
                </div>
              </div>

              {/* RIGHT — Glass form card */}
              <div id="contact-form" className="ct-glass" style={{ padding: '36px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <Sparkles size={14} color={gold} />
                  <Eyebrow>Gửi yêu cầu</Eyebrow>
                </div>
                <h2 style={{
                  fontFamily: "'Cormorant Garamond','Georgia',serif",
                  fontSize: 26, fontWeight: 400, color: ink,
                  margin: '8px 0 24px', letterSpacing: '-0.01em',
                }}>
                  Chúng tôi lắng nghe
                </h2>
                <ContactForm />
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            CINEMATIC DIVIDER 1
        ══════════════════════════════════════════ */}
        <CinematicDivider src={MEDIA.mid} height="50vh" caption="Từ làng nghề đến tay bạn · DAIF CentralTaste" overlay={0.5} />

        {/* ══════════════════════════════════════════
            SECTION 2 — FAQ
        ══════════════════════════════════════════ */}
        <section id="contact-faq" style={{ padding: '80px 0' }}>
          <div style={{ ...maxW }}>
            <div style={{ display: 'grid', gridTemplateColumns: '320px minmax(0,1fr)', gap: '0 80px', alignItems: 'start' }}>

              {/* Left: sticky label */}
              <div style={{ position: 'sticky', top: 100 }}>
                <Eyebrow>Câu hỏi thường gặp</Eyebrow>
                <h2 style={{
                  fontFamily: "'Cormorant Garamond','Georgia',serif",
                  fontSize: 'clamp(28px,3vw,40px)',
                  fontWeight: 300, color: ink,
                  margin: '14px 0 20px', lineHeight: 1.2, letterSpacing: '-0.02em',
                }}>
                  Có thể bạn<br />
                  <em style={{ color: gold }}>đang thắc mắc…</em>
                </h2>
                <div style={{ height: 1, width: 48, background: `linear-gradient(90deg,${gold},transparent)`, marginBottom: 20 }} />
                <p style={{ fontSize: 13, color: ink2, lineHeight: 1.8 }}>
                  Nếu không tìm thấy câu trả lời bên dưới, hãy gửi tin nhắn trực tiếp — đội ngũ concierge luôn sẵn sàng.
                </p>
                <a href="#contact-form" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  marginTop: 20, padding: '10px 22px', borderRadius: 999,
                  border: '1px solid rgba(201,168,76,0.3)', background: 'rgba(201,168,76,0.06)',
                  color: gold, fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase',
                  textDecoration: 'none', transition: 'all 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,168,76,0.14)'; e.currentTarget.style.borderColor = 'rgba(201,168,76,0.55)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(201,168,76,0.06)'; e.currentTarget.style.borderColor = 'rgba(201,168,76,0.3)'; }}
                >
                  Liên hệ ngay <ArrowRight size={13} />
                </a>
              </div>

              {/* Right: FAQ accordion */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {FAQS.map((faq, i) => (
                  <div key={i}>
                    <button
                      className={`ct-faq-btn${faqOpen === i ? ' open' : ''}`}
                      onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                    >
                      <span style={{ paddingRight: 8, lineHeight: 1.4 }}>{faq.q}</span>
                      <ChevronDown size={16} className={`ct-faq-chevron${faqOpen === i ? ' open' : ''}`} />
                    </button>
                    <div className="ct-faq-answer" style={{ maxHeight: faqOpen === i ? 300 : 0, opacity: faqOpen === i ? 1 : 0 }}>
                      <div style={{
                        padding: '16px 20px',
                        fontSize: 14, color: ink2, lineHeight: 1.8,
                        borderLeft: `2px solid rgba(201,168,76,0.25)`,
                        margin: '4px 0 8px 10px',
                      }}>
                        {faq.a}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            PULL QUOTE (giống stories page)
        ══════════════════════════════════════════ */}
        <div style={{ ...maxW, paddingBottom: 80 }}>
          <div style={{
            position: 'relative', padding: '44px 52px', borderRadius: 24,
            border: '1px solid rgba(201,168,76,0.15)',
            background: 'rgba(201,168,76,0.04)', textAlign: 'center',
          }}>
            <Quote size={48} style={{
              position: 'absolute', top: -16, left: '50%', transform: 'translateX(-50%)',
              color: gold, opacity: 0.3,
            }} />
            <p style={{
              fontFamily: "'Cormorant Garamond','Georgia',serif",
              fontSize: 'clamp(18px,2.5vw,26px)',
              fontStyle: 'italic', fontWeight: 300,
              lineHeight: 1.65, color: ink, margin: '16px 0 0',
            }}>
              Mỗi tin nhắn bạn gửi đến là một cơ hội để chúng tôi chứng minh rằng dịch vụ cao cấp không chỉ nằm ở sản phẩm — mà còn ở từng điểm chạm nhỏ nhất.
            </p>
            <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
              <div style={{ width: 32, height: 1, background: 'rgba(201,168,76,0.4)' }} />
              <span style={{ fontSize: 10, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.6)' }}>Triết lý dịch vụ · DAIF CentralTaste</span>
              <div style={{ width: 32, height: 1, background: 'rgba(201,168,76,0.4)' }} />
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════
            CINEMATIC DIVIDER 2 + D'ONYX OVERLAY
        ══════════════════════════════════════════ */}
        <CinematicDivider src={MEDIA.onyx} height="70vh" overlay={0.25}>
          <div style={{ textAlign: 'center', padding: '0 24px', maxWidth: 700 }}>
            <p style={{ fontSize: 9, letterSpacing: '0.42em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.6)', marginBottom: 16 }}>
              Corporate &amp; Strategic Relations
            </p>
            <h2 style={{
              fontFamily: "'Cormorant Garamond','Georgia',serif",
              fontSize: 'clamp(36px,6vw,72px)',
              fontWeight: 300, color: ink, letterSpacing: '-0.03em',
              margin: '0 0 16px', lineHeight: 1,
            }}>
              D'Onyx Group
            </h2>
            <p style={{
              fontFamily: "'Cormorant Garamond','Georgia',serif",
              fontSize: 18, fontStyle: 'italic', fontWeight: 300,
              color: 'rgba(240,235,224,0.55)', margin: 0, lineHeight: 1.7,
            }}>
              CentralTaste — một dự án trọng điểm của DAIF,<br />thuộc hệ sinh thái D'Onyx Group.
            </p>
          </div>
        </CinematicDivider>

        {/* ══════════════════════════════════════════
            SECTION 3 — D'ONYX CORPORATE
        ══════════════════════════════════════════ */}
        <section id="contact-onyx" style={{ padding: '80px 0' }}>
          <div style={{ ...maxW }}>
            <div className="ct-onyx-wrap">
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 260px', gap: '0 60px', alignItems: 'start' }}>
                <div>
                  <p style={{ fontSize: 9, letterSpacing: '0.4em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.5)', marginBottom: 12 }}>
                    Corporate &amp; Strategic Relations
                  </p>
                  <h3 style={{
                    fontFamily: "'Cormorant Garamond','Georgia',serif",
                    fontSize: 'clamp(24px,3vw,36px)',
                    fontWeight: 300, color: ink,
                    margin: '0 0 16px', letterSpacing: '-0.01em',
                  }}>
                    Quan hệ Doanh nghiệp<br />
                    <em style={{ color: gold }}>& Đối tác Chiến lược</em>
                  </h3>
                  <p style={{ fontSize: 14, color: ink2, lineHeight: 1.8, maxWidth: 520, marginBottom: 28 }}>
                    CentralTaste được phát triển và vận hành bởi <strong style={{ color: 'rgba(240,235,224,0.8)' }}>DAIF</strong> — thành viên của hệ sinh thái <strong style={{ color: 'rgba(201,168,76,0.85)' }}>D'Onyx Group</strong>. Dành cho nhà đầu tư, đối tác chiến lược và tổ chức muốn kết nối ở cấp độ tập đoàn.
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                    <a href="mailto:hq.donyxgroup@gmail.com?subject=Strategic%20Partnership%20Inquiry" style={{
                      display: 'inline-flex', alignItems: 'center', gap: 8,
                      padding: '11px 22px', borderRadius: 999,
                      border: '1px solid rgba(201,168,76,0.4)',
                      background: 'rgba(201,168,76,0.1)',
                      color: gold, fontSize: 12, fontWeight: 500,
                      letterSpacing: '0.1em', textDecoration: 'none',
                      transition: 'all 0.2s',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,168,76,0.18)'; e.currentTarget.style.borderColor = 'rgba(201,168,76,0.65)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(201,168,76,0.1)'; e.currentTarget.style.borderColor = 'rgba(201,168,76,0.4)'; }}
                    >
                      <Mail size={13} /> Đầu tư &amp; Đối tác
                    </a>
                    <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" style={{
                      display: 'inline-flex', alignItems: 'center', gap: 8,
                      padding: '11px 22px', borderRadius: 999,
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: 'rgba(240,235,224,0.55)', fontSize: 12,
                      letterSpacing: '0.1em', textDecoration: 'none',
                      transition: 'all 0.2s',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.35)'; e.currentTarget.style.color = ink; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(240,235,224,0.55)'; }}
                    >
                      <Building2 size={13} /> LinkedIn D'Onyx Group
                    </a>
                  </div>
                </div>

                {/* Right: contact rows */}
                <div style={{ borderLeft: '1px solid rgba(201,168,76,0.12)', paddingLeft: 32 }}>
                  {[
                    { label: 'HQ Email',          value: 'hq.donyxgroup@gmail.com', href: 'mailto:hq.donyxgroup@gmail.com' },
                    { label: 'Executive Office',   value: 'Qua bộ phận thư ký tập đoàn' },
                    { label: 'Operations Lead',    value: 'DAIF · CentralTaste Division' },
                  ].map(({ label, value, href }) => (
                    <div key={label} style={{ padding: '14px 0', borderBottom: '1px solid rgba(201,168,76,0.08)' }}>
                      <p style={{ fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.45)', margin: '0 0 4px' }}>{label}</p>
                      {href
                        ? <a href={href} style={{ fontSize: 13, color: 'rgba(240,235,224,0.65)', textDecoration: 'none', transition: 'color 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.color = gold}
                            onMouseLeave={e => e.currentTarget.style.color = 'rgba(240,235,224,0.65)'}
                          >{value}</a>
                        : <p style={{ fontSize: 13, color: 'rgba(240,235,224,0.65)', margin: 0 }}>{value}</p>
                      }
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}