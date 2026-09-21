import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { useCategories } from '@sepetakhq/storefront-kit/hooks/queries';

import { Img, SIZES } from '../ui/Img.jsx';
import { Tile } from './Tile.jsx';

/**
 * "Semua Kategori": the dropdown under the header's second row. Closes on
 * outside pointerdown, Escape and navigation, and gives focus back to the
 * button so a keyboard user is not dropped on the page.
 *
 * Hidden entirely when the shop has no categories -- a button opening an
 * empty list is a bug the merchant would see first.
 */
export default function CategoryMenu() {
  const { data } = useCategories();
  const cats = data ?? [];
  const [open, setOpen] = useState(false);
  const root = useRef(null);
  const button = useRef(null);
  const { pathname, search } = useLocation();

  useEffect(() => setOpen(false), [pathname, search]);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (root.current && !root.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        button.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onDown, true);
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('pointerdown', onDown, true);
      document.removeEventListener('keydown', onKey, true);
    };
  }, [open]);

  if (cats.length === 0) return null;

  return (
    <div ref={root} style={{ position: 'relative' }}>
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((o) => !o)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          background: 'var(--fm-green)',
          color: '#fff',
          fontWeight: 800,
          fontSize: 13,
          letterSpacing: '.4px',
          padding: '10px 16px',
          borderRadius: 10,
        }}
      >
        <span aria-hidden="true" style={{ display: 'grid', gap: 3 }}>
          <i style={{ width: 14, height: 2, background: '#fff', borderRadius: 2, display: 'block' }} />
          <i style={{ width: 14, height: 2, background: '#fff', borderRadius: 2, display: 'block' }} />
          <i style={{ width: 14, height: 2, background: '#fff', borderRadius: 2, display: 'block' }} />
        </span>
        Semua Kategori
        <span aria-hidden="true" style={{ fontSize: 10 }}>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <nav className="fm-menu" aria-label="Kategori">
          {cats.map((c) => (
            <Link key={c.key} to={`/katalog?cat=${encodeURIComponent(c.key)}`}>
              <span style={{ width: 36, height: 36, borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
                <Img
                  src={c.image}
                  srcSet={c.image_srcset}
                  sizes={SIZES.thumb}
                  alt=""
                  ratio="1/1"
                  fallback={<Tile label={c.label} tintKey={c.key} size={12} />}
                />
              </span>
              <span style={{ minWidth: 0 }}>
                <span style={{ display: 'block', fontWeight: 700, fontSize: 13.5 }}>{c.label}</span>
                {c.subtitle && (
                  <span style={{ display: 'block', fontSize: 11.5, color: 'var(--fm-muted)' }}>{c.subtitle}</span>
                )}
              </span>
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
