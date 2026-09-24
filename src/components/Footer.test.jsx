import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

const config = { brand: {}, paymentMethods: [] };
vi.mock('@sepetakhq/storefront-kit/config/ConfigProvider', () => ({ useConfig: () => config }));
vi.mock('@sepetakhq/storefront-kit/hooks/queries', () => ({ useCategories: () => ({ data: [{ key: 'sayur', label: 'Sayur' }] }) }));

const Footer = (await import('./Footer.jsx')).default;

afterEach(cleanup);

function setup(sections) {
  config.brand = { nav: [{ path: '/katalog', label: 'Katalog' }], phone: '0812', sections };
  config.paymentMethods = [{ enabled: true, name: 'QRIS' }];
  return render(
    <MemoryRouter>
      <Footer />
    </MemoryRouter>,
  );
}

describe('Footer', () => {
  it('draws the template headings behind blank labels', () => {
    setup({ footer_shop_heading: '  ' });
    for (const t of ['Belanja', 'Kategori', 'Kontak', 'Pembayaran']) expect(screen.getByText(t)).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Promo & Diskon' })).toBeTruthy();
  });

  it('draws the merchant headings when set', () => {
    setup({
      footer_shop_heading: 'Menu',
      footer_categories_heading: 'Lorong',
      footer_contact_heading: 'Hubungi',
      footer_payment_heading: 'Bayar',
      promo_title: 'Obral',
    });
    for (const t of ['Menu', 'Lorong', 'Hubungi', 'Bayar']) expect(screen.getByText(t)).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Obral' })).toBeTruthy();
  });
});
