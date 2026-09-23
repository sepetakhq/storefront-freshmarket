import { Link } from 'react-router-dom';

import { useCart } from '@sepetakhq/storefront-kit/cart/CartProvider';
import { buyLabel } from '@sepetakhq/storefront-kit/lib/availability';
import { shortNote } from '@sepetakhq/storefront-kit/lib/preorder';
import { isPriceRange, lineKey } from '@sepetakhq/storefront-kit/lib/variants';
import { useToast } from '@sepetakhq/storefront-kit/ui/ToastProvider';
import { fmt } from '@sepetakhq/storefront-kit/shared/format';

import { Img, SIZES } from '../ui/Img.jsx';
import { Tile } from './Tile.jsx';
import { discountPct, quickAddState, stockLine } from '../lib/copy.js';

/**
 * A grocery card: picture (or initials), the "% OFF" chip, name, category,
 * price with the crossed-out compare price, then the quick-add. The whole
 * top half is the link; the action area sits outside it so a tap on "+"
 * never navigates.
 *
 * `variant` keeps the four call sites the previous template had:
 *   grid / campaign — full card;  carousel / related — narrower, no category.
 */
export default function ProductCard({ p, variant = 'grid' }) {
  const compact = variant === 'carousel' || variant === 'related';
  const off = discountPct(p);
  const stock = stockLine(p);
  const range = isPriceRange(p);

  return (
    <article className="fm-card" data-testid="product-card">
      {off > 0 && <span className="fm-off">{off}% OFF</span>}
      <Link to={`/produk/${p.slug}`} className="fm-card-link">
        <Img
          src={p.image}
          srcSet={p.image_srcset}
          sizes={SIZES.card}
          alt={p.name}
          ratio="1/1"
          fallback={<Tile label={p.name} tintKey={p.category_key} size={compact ? 20 : 26} />}
        />
        <div style={{ padding: compact ? '10px 12px 0' : '12px 14px 0' }}>
          <h3 style={{ margin: 0, fontSize: compact ? 13.5 : 14.5, fontWeight: 700, lineHeight: 1.3 }}>{p.name}</h3>
          {!compact && (
            <div style={{ marginTop: 3, fontSize: 12, color: 'var(--fm-muted)', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {p.category_label && <span>{p.category_label}</span>}
              {stock && (
                <span>
                  {p.category_label ? '· ' : ''}
                  {stock}
                </span>
              )}
            </div>
          )}
          <div style={{ marginTop: 8, display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: compact ? 14.5 : 16, fontWeight: 800, color: 'var(--fm-ink)' }}>
              {range ? 'mulai ' : ''}
              {fmt(p.price)}
            </span>
            {off > 0 && (
              <s style={{ fontSize: 12, color: 'var(--fm-muted-2)' }}>{fmt(p.compare_at_price)}</s>
            )}
          </div>
          {p.preorder && (
            <div style={{ marginTop: 6 }}>
              <span className="fm-chip">{shortNote(p) || 'Pre-order'}</span>
            </div>
          )}
        </div>
      </Link>
      <div style={{ padding: compact ? '10px 12px 12px' : '12px 14px 14px', marginTop: 'auto' }}>
        <QuickAdd p={p} compact={compact} />
      </div>
    </article>
  );
}

/**
 * The action area of a card, by quickAddState:
 *   add      → one tap adds one and confirms with a toast
 *   stepper  → −/+ around the qty already in the cart, + capped at `max`
 *   variants → a link to the page; a card cannot pick a size
 *   disabled → the kit's reason (sold out / opens on / ended)
 */
export function QuickAdd({ p, compact = false }) {
  const cart = useCart();
  // The kit's context value is the function itself, not an object holding it.
  const showToast = useToast();
  const key = lineKey({ productId: p.id, variantId: null });
  const line = cart.items.find((it) => lineKey(it) === key);
  const qty = line?.qty ?? 0;
  const state = quickAddState(p, qty);
  const btn = { width: '100%', padding: compact ? '9px 10px' : '11px 12px', fontSize: compact ? 12 : 12.5 };

  if (state.kind === 'variants') {
    return (
      <Link to={`/produk/${p.slug}`} className="fm-btn fm-btn-ghost" style={btn}>
        Pilih varian
      </Link>
    );
  }
  if (state.kind === 'disabled') {
    return (
      <button type="button" className="fm-btn fm-btn-primary" style={btn} disabled>
        {buyLabel(p) ?? 'Stok habis'}
      </button>
    );
  }
  if (state.kind === 'add') {
    return (
      <button
        type="button"
        className="fm-btn fm-btn-primary"
        style={btn}
        onClick={() => {
          cart.add(p, 1, null);
          showToast(`${p.name} masuk keranjang`);
        }}
      >
        {compact ? 'Tambah' : 'Tambah ke keranjang'}
      </button>
    );
  }
  return (
    <div className="fm-stepper" style={{ width: '100%', justifyContent: 'space-between' }} role="group" aria-label={`Jumlah ${p.name}`}>
      <button
        type="button"
        aria-label="Kurangi"
        onClick={() => (qty <= 1 ? cart.remove(key) : cart.setQty(key, qty - 1))}
      >
        −
      </button>
      <output aria-live="polite">{qty}</output>
      <button
        type="button"
        aria-label="Tambah"
        disabled={qty >= state.max}
        onClick={() => cart.setQty(key, qty + 1)}
      >
        +
      </button>
    </div>
  );
}
