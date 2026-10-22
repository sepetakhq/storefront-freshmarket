import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

const config = { brand: {}, paymentMethods: [] };
vi.mock('@sepetakhq/storefront-kit/config/ConfigProvider', () => ({ useConfig: () => config }));
vi.mock('@sepetakhq/storefront-kit/hooks/queries', () => ({ useCategories: () => ({ data: [{ key: 'sayur', label: 'Sayur' }] }) }));

const Footer = (await import('./Footer.jsx')).default;

afterEach(cleanup);

function setup(sections, paymentMethods = [{ enabled: true, name: 'QRIS' }]) {
  config.brand = { nav: [{ path: '/katalog', label: 'Katalog' }], phone: '0812', sections };
  config.paymentMethods = paymentMethods;
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
    expect(screen.getByRole('link', { name: 'Promo' })).toBeTruthy();
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

  it("draws the server's badge in place of a name, once per badge, and keeps names it has none for", () => {
    const bca = 'http://api.test/logos/payment/bca.svg';
    const { container } = setup({}, [
      { code: 'BCA', name: 'VA BCA', enabled: true, logo_url: bca },
      { code: 'MANUAL_BCA', name: 'Transfer BCA', enabled: true, logo_url: bca },
      { code: 'MANUAL_BANK_1', name: 'Transfer SeaBank', enabled: true },
    ]);
    const imgs = [...container.querySelectorAll('.fm-logo-chip img')];
    expect(imgs.map((i) => i.getAttribute('src'))).toEqual([bca]);
    // The first name behind a badge is how it is read aloud.
    expect(screen.getByRole('img', { name: 'VA BCA' })).toBeTruthy();
    expect(screen.queryByRole('img', { name: 'Transfer BCA' })).toBeNull();
    expect(screen.getByText('Transfer SeaBank')).toBeTruthy();
  });

  // The platform's mark rides the plan. An older API version strips the
  // field, and then nothing is drawn.
  it('shows the Sepetak badge only when the shop carries it', () => {
    setup();
    expect(screen.queryByRole('link', { name: 'Dibuat dengan Sepetak' })).toBeNull();
    cleanup();
    config.tenant = { ...config.tenant, sepetak_badge: true };
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    );
    const a = screen.getByRole('link', { name: 'Dibuat dengan Sepetak' });
    expect(a.getAttribute('href')).toBe('https://sepetak.com/?ref=toko');
    expect(a.getAttribute('target')).toBe('_blank');
    delete config.tenant;
  });
});
