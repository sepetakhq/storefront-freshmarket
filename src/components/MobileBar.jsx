import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { useCart } from '@sepetakhq/storefront-kit/cart/CartProvider';
import { useCartLines } from '@sepetakhq/storefront-kit/cart/useCartLines';
import { fmt } from '@sepetakhq/storefront-kit/shared/format';

import { cartBar } from '../lib/copy.js';

/**
 * The sticky strip at the bottom of a phone screen. Only on the routes that
 * have nothing of their own down there (cartBar decides); the product page,
 * checkout and the order page draw their own CTA.
 *
 * The body attribute is what makes room for it -- padding lives in CSS so
 * a screen never has to know whether the bar is up.
 */
export default function MobileBar() {
  const { pathname } = useLocation();
  const { count } = useCart();
  const { subtotal, isLoading } = useCartLines();
  const bar = cartBar(pathname, count, isLoading ? '…' : fmt(subtotal ?? 0));

  useEffect(() => {
    if (bar) document.body.setAttribute('data-mobile-bar', '1');
    else document.body.removeAttribute('data-mobile-bar');
    return () => document.body.removeAttribute('data-mobile-bar');
  }, [bar]);

  if (!bar) return null;
  return (
    <div className="fm-mobile-bar" role="region" aria-label="Keranjang">
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 11.5, color: 'var(--fm-muted)', fontWeight: 600 }}>{bar.label}</div>
        <div style={{ fontSize: 16, fontWeight: 800 }}>{bar.value}</div>
      </div>
      <Link to={bar.to} className="fm-btn fm-btn-primary" style={{ padding: '10px 16px' }}>
        {bar.cta}
      </Link>
    </div>
  );
}
