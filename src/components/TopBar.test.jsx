import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const config = { brand: {}, freeShipping: false, freeShippingMin: 0, freeShippingMinLabel: '' };
vi.mock('@sepetakhq/storefront-kit/config/ConfigProvider', () => ({ useConfig: () => config }));

const { default: TopBar, topBarSegments } = await import('./TopBar.jsx');

afterEach(cleanup);

const copy = (s) => s.replaceAll('{free_shipping_min}', 'Rp 150.000');

describe('TopBar', () => {
  it('draws nothing for a shop that filled none of it in', () => {
    config.brand = {};
    const { container } = render(<TopBar />);
    expect(container.innerHTML).toBe('');
  });

  it('shows only the segments that exist, in the design order', () => {
    expect(
      topBarSegments({
        brand: { address_line1: 'Jl. Melati 24', address_line2: 'Bandung', phone: '0812', opening_hours: '07–21', email: 'x@y.z' },
        freeShipping: true,
        freeShippingMin: 150000,
        copy,
      }),
    ).toEqual(['Jl. Melati 24, Bandung', 'Gratis ongkir min. belanja Rp 150.000', '0812', '07–21']);
  });

  it('words the free-shipping line with the merchant labels', () => {
    const sections = { hero_chip_shipping: 'Bebas ongkir', hero_chip_shipping_note: 'di atas {free_shipping_min}' };
    expect(topBarSegments({ brand: { sections }, freeShipping: true, freeShippingMin: 150000, copy })).toEqual(['Bebas ongkir di atas Rp 150.000']);
  });

  it('withholds the free-shipping line when the offer is off or zero', () => {
    expect(topBarSegments({ brand: { phone: '0812' }, freeShipping: false, freeShippingMin: 150000, copy })).toEqual(['0812']);
    expect(topBarSegments({ brand: { phone: '0812' }, freeShipping: true, freeShippingMin: 0, copy })).toEqual(['0812']);
  });

  it('renders social icons with their names for a reader', () => {
    config.brand = { social_links: [{ kind: 'instagram', url: 'https://instagram.com/toko' }, { kind: 'newnet', url: 'https://n.example' }] };
    render(<TopBar />);
    expect(screen.getByRole('link', { name: 'Instagram' }).getAttribute('href')).toBe('https://instagram.com/toko');
    // A kind this bundle predates still gets a glyph.
    expect(screen.getByRole('link', { name: 'newnet' }).textContent).toBe('NE');
  });
});
