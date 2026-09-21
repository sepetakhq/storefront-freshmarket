import { Link } from 'react-router-dom';

import { useConfig } from '@sepetakhq/storefront-kit/config/ConfigProvider';
import { useCategories } from '@sepetakhq/storefront-kit/hooks/queries';

import { BrandMark } from './BrandMark.jsx';
import SocialLinks from './SocialLinks.jsx';
import { contactRows } from '../lib/copy.js';

const colTitle = {
  fontWeight: 800,
  fontSize: 12,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: '#9AA89C',
  marginBottom: 12,
};
const link = { display: 'block', color: '#CFE3D5', fontSize: 13.5, padding: '4px 0' };

/**
 * Four columns from config alone: the brand blurb, the shop's links, the
 * first categories, contact rows and the payment names. A column with
 * nothing to list is not drawn, so a bare new shop gets a short footer
 * rather than four headings over nothing.
 */
export default function Footer() {
  const { brand, paymentMethods } = useConfig();
  const { data } = useCategories();
  const cats = (data ?? []).slice(0, 5);
  const shopLinks = brand.nav.filter((n) => n.path !== '/');
  const contact = contactRows(brand);
  const payments = (paymentMethods ?? []).filter((m) => m.enabled).map((m) => m.name).filter(Boolean);
  const links = brand.social_links ?? [];

  return (
    <footer style={{ background: '#0E3B22', color: '#E4E7DF', marginTop: 'auto' }}>
      <div className="fm-wrap" style={{ padding: '44px 20px 20px', display: 'grid', gap: 32, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div style={{ gridColumn: 'span 1' }}>
          <BrandMark height={32} maxWidth={180} wordmark={{ primary: '#FFFFFF', accent: '#B9E86C', size: 20 }} />
          {brand.tagline && (
            <p style={{ fontSize: 13.5, lineHeight: 1.6, color: '#CFE3D5', margin: '14px 0 16px', maxWidth: 320 }}>{brand.tagline}</p>
          )}
          <SocialLinks links={links} tone="dark" />
        </div>

        {shopLinks.length > 0 && (
          <div>
            <div style={colTitle}>Belanja</div>
            {shopLinks.map((n) => (
              <Link key={n.path} to={n.path} className="hv-blush" style={link}>
                {n.label}
              </Link>
            ))}
            <Link to="/katalog?sale=1" className="hv-blush" style={link}>
              Promo
            </Link>
          </div>
        )}

        {cats.length > 0 && (
          <div>
            <div style={colTitle}>Kategori</div>
            {cats.map((c) => (
              <Link key={c.key} to={`/katalog?cat=${encodeURIComponent(c.key)}`} className="hv-blush" style={link}>
                {c.label}
              </Link>
            ))}
          </div>
        )}

        {(contact.length > 0 || payments.length > 0) && (
          <div>
            {contact.length > 0 && (
              <>
                <div style={colTitle}>Kontak</div>
                {contact.map((r) => (
                  <div key={r.kind} style={{ ...link }}>
                    {r.kind === 'email' ? <a href={`mailto:${r.text}`} style={{ color: 'inherit' }}>{r.text}</a> : r.text}
                  </div>
                ))}
              </>
            )}
            {payments.length > 0 && (
              <>
                <div style={{ ...colTitle, marginTop: 18 }}>Pembayaran</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {payments.map((p) => (
                    <span key={p} style={{ fontSize: 11.5, fontWeight: 700, background: 'rgba(255,255,255,.08)', color: '#CFE3D5', padding: '4px 8px', borderRadius: 6 }}>
                      {p}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
      <div className="fm-wrap" style={{ padding: '14px 20px 22px', borderTop: '1px solid rgba(255,255,255,.08)', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8, fontSize: 12, color: '#9AA89C' }}>
        <span>{brand.copyright || ''}</span>
        <span>Toko online dibuat dengan Sepetak.</span>
      </div>
    </footer>
  );
}
