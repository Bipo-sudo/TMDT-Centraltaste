'use client';

import Link from 'next/link';
import { Search, ShoppingBag, Menu, UserCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

function GlitchLogo() {
  return (
    <span className="glitch-text text-lg font-semibold uppercase tracking-[0.35em] text-[var(--text)]" data-text="CentralTaste">
      CentralTaste
    </span>
  );
}

export default function Header() {
  const [cartCount] = useState(3);
  const [user] = useState(null);

  return (
    <motion.header
      initial={{ y: -18, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="sticky top-0 z-50 border-b border-white/10 bg-black/30 backdrop-blur-2xl"
    >
      <div className="content-shell flex items-center gap-4 py-4">
        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80 transition hover:border-[var(--accent)] hover:text-white md:hidden"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--panel-border)] bg-gradient-to-br from-white/10 to-white/5 text-[var(--accent)] shadow-[0_0_30px_var(--glow)]">
            <span className="text-sm font-bold tracking-[0.2em]">CT</span>
          </div>
          <GlitchLogo />
        </Link>

        <div className="hidden flex-1 md:flex">
          <label className="glass-panel flex w-full max-w-2xl items-center gap-3 rounded-full px-4 py-2 text-white/70">
            <Search size={18} className="shrink-0" />
            <input
              type="search"
              placeholder="Tìm mè xửng, trà cung đình, cà phê..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-white/35"
            />
          </label>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <Link
            href="/cart"
            className="glass-panel relative inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm text-white/85 transition hover:border-[var(--accent)]"
          >
            <ShoppingBag size={18} />
            <span className="hidden sm:inline">Giỏ hàng</span>
            {cartCount > 0 ? (
              <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--accent-2)] px-1 text-[11px] font-semibold text-white">
                {cartCount}
              </span>
            ) : null}
          </Link>

          <Link
            href={user ? '/profile' : '/login'}
            className="glass-panel inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm text-white/85 transition hover:border-[var(--accent)]"
          >
            <UserCircle2 size={18} />
            <span className="hidden sm:inline">{user ? 'Tài khoản' : 'Đăng nhập'}</span>
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
