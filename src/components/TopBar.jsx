import { useConfig } from '@sepetakhq/storefront-kit/config/ConfigProvider';

import SocialLinks from './SocialLinks.jsx';
import { contactRows } from '../lib/copy.js';

/**
 * The dark strip above the header: address, the free-shipping line, phone,
 * hours, social icons. Every segment is a config field a merchant may leave
 * blank; when they all are, there is no strip at all rather than an empty
 * dark band.
 *
 * Exported pieces for the test; the component itself needs the config.
 */
export function topBarSegments({ brand, freeShipping, freeShippingMin, freeShippingMinLabel }) {
  const rows = contactRows(brand).filter((r) => r.kind !== 'email');
  const segs = rows.map((r) => r.text);
  if (freeShipping && freeShippingMin > 0 && freeShippingMinLabel) {
    // After the address, before the phone: the design's order.
    segs.splice(rows[0]?.kind === 'address' ? 1 : 0, 0, `Gratis ongkir min. belanja ${freeShippingMinLabel}`);
  }
  return segs;
}

export default function TopBar() {
  const cfg = useConfig();
  const segments = topBarSegments(cfg);
  const links = cfg.brand?.social_links ?? [];
  if (segments.length === 0 && links.length === 0) return null;

  return (
    <div className="fm-desk" style={{ background: 'var(--fm-ink)', color: 'var(--fm-mint)', fontSize: 12.5, padding: '9px 20px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px 26px' }}>
        {segments.map((s) => (
          <span key={s}>{s}</span>
        ))}
        <span style={{ marginLeft: 'auto' }}>
          <SocialLinks links={links} tone="dark" size={24} />
        </span>
      </div>
    </div>
  );
}
