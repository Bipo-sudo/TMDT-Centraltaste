'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Volume2, VolumeX } from 'lucide-react';
import api from '../../lib/api';
import useStore from '../../store/useStore';

// ─── Variants ─────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1], delay: i * 0.1 },
  }),
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };

// ─── Static data ──────────────────────────────────────────────
const pillars = [
  { num: '01', title: 'Sạch & Chuẩn vị',  body: 'Nguyên liệu chọn lọc kỹ lưỡng, rõ nguồn gốc, không phụ gia — đúng hương vị truyền thống từng vùng đất miền Trung.' },
  { num: '02', title: 'Rõ Nguồn Gốc',     body: 'Mỗi sản phẩm đều có địa chỉ sản xuất cụ thể, từ các làng nghề và vùng đặc sản đã được kiểm chứng qua nhiều thế hệ.' },
  { num: '03', title: 'Giao Toàn Quốc',   body: 'Đóng gói cẩn thận, bảo quản đúng cách, giao nhanh. Hoàn tiền 100% nếu sản phẩm không đúng như cam kết.' },
];

// Placeholder products shown when backend has no data yet
const PLACEHOLDER_PRODUCTS = [
  { id: 'p1', name_vi: 'Mè xửng Huế truyền thống',  price_vnd: 129000, region: 'Cố đô Huế',     category: 'Huế' },
  { id: 'p2', name_vi: 'Trà cung đình thượng hạng',  price_vnd: 89000,  region: 'Hội An',        category: 'Quảng Nam' },
  { id: 'p3', name_vi: 'Mắm nêm Đà Nẵng đặc biệt',  price_vnd: 65000,  region: 'Đà Nẵng',       category: 'Đà Nẵng' },
  { id: 'p4', name_vi: 'Cà phê Trà My rang xay',     price_vnd: 159000, region: 'Quảng Nam',     category: 'Quảng Nam' },
  { id: 'p5', name_vi: 'Bánh in làng Chuồn',         price_vnd: 75000,  region: 'Thừa Thiên Huế', category: 'Huế' },
];

// ─── Gold horizontal rule ──────────────────────────────────────
function GoldRule() {
  return <div className="ct-gold-rule" aria-hidden="true" />;
}

// ─── Section label row ─────────────────────────────────────────
function SectionLabel({ children, action }) {
  return (
    <div className="ct-sec-label">
      <span className="ct-sec-dot" aria-hidden="true" />
      <span className="ct-sec-text">{children}</span>
      <span className="ct-sec-line" aria-hidden="true" />
      {action}
    </div>
  );
}

// ─── Product card (dark) ──────────────────────────────────────
function ProductCard({ product, index }) {
  const addToCart = useStore((s) => s.addToCart);
  const [added, setAdded] = useState(false);

  const handleAdd = (e) => {
    e.preventDefault();
    if (addToCart) addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const isPlaceholder = String(product.id).startsWith('p');

  return (
    <motion.article variants={fadeUp} custom={index} className="ct-prod-card group">
      {/* Link wraps image + name */}
      <Link href={isPlaceholder ? '/products' : `/products/${product.id}`} className="block">
        <div className="ct-prod-img">
          {product.category && <span className="ct-prod-tag">{product.category}</span>}
          {product.main_image_url ? (
            <img
              src={product.main_image_url}
              alt={product.name_vi}
              loading="lazy"
              className="ct-prod-photo"
            />
          ) : (
            <div className="ct-prod-empty">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true">
                <rect x="2" y="7" width="20" height="14" rx="2" />
                <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
              </svg>
            </div>
          )}
        </div>
        <div className="ct-prod-info">
          <p className="ct-prod-origin">{product.region || 'Miền Trung'}</p>
          <h3 className="ct-prod-name">{product.name_vi}</h3>
          <p className="ct-prod-price">
            {Number(product.price_vnd || 0).toLocaleString('vi-VN')} ₫
          </p>
        </div>
      </Link>
      {/* Add to cart */}
      <div className="ct-prod-action">
        <button
          type="button"
          onClick={handleAdd}
          className="ct-add-btn"
          data-added={added}
          aria-label={`Thêm ${product.name_vi} vào giỏ hàng`}
        >
          {added ? '✓ Đã thêm' : '+ Thêm vào giỏ'}
        </button>
      </div>
    </motion.article>
  );
}

// ─── Card skeleton ────────────────────────────────────────────
function CardSkeleton() {
  return (
    <div className="ct-skeleton" aria-hidden="true">
      <div className="ct-skeleton-img" />
      <div className="ct-skeleton-line" style={{ width: 80 }} />
      <div className="ct-skeleton-line" style={{ width: 150 }} />
      <div className="ct-skeleton-line" style={{ width: 60 }} />
    </div>
  );
}

// ─── Social icon shortcuts ────────────────────────────────────
function FacebookIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  );
}
function TikTokIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/>
    </svg>
  );
}
function InstagramIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
  );
}
function YoutubeIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.97C18.88 4 12 4 12 4s-6.88 0-8.59.45A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58a2.78 2.78 0 0 0 1.95 1.97C5.12 20 12 20 12 20s6.88 0 8.59-.45a2.78 2.78 0 0 0 1.95-1.97A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
      <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/>
    </svg>
  );
}

const socials = [
  { label: 'Instagram', href: '#', Icon: InstagramIcon },
  { label: 'Facebook',  href: '#', Icon: FacebookIcon },
  { label: 'YouTube',   href: '#', Icon: YoutubeIcon },
  { label: 'TikTok',    href: '#', Icon: TikTokIcon },
];

// ─── PAGE ─────────────────────────────────────────────────────
export default function HomePage() {
  const user   = useStore((s) => s.user);
  const isAuth = useStore((s) => s.isAuthenticated);
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [isStoryAudioEnabled, setIsStoryAudioEnabled] = useState(false);

  // Parallax scroll for hero
  const heroRef = useRef(null);
  const storyVideoRef = useRef(null);
  const storyFrameRef = useRef(null);
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 380], [1, 0]);
  const heroY       = useTransform(scrollY, [0, 380], [0, 72]);

  useEffect(() => {
    (async () => {
      try {
        const res  = await api.get('/products/trending');
        const data = res.data?.data || res.data?.data?.products || [];
        setProducts(Array.isArray(data) ? data : []);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    try {
      const savedPreference = window.localStorage.getItem('centraltaste-story-audio-enabled');
      if (savedPreference !== null) {
        setIsStoryAudioEnabled(savedPreference === 'true');
      }
    } catch {
      // Ignore storage issues and keep the default muted state.
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem('centraltaste-story-audio-enabled', String(isStoryAudioEnabled));
    } catch {
      // Ignore storage issues.
    }
  }, [isStoryAudioEnabled]);

  const displayProducts = products.length > 0 ? products : PLACEHOLDER_PRODUCTS;

  useEffect(() => {
    const video = storyVideoRef.current;
    const frame = storyFrameRef.current;

    if (!video || !frame) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.muted = !isStoryAudioEnabled;
          const playPromise = video.play();
          if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(() => {
              video.muted = true;
              video.play().catch(() => {});
              setIsStoryAudioEnabled(false);
            });
          }
        } else {
          video.pause();
        }
      },
      {
        threshold: 0.55,
        rootMargin: '80px 0px',
      }
    );

    observer.observe(frame);

    return () => {
      observer.disconnect();
      video.pause();
    };
  }, [isStoryAudioEnabled]);

  useEffect(() => {
    const video = storyVideoRef.current;
    if (!video) {
      return;
    }

    video.muted = !isStoryAudioEnabled;
    if (!isStoryAudioEnabled) {
      return;
    }

    const activeSection = storyFrameRef.current;
    const rect = activeSection?.getBoundingClientRect();
    const isInView = rect && rect.top < window.innerHeight * 0.8 && rect.bottom > window.innerHeight * 0.2;

    if (isInView) {
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          video.muted = true;
          setIsStoryAudioEnabled(false);
        });
      }
    }
  }, [isStoryAudioEnabled]);

  return (
    <div className="ct-page">

      {/* ══ 1. HERO ══════════════════════════════════════════════ */}
      <section className="ct-hero" ref={heroRef} aria-label="Hero section">
        <div className="ct-hero-bg"       aria-hidden="true" />
        <div className="ct-hero-grid"     aria-hidden="true" />
        <div className="ct-hero-vignette" aria-hidden="true" />
        <div className="ct-hero-glow"     aria-hidden="true" />

        <motion.div style={{ opacity: heroOpacity, y: heroY }} className="ct-hero-content">
          <motion.div variants={stagger} initial="hidden" animate="show" className="ct-hero-inner">

            {/* Badge */}
            <motion.div variants={fadeUp} custom={0}>
              <span className="ct-hero-badge">
                <span className="ct-badge-pulse" aria-hidden="true" />
                Tinh hoa · Đặc sản Miền Trung · Chính gốc
              </span>
            </motion.div>

            {/* Logo circle */}
            <motion.div variants={fadeUp} custom={1} className="ct-hero-emblem" aria-hidden="true">
              <div className="ct-emblem-ring ct-emblem-ring--outer" />
              <div className="ct-emblem-ring ct-emblem-ring--inner" />
              <div className="ct-emblem-core">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1a1208" strokeWidth="1.5">
                  <path d="M12 2a9 9 0 0 1 6.36 15.36" />
                  <path d="M12 2a9 9 0 0 0-6.36 15.36" />
                  <circle cx="12" cy="12" r="3" fill="#1a1208" stroke="none" />
                </svg>
              </div>
            </motion.div>

            {/* Main title */}
            <motion.div variants={fadeUp} custom={2}>
              <h1 className="ct-hero-title">
                CENTRAL<em>TASTE</em>
              </h1>
              <p className="ct-hero-sub">DAIF · Premium Vietnamese Specialties</p>
            </motion.div>

            {/* Tagline */}
            <motion.p variants={fadeUp} custom={3} className="ct-hero-tagline">
              Từ làng nghề trăm năm đến bàn ăn của bạn — không qua trung gian.
            </motion.p>

            {/* CTAs */}
            <motion.div variants={fadeUp} custom={4} className="ct-hero-cta">
              <Link href="/products" className="ct-btn-gold">
                Khám phá sản phẩm <ArrowRight size={14} aria-hidden="true" />
              </Link>
              <Link href="/stories" className="ct-btn-ghost">
                Câu chuyện thương hiệu
              </Link>
              {isAuth && user?.role === 'admin' && (
                <Link href="/admin/dashboard" className="ct-btn-ghost">Admin</Link>
              )}
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Scroll hint */}
        <div className="ct-scroll-hint" aria-hidden="true">
          <div className="ct-scroll-line" />
          <span>SCROLL</span>
        </div>
      </section>

      {/* ══ 2. PRODUCT STRIP ═════════════════════════════════════ */}
      <section className="ct-section" aria-label="Sản phẩm nổi bật">
        <GoldRule />
        <SectionLabel action={
          <Link href="/products" className="ct-viewall-link">
            Xem tất cả <ArrowRight size={12} aria-hidden="true" />
          </Link>
        }>
          Đặc sản nổi bật
        </SectionLabel>

        <div className="ct-strip-outer">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            className="ct-strip"
          >
            {loading
              ? [1,2,3,4].map((n) => <CardSkeleton key={n} />)
              : displayProducts.map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} />
                ))
            }
            {/* Ghost "view all" card */}
            <Link href="/products" className="ct-more-card" aria-label="Xem toàn bộ sản phẩm">
              <div className="ct-more-inner">
                <ArrowRight size={20} aria-hidden="true" />
                <span>Xem toàn bộ</span>
              </div>
            </Link>
          </motion.div>
        </div>
        <GoldRule />
      </section>

      {/* ══ 3. STORY + VIDEO ═════════════════════════════════════ */}
      <section id="story" className="ct-story" aria-label="Câu chuyện thương hiệu">
        <motion.div
          initial={{ opacity: 0, x: -32 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="ct-story-left"
        >
          <p className="ct-story-eyebrow">Câu chuyện thương hiệu</p>
          <h2 className="ct-story-title">
            Từ <em>làng nghề</em><br />đến tay bạn.
          </h2>
          <p className="ct-story-body">
            CentralTaste ra đời từ niềm tin rằng những hương vị truyền thống xứng đáng được
            trân trọng và lan toả rộng hơn. Chúng tôi kết nối trực tiếp với các nghệ nhân
            và cơ sở sản xuất tại miền Trung — nơi mỗi công thức là một di sản được trao truyền
            qua nhiều thế hệ.
          </p>
          <Link href="/products" className="ct-story-link">
            Khám phá câu chuyện <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </motion.div>

        <motion.div
          ref={storyFrameRef}
          initial={{ opacity: 0, x: 32 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="ct-video-frame"
        >
          <video
            ref={storyVideoRef}
            className="ct-video-media"
            src="/assets/videos/background.mp4"
            muted={!isStoryAudioEnabled}
            loop
            playsInline
            preload="metadata"
            aria-label="Video câu chuyện thương hiệu"
          />
          <div className="ct-video-overlay" aria-hidden="true" />
          <div className="ct-video-inner">
          </div>
          <button
            type="button"
            className="ct-video-sound-toggle"
            onClick={() => setIsStoryAudioEnabled((current) => !current)}
            aria-label={isStoryAudioEnabled ? 'Tắt âm thanh video' : 'Bật âm thanh video'}
            aria-pressed={isStoryAudioEnabled}
          >
            {isStoryAudioEnabled ? <Volume2 size={16} aria-hidden="true" /> : <VolumeX size={16} aria-hidden="true" />}
            <span>{isStoryAudioEnabled ? 'Âm thanh' : 'Tắt tiếng'}</span>
          </button>
        </motion.div>
      </section>

      {/* ══ 4. PILLARS ═══════════════════════════════════════════ */}
      <section className="ct-pillars" aria-label="Cam kết của chúng tôi">
        <GoldRule />
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="ct-pillars-grid"
        >
          {pillars.map((p, i) => (
            <motion.div key={p.num} variants={fadeUp} custom={i} className="ct-pillar">
              <span className="ct-pillar-num" aria-hidden="true">{p.num}</span>
              <h3 className="ct-pillar-title">{p.title}</h3>
              <p className="ct-pillar-body">{p.body}</p>
            </motion.div>
          ))}
        </motion.div>
        <GoldRule />
      </section>

      {/* ══ 5. SOCIAL ════════════════════════════════════════════ */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.65 }}
        className="ct-social"
        aria-label="Mạng xã hội"
      >
        <p className="ct-social-label">Theo dõi chúng tôi</p>
        <nav className="ct-social-links" aria-label="Social media links">
          {socials.map(({ label, href, Icon }) => (
            <Link key={label} href={href} className="ct-social-link">
              <Icon />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
      </motion.section>

    </div>
  );
}
