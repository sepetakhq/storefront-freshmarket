// The decisions behind this template's chrome, kept pure so they can be
// tested without a DOM. The kit owns the platform rules (stock, sale
// windows, variants); this file owns what freshmarket does with them.

import { saleState, AVAILABLE } from '@sepetakhq/storefront-kit/lib/availability';
import { countsStock, isSoldOut, maxQty } from '@sepetakhq/storefront-kit/lib/preorder';
import { MAX_QTY } from '@sepetakhq/storefront-kit/lib/constants';

/**
 * Percent off, or 0 when there is nothing honest to say: no compare price,
 * a compare price at or under the sale price, or a product not on sale.
 * Never divides by zero.
 */
export function discountPct(p) {
  const price = Number(p?.price ?? 0);
  const compare = Number(p?.compare_at_price ?? 0);
  if (!p?.on_sale || !(compare > 0) || !(compare > price)) return 0;
  return Math.round((1 - price / compare) * 100);
}

/** Two letters for a tile with no picture: "Apel Fuji" → "AF", "Susu" → "SU". */
export function initials(label) {
  const words = String(label ?? '')
    .split(/[\s&/·-]+/)
    .filter(Boolean);
  if (words.length === 0) return '·';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

// The design's category tints, keyed by a stable hash of the key so the same
// category always gets the same wash without the merchant choosing one.
const TINTS = ['#E7F2E1', '#FBF1DC', '#EDF1FA', '#E8F4F3', '#FAEAE3', '#F6EEE2', '#F1EEE0', '#ECEFF4', '#F7EAF1'];

export function tintFor(key) {
  const s = String(key ?? '');
  let h = 0;
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return TINTS[h % TINTS.length];
}

/** The sale filter over the pages already loaded. */
export function applySaleFilter(items, on) {
  if (!on) return items ?? [];
  return (items ?? []).filter((p) => p?.on_sale);
}

/**
 * What the card's action area shows for this product:
 *   variants  — a link to the page, never a variant-less line
 *   disabled  — sold out, scheduled or ended; the label is the kit's buyLabel
 *   stepper   — already in the cart; −/+ against `max`
 *   add       — one tap adds one
 */
export function quickAddState(p, lineQty = 0) {
  if (!p) return { kind: 'disabled', max: 0 };
  if (p.has_variants) return { kind: 'variants', max: 0 };
  if (saleState(p) !== AVAILABLE || isSoldOut(p)) return { kind: 'disabled', max: 0 };
  const max = Math.min(maxQty(p), MAX_QTY);
  return lineQty > 0 ? { kind: 'stepper', max } : { kind: 'add', max };
}

/** "stok 24" only when a number means something. */
export function stockLine(p) {
  if (!p || !countsStock(p) || isSoldOut(p)) return '';
  const n = Number(p.stock ?? 0);
  return n > 0 ? `stok ${n}` : '';
}

/** The countdown is worth a tick only when the end is in sight. */
export const COUNTDOWN_WINDOW_MS = 72 * 60 * 60 * 1000;
export function showCountdown(endsAt, now = Date.now()) {
  if (!endsAt) return false;
  const t = new Date(endsAt).getTime();
  if (Number.isNaN(t)) return false;
  const left = t - now;
  return left > 0 && left <= COUNTDOWN_WINDOW_MS;
}

/** The API's two banner tones, in this template's colours. */
export function bannerBg(name) {
  return name === 'pink'
    ? { background: '#0E3B22', color: '#fff', accent: '#B9E86C', accentText: '#0E3B22' }
    : { background: '#FFF3C4', color: '#12251B', accent: '#B04A32', accentText: '#fff' };
}

/**
 * The mobile sticky bar for the routes that do not draw their own CTA. Null
 * means no bar. The product page, checkout and the order page own theirs.
 */
export function cartBar(pathname, count, subtotalLabel) {
  if (!count) return null;
  const path = String(pathname ?? '/');
  if (path === '/keranjang') {
    return { label: `${count} item · subtotal`, value: subtotalLabel, cta: 'Checkout', to: '/checkout' };
  }
  if (path === '/' || path === '/katalog' || path === '/tentang') {
    return { label: `${count} item di keranjang`, value: subtotalLabel, cta: 'Lihat keranjang', to: '/keranjang' };
  }
  return null;
}

/** The top bar / footer contact rows that have something to say. */
export function contactRows(brand) {
  const rows = [];
  const addr = [brand?.address_line1, brand?.address_line2].filter(Boolean).join(', ');
  if (addr) rows.push({ kind: 'address', text: addr });
  if (brand?.phone) rows.push({ kind: 'phone', text: brand.phone });
  if (brand?.opening_hours) rows.push({ kind: 'hours', text: brand.opening_hours });
  if (brand?.email) rows.push({ kind: 'email', text: brand.email });
  return rows;
}

/**
 * The template's own wording for every section_copy label it draws. The
 * merchant's text from the backoffice replaces each one; blank keeps these.
 */
export const DEFAULT_LABELS = {
  cats_heading: 'Belanja per Kategori',
  grid_see_all: 'Lihat semua',
  story_eyebrow: 'Cerita kami',
  story_cta: 'Tentang kami',
  product_details_heading: 'Detail bahan & ukuran',
  product_care_heading: 'Cara perawatan',
  product_shipping_heading: 'Pengiriman',
  hero_secondary_cta: 'Lihat promo',
  campaign_cta: 'Lihat semua deal',
  related_heading: 'Kamu mungkin suka',
  promo_title: 'Promo',
  about_address_heading: 'Kunjungi kami',
  footer_shop_heading: 'Belanja',
  footer_contact_heading: 'Kontak',
  footer_payment_heading: 'Pembayaran',
  footer_categories_heading: 'Kategori',
  hero_chip_shipping: 'Gratis ongkir',
  hero_chip_shipping_note: 'min. belanja {free_shipping_min}',
  countdown_label: 'Berakhir dalam',
};

/**
 * One label: the merchant's section_copy text, trimmed, else the template's.
 * `copy` is the config's substitution, for labels that may carry
 * {free_shipping_min}; a sentence it withholds falls back too, rather than
 * leaving the slot blank.
 */
export function sectionText(sections, key, copy) {
  const raw = String(sections?.[key] ?? '').trim();
  const text = raw && copy ? String(copy(raw) ?? '').trim() : raw;
  return text || DEFAULT_LABELS[key] || '';
}

/**
 * "Gratis ongkir min. belanja Rp 150.000" for the top bar and the drawer, in
 * the merchant's words, or '' while the offer is off or has no threshold.
 */
export function freeShippingLine({ brand, copy, freeShipping, freeShippingMin } = {}) {
  if (!freeShipping || !(freeShippingMin > 0) || !copy) return '';
  const note = copy(sectionText(brand?.sections, 'hero_chip_shipping_note'));
  return note ? `${sectionText(brand?.sections, 'hero_chip_shipping')} ${note}` : '';
}

/** The catalogue heading for the active filters. */
export function catalogTitle({ cat, sale, q } = {}, categories = [], promoTitle = DEFAULT_LABELS.promo_title) {
  if (q) return `Hasil pencarian “${q}”`;
  if (sale) return promoTitle;
  if (cat && cat !== 'Semua') {
    const found = categories.find((c) => c.key === cat);
    return found?.label ?? cat;
  }
  return 'Semua Produk';
}

/** Active filters as removable chips; each carries the params that clear it. */
export function filterChips({ cat, sale, q } = {}, categories = [], promoTitle = DEFAULT_LABELS.promo_title) {
  const chips = [];
  if (cat && cat !== 'Semua') {
    const found = categories.find((c) => c.key === cat);
    chips.push({ key: 'cat', label: found?.label ?? cat, clear: { cat: null } });
  }
  if (q) chips.push({ key: 'q', label: `“${q}”`, clear: { q: null } });
  if (sale) chips.push({ key: 'sale', label: promoTitle, clear: { sale: null } });
  return chips;
}

export const SORTS = [
  { value: 'featured', label: 'Paling populer' },
  { value: 'priceAsc', label: 'Harga terendah' },
  { value: 'priceDesc', label: 'Harga tertinggi' },
  { value: 'nameAsc', label: 'Nama A–Z' },
];

export function sortOrDefault(value) {
  return SORTS.some((s) => s.value === value) ? value : 'featured';
}
