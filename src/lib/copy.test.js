import { describe, expect, it } from 'vitest';

import {
  applySaleFilter,
  bannerBg,
  cartBar,
  catalogTitle,
  contactRows,
  discountPct,
  filterChips,
  freeShippingLine,
  initials,
  quickAddState,
  sectionText,
  showCountdown,
  sortOrDefault,
  stockLine,
  tintFor,
} from './copy.js';

describe('discountPct', () => {
  it('rounds the honest cases', () => {
    expect(discountPct({ on_sale: true, price: 38500, compare_at_price: 45000 })).toBe(14);
    expect(discountPct({ on_sale: true, price: 9500, compare_at_price: 12000 })).toBe(21);
  });
  it('says nothing when there is no compare price, or it is not higher, or not on sale', () => {
    expect(discountPct({ on_sale: true, price: 100, compare_at_price: 0 })).toBe(0);
    expect(discountPct({ on_sale: true, price: 100 })).toBe(0);
    expect(discountPct({ on_sale: true, price: 100, compare_at_price: 100 })).toBe(0);
    expect(discountPct({ on_sale: true, price: 100, compare_at_price: 90 })).toBe(0);
    expect(discountPct({ on_sale: false, price: 100, compare_at_price: 200 })).toBe(0);
    expect(discountPct(null)).toBe(0);
  });
});

describe('initials / tintFor', () => {
  it('takes two letters from two words, two from one', () => {
    expect(initials('Apel Fuji Merah')).toBe('AF');
    expect(initials('Sayur & Buah')).toBe('SB');
    expect(initials('Susu')).toBe('SU');
    expect(initials('')).toBe('·');
  });
  it('gives a category the same tint every time', () => {
    expect(tintFor('sayur')).toBe(tintFor('sayur'));
    expect(tintFor('sayur')).toMatch(/^#[0-9A-F]{6}$/);
  });
});

describe('quickAddState', () => {
  const base = { id: 'p', stock: 5, availability: 'available' };
  it('sends a variant product to its page', () => {
    expect(quickAddState({ ...base, has_variants: true }).kind).toBe('variants');
  });
  it('disables sold out, scheduled and ended', () => {
    expect(quickAddState({ ...base, sold_out: true }).kind).toBe('disabled');
    expect(quickAddState({ ...base, availability: 'scheduled' }).kind).toBe('disabled');
    expect(quickAddState({ ...base, availability: 'ended' }).kind).toBe('disabled');
  });
  it('adds one, then steps, capped by counted stock', () => {
    expect(quickAddState(base, 0)).toEqual({ kind: 'add', max: 5 });
    expect(quickAddState(base, 2)).toEqual({ kind: 'stepper', max: 5 });
  });
  it('caps an uncounted or pre-order product at MAX_QTY only', () => {
    expect(quickAddState({ ...base, stock: 0, unlimited_stock: true }, 1).max).toBe(99);
    expect(quickAddState({ ...base, stock: 0, preorder: true }, 0).max).toBe(99);
  });
  it('trusts the server over a missing availability field', () => {
    expect(quickAddState({ id: 'p', stock: 3 }, 0).kind).toBe('add');
  });
});

describe('stockLine', () => {
  it('shows a count only when it means something', () => {
    expect(stockLine({ stock: 24 })).toBe('stok 24');
    expect(stockLine({ stock: 0 })).toBe('');
    expect(stockLine({ stock: 24, preorder: true })).toBe('');
    expect(stockLine({ stock: 24, unlimited_stock: true })).toBe('');
    expect(stockLine({ stock: 24, sold_out: true })).toBe('');
  });
});

describe('showCountdown', () => {
  const now = Date.parse('2026-09-21T10:00:00Z');
  it('ticks only inside the 72-hour window', () => {
    expect(showCountdown('2026-09-21T18:00:00Z', now)).toBe(true);
    expect(showCountdown('2026-09-24T09:59:00Z', now)).toBe(true);
    expect(showCountdown('2026-09-24T10:01:00Z', now)).toBe(false);
    expect(showCountdown('2026-09-21T09:59:00Z', now)).toBe(false);
    expect(showCountdown(null, now)).toBe(false);
    expect(showCountdown('garbage', now)).toBe(false);
  });
});

describe('cartBar', () => {
  it('is absent with an empty cart', () => {
    expect(cartBar('/', 0, 'Rp 0')).toBeNull();
  });
  it('sends shoppers to the cart and the cart to checkout', () => {
    expect(cartBar('/', 2, 'Rp 50.000')).toMatchObject({ to: '/keranjang', cta: 'Lihat keranjang' });
    expect(cartBar('/katalog', 2, 'Rp 50.000')).toMatchObject({ to: '/keranjang' });
    expect(cartBar('/tentang', 1, 'Rp 5.000')).toMatchObject({ to: '/keranjang' });
    expect(cartBar('/keranjang', 2, 'Rp 50.000')).toMatchObject({ to: '/checkout', cta: 'Checkout' });
  });
  it('stays out of the screens that draw their own', () => {
    for (const path of ['/produk/apel', '/checkout', '/pesanan/abc', '/lacak', '/nope']) {
      expect(cartBar(path, 3, 'Rp 1')).toBeNull();
    }
  });
});

describe('contactRows', () => {
  it('renders nothing for an empty brand and joins the address', () => {
    expect(contactRows({})).toEqual([]);
    expect(contactRows({ address_line1: 'Jl. Melati 24', address_line2: 'Bandung', phone: '0812' })).toEqual([
      { kind: 'address', text: 'Jl. Melati 24, Bandung' },
      { kind: 'phone', text: '0812' },
    ]);
  });
});

describe('catalogue helpers', () => {
  const cats = [{ key: 'sayur', label: 'Sayur & Buah' }];
  it('titles by priority: search, then sale, then category', () => {
    expect(catalogTitle({}, cats)).toBe('Semua Produk');
    expect(catalogTitle({ cat: 'sayur' }, cats)).toBe('Sayur & Buah');
    expect(catalogTitle({ cat: 'nope' }, cats)).toBe('nope');
    expect(catalogTitle({ cat: 'sayur', sale: true }, cats)).toBe('Promo & Diskon');
    expect(catalogTitle({ sale: true, q: 'apel' }, cats)).toBe('Hasil pencarian “apel”');
  });
  it('chips carry the param that clears them', () => {
    expect(filterChips({ cat: 'sayur', q: 'apel', sale: true }, cats).map((c) => c.key)).toEqual(['cat', 'q', 'sale']);
    expect(filterChips({ cat: 'Semua' }, cats)).toEqual([]);
  });
  it('filters loaded items by on_sale and falls back to the default sort', () => {
    const items = [{ on_sale: true }, { on_sale: false }];
    expect(applySaleFilter(items, true)).toHaveLength(1);
    expect(applySaleFilter(items, false)).toHaveLength(2);
    expect(sortOrDefault('priceAsc')).toBe('priceAsc');
    expect(sortOrDefault('disc')).toBe('featured');
  });
  it('maps the API banner tones to two looks', () => {
    expect(bannerBg('pink').background).not.toBe(bannerBg('butter').background);
    expect(bannerBg(undefined)).toEqual(bannerBg('butter'));
  });
});

describe('sectionText', () => {
  it('reads the merchant label, trimmed, and falls back when blank', () => {
    expect(sectionText({ promo_title: '  Diskon  ' }, 'promo_title')).toBe('Diskon');
    expect(sectionText({ promo_title: '' }, 'promo_title')).toBe('Promo & Diskon');
    expect(sectionText({ promo_title: '   ' }, 'promo_title')).toBe('Promo & Diskon');
    expect(sectionText(undefined, 'countdown_label')).toBe('Berakhir dalam');
    expect(sectionText({}, 'no_such_key')).toBe('');
  });

  it('falls back when the substitution withholds the text', () => {
    expect(sectionText({ hero_chip_shipping_note: 'di atas {free_shipping_min}' }, 'hero_chip_shipping_note', () => '')).toBe(
      'min. belanja {free_shipping_min}',
    );
  });

  it('puts the promo label in the catalogue title and chip', () => {
    expect(catalogTitle({ sale: true }, [], 'Obral')).toBe('Obral');
    expect(filterChips({ sale: true }, [], 'Obral')[0].label).toBe('Obral');
    expect(filterChips({ sale: true }, [])[0].label).toBe('Promo & Diskon');
  });
});

describe('freeShippingLine', () => {
  const copy = (s) => s.replaceAll('{free_shipping_min}', 'Rp 150.000');
  const on = { brand: { sections: {} }, copy, freeShipping: true, freeShippingMin: 150000 };

  it('reads the template wording by default', () => {
    expect(freeShippingLine(on)).toBe('Gratis ongkir min. belanja Rp 150.000');
  });

  it('reads the merchant labels, whitespace-only as blank', () => {
    const sections = { hero_chip_shipping: ' Bebas ongkir ', hero_chip_shipping_note: 'di atas {free_shipping_min}' };
    expect(freeShippingLine({ ...on, brand: { sections } })).toBe('Bebas ongkir di atas Rp 150.000');
    expect(freeShippingLine({ ...on, brand: { sections: { hero_chip_shipping: '  ' } } })).toBe('Gratis ongkir min. belanja Rp 150.000');
  });

  it('is withheld when the offer is off, has no threshold, or copy withholds it', () => {
    expect(freeShippingLine({ ...on, freeShipping: false })).toBe('');
    expect(freeShippingLine({ ...on, freeShippingMin: 0 })).toBe('');
    expect(freeShippingLine({ ...on, copy: () => '' })).toBe('');
  });
});
