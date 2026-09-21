import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import { useConfig } from '@sepetakhq/storefront-kit/config/ConfigProvider';
import { useCart } from '@sepetakhq/storefront-kit/cart/CartProvider';
import { useCartLines } from '@sepetakhq/storefront-kit/cart/useCartLines';
import { useCategories } from '@sepetakhq/storefront-kit/hooks/queries';
import { fmt } from '@sepetakhq/storefront-kit/shared/format';

import { BrandMark } from './BrandMark.jsx';
import CategoryMenu from './CategoryMenu.jsx';

const WORDMARK = { primary: '#12251B', accent: '#1B7A43', size: 22 };

/**
 * Two rows on a desktop: the mark, the search box and the cart; then the
 * category button, the merchant's nav and a fixed "Promo" that filters the
 * catalogue to what is on sale. One row on a phone, with a drawer.
 */
export default function Header({ menuOpen, onToggleMenu, onNavigate }) {
  const { brand } = useConfig();
  const { count } = useCart();
  const { subtotal, isLoading } = useCartLines();

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(255,255,255,0.94)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--fm-line)',
      }}
    >
      <div className="fm-wrap" style={{ display: 'flex', alignItems: 'center', gap: 16, height: 64 }}>
        <button
          type="button"
          className="fm-mob"
          aria-label={menuOpen ? 'Tutup menu' : 'Buka menu'}
          aria-expanded={menuOpen}
          onClick={onToggleMenu}
          style={{ padding: 8, marginLeft: -8 }}
        >
          <span aria-hidden="true" style={{ display: 'grid', gap: 4 }}>
            <i style={{ width: 18, height: 2, background: 'var(--fm-text)', borderRadius: 2, display: 'block' }} />
            <i style={{ width: 18, height: 2, background: 'var(--fm-text)', borderRadius: 2, display: 'block' }} />
            <i style={{ width: 18, height: 2, background: 'var(--fm-text)', borderRadius: 2, display: 'block' }} />
          </span>
        </button>

        <Link to="/" onClick={onNavigate} style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1, flexShrink: 0 }}>
          <BrandMark height={34} maxWidth={180} wordmark={WORDMARK} />
          {brand.tagline_short && (
            <span className="fm-desk" style={{ fontSize: 11, color: 'var(--fm-muted)', fontWeight: 600, marginTop: 2 }}>
              {brand.tagline_short}
            </span>
          )}
        </Link>

        <div className="fm-desk" style={{ flex: 1, maxWidth: 560, margin: '0 auto' }}>
          <SearchBox />
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to="/lacak" className="fm-desk hv-pink" style={{ fontSize: 13, fontWeight: 700, color: 'var(--fm-text)' }}>
            Lacak / Masuk
          </Link>
          <Link
            to="/keranjang"
            onClick={onNavigate}
            aria-label={`Keranjang, ${count} item`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              background: count > 0 ? 'var(--fm-green)' : 'var(--fm-tint)',
              color: count > 0 ? '#fff' : 'var(--fm-text)',
              borderRadius: 12,
              padding: '8px 12px',
              fontWeight: 800,
              fontSize: 13,
            }}
          >
            <CartGlyph />
            <span>{count}</span>
            {count > 0 && (
              <span className="fm-desk" style={{ fontWeight: 600, opacity: 0.9 }}>
                {isLoading ? '…' : fmt(subtotal ?? 0)}
              </span>
            )}
          </Link>
        </div>
      </div>

      <div className="fm-mob" style={{ padding: '0 20px 10px' }}>
        <SearchBox compact />
      </div>

      <div className="fm-desk" style={{ borderTop: '1px solid var(--fm-line)' }}>
        <div className="fm-wrap" style={{ display: 'flex', alignItems: 'center', gap: 22, height: 50 }}>
          <CategoryMenu />
          <nav style={{ display: 'flex', gap: 22 }} aria-label="Navigasi utama">
            {brand.nav.map((n) => (
              <NavLink
                key={n.path}
                to={n.path}
                end={n.path === '/'}
                className="hv-pink"
                style={({ isActive }) => ({
                  color: isActive ? 'var(--fm-green)' : 'var(--fm-text)',
                  fontWeight: isActive ? 800 : 600,
                  fontSize: 14,
                  padding: '4px 0',
                  borderBottom: `2px solid ${isActive ? 'var(--fm-green)' : 'transparent'}`,
                })}
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
          <PromoLink />
        </div>
      </div>
    </header>
  );
}

function PromoLink() {
  const [params] = useSearchParams();
  const { pathname } = useLocation();
  const active = pathname === '/katalog' && params.get('sale') === '1';
  return (
    <Link
      to="/katalog?sale=1"
      style={{
        marginLeft: 'auto',
        background: active ? 'var(--fm-sun)' : 'var(--fm-tint-2)',
        color: 'var(--fm-ink)',
        fontWeight: 800,
        fontSize: 12.5,
        padding: '7px 12px',
        borderRadius: 999,
        letterSpacing: '.3px',
      }}
    >
      ⚡ Promo
    </Link>
  );
}

/**
 * The search box submits to /katalog?q=. It reads the live param so the
 * box shows what the results are for, and is blank everywhere else.
 */
export function SearchBox({ compact = false }) {
  const [params] = useSearchParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const current = pathname === '/katalog' ? params.get('q') ?? '' : '';
  const [value, setValue] = useState(current);
  useEffect(() => setValue(current), [current]);

  const submit = (e) => {
    e.preventDefault();
    const q = value.trim();
    navigate(q ? `/katalog?q=${encodeURIComponent(q)}` : '/katalog');
  };

  return (
    <form role="search" onSubmit={submit} style={{ display: 'flex', width: '100%' }}>
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Cari produk…"
        aria-label="Cari produk"
        maxLength={80}
        style={{
          flex: 1,
          minWidth: 0,
          border: '1.5px solid var(--fm-line)',
          borderRight: 'none',
          borderRadius: '10px 0 0 10px',
          padding: compact ? '9px 12px' : '10px 14px',
          fontSize: 14,
          background: 'var(--fm-paper)',
        }}
      />
      <button
        type="submit"
        className="fm-btn fm-btn-primary"
        style={{ borderRadius: '0 10px 10px 0', padding: compact ? '0 14px' : '0 18px' }}
      >
        Cari
      </button>
    </form>
  );
}

/**
 * The drawer a phone opens from the hamburger: the merchant's nav, every
 * category, and the order lookup. Scroll is locked via a body attribute so
 * the page under it stays put.
 */
export function MobileDrawer({ open, onClose }) {
  const { brand, freeShipping, freeShippingMin, freeShippingMinLabel } = useConfig();
  const { data } = useCategories();
  const cats = data ?? [];

  useEffect(() => {
    if (open) document.body.setAttribute('data-drawer', '1');
    else document.body.removeAttribute('data-drawer');
    return () => document.body.removeAttribute('data-drawer');
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  const head = { fontSize: 11, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--fm-muted-2)', margin: '16px 8px 6px' };
  return (
    <>
      <div className="fm-drawer-backdrop" onClick={onClose} aria-hidden="true" />
      <aside className="fm-drawer" role="dialog" aria-modal="true" aria-label="Menu">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <BrandMark height={30} maxWidth={160} wordmark={WORDMARK} />
          <button type="button" onClick={onClose} aria-label="Tutup menu" style={{ fontSize: 22, padding: 4 }}>
            ×
          </button>
        </div>
        <div style={head}>Belanja</div>
        {brand.nav.map((n) => (
          <Link key={n.path} to={n.path} onClick={onClose}>
            {n.label}
          </Link>
        ))}
        <Link to="/katalog?sale=1" onClick={onClose}>
          ⚡ Promo
        </Link>
        {cats.length > 0 && (
          <>
            <div style={head}>Kategori</div>
            {cats.map((c) => (
              <Link key={c.key} to={`/katalog?cat=${encodeURIComponent(c.key)}`} onClick={onClose}>
                {c.label}
              </Link>
            ))}
          </>
        )}
        <div style={head}>Bantuan</div>
        <Link to="/lacak" onClick={onClose}>
          Lacak Pesanan
        </Link>
        {freeShipping && freeShippingMin > 0 && (
          <p style={{ fontSize: 12.5, color: 'var(--fm-muted)', margin: '16px 8px 0' }}>
            Gratis ongkir min. belanja {freeShippingMinLabel}.
          </p>
        )}
      </aside>
    </>
  );
}

function CartGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}
