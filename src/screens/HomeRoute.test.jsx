import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, describe, expect, it, vi } from 'vitest';

const config = { brand: { nav: [], heroImages: [], heroStats: [], sections: {} } };
vi.mock('@sepetakhq/storefront-kit/config/ConfigProvider', () => ({ useConfig: () => config }));

const home = { data: { sections: [] }, isPending: false, isError: false };
vi.mock('@sepetakhq/storefront-kit/hooks/queries', () => ({ useHome: () => home }));

const cart = { items: [], add: vi.fn(), setQty: vi.fn(), remove: vi.fn() };
vi.mock('@sepetakhq/storefront-kit/cart/CartProvider', () => ({ useCart: () => cart }));
vi.mock('@sepetakhq/storefront-kit/ui/ToastProvider', () => ({ useToast: () => vi.fn() }));

const HomeRoute = (await import('./HomeRoute.jsx')).default;

afterEach(cleanup);

function setup(sections, brand = {}) {
  config.brand = { nav: [], heroImages: [], heroStats: [], sections: {}, ...brand };
  home.data = { sections };
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter>
        <HomeRoute />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

const HERO = { id: 'h', type: 'hero', hero: { title: 'Belanja Segar,', em: 'Hidup Lebih Baik', sub: 'Sub.', cta: 'Belanja sekarang' } };

describe('HomeRoute', () => {
  it('invites the buyer to the catalogue when nothing is published', () => {
    setup([]);
    expect(screen.getByText('Toko sedang disiapkan')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Lihat katalog' })).toBeTruthy();
  });

  it('renders the hero without a picture, and the trust strip only from hero_stats', () => {
    setup([HERO], { wordmark_primary: 'Pasar', wordmark_accent: 'Segar' });
    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain('Hidup Lebih Baik');
    expect(screen.getByText('PS')).toBeTruthy();
    expect(screen.queryByText('Dipetik pagi hari')).toBeNull();

    cleanup();
    setup([HERO], { heroStats: [{ value: 'Segar Tiap Hari', label: 'Dipetik pagi hari' }] });
    expect(screen.getByText('Dipetik pagi hari')).toBeTruthy();
  });

  it('renders a features section with marks, falling back to initials', () => {
    setup([
      {
        id: 'f',
        type: 'features',
        features: { title: 'Kenapa', items: [{ mark: '01', title: 'Kualitas', body: 'Disortir.' }, { mark: '', title: 'Harga pasar', body: '' }] },
      },
    ]);
    expect(screen.getByRole('heading', { name: 'Kenapa' })).toBeTruthy();
    expect(screen.getByText('01')).toBeTruthy();
    expect(screen.getByText('HP')).toBeTruthy();
  });

  it('skips a section type this bundle does not know, and an empty features list', () => {
    setup([
      { id: 'x', type: 'video-hero' },
      { id: 'f', type: 'features', features: { title: 'Kenapa', items: [] } },
      { id: 's', type: 'story', story: { title: 'Kata Pelanggan', text: '“Segar.”' } },
    ]);
    expect(screen.queryByText('Kenapa')).toBeNull();
    expect(screen.getByText('Kata Pelanggan')).toBeTruthy();
  });

  it('shows the deal countdown only when the end is within 72 hours', () => {
    const products = [{ id: 'p', slug: 'a', name: 'Apel', price: 1, stock: 1 }];
    const soon = new Date(Date.now() + 2 * 3600 * 1000).toISOString();
    const far = new Date(Date.now() + 10 * 24 * 3600 * 1000).toISOString();
    setup([{ id: 'c', type: 'campaign', campaign: { title: 'Deal Hari Ini', ends_at: soon, products } }]);
    expect(screen.getByText('Berakhir dalam')).toBeTruthy();
    cleanup();
    setup([{ id: 'c', type: 'campaign', campaign: { title: 'Deal Hari Ini', ends_at: far, products } }]);
    expect(screen.queryByText('Berakhir dalam')).toBeNull();
  });

  it('offers WhatsApp only when the shop has a number', () => {
    setup([HERO]);
    expect(screen.queryByText('Promo ke WhatsApp')).toBeNull();
    cleanup();
    setup([HERO], { whatsapp_url: 'https://wa.me/62' });
    expect(screen.getByRole('link', { name: 'Chat WhatsApp' }).getAttribute('href')).toBe('https://wa.me/62');
    cleanup();
    setup([HERO], { whatsapp_url: 'https://wa.me/62', whatsapp_text: 'Tanya admin' });
    expect(screen.getByRole('link', { name: 'Tanya admin' })).toBeTruthy();
    // The button's words are not also the description under the heading.
    expect(screen.getAllByText('Tanya admin')).toHaveLength(1);
    cleanup();
    setup([HERO], { whatsapp_url: 'https://wa.me/62', whatsapp_text: '   ' });
    expect(screen.getByRole('link', { name: 'Chat WhatsApp' })).toBeTruthy();
  });

  const products = [{ id: 'p', slug: 'a', name: 'Apel', price: 1, stock: 1 }];
  const soon = () => new Date(Date.now() + 2 * 3600 * 1000).toISOString();
  const page = () => [
    HERO,
    { id: 'k', type: 'cats', cats: [{ key: 'sayur', label: 'Sayur' }] },
    { id: 'c', type: 'campaign', campaign: { title: 'Deal', ends_at: soon(), products } },
    { id: 'g', type: 'grid', grid: { title: 'Terlaris', products } },
    { id: 's', type: 'story', story: { title: 'Kata Pelanggan', text: 'Segar.' } },
  ];

  it('draws the template wording behind blank or whitespace-only labels', () => {
    setup(page(), { sections: { hero_secondary_cta: '  ', campaign_cta: '' } });
    expect(screen.getByRole('link', { name: 'Lihat promo' })).toBeTruthy();
    expect(screen.getByText('Belanja per Kategori')).toBeTruthy();
    expect(screen.getByText('Berakhir dalam')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Lihat semua deal →' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Lihat semua →' })).toBeTruthy();
    expect(screen.getByText('Cerita kami')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Tentang kami' }).getAttribute('href')).toBe('/tentang');
  });

  it('draws the merchant labels when set, arrows kept outside them', () => {
    setup(page(), {
      sections: {
        hero_secondary_cta: 'Cek diskon',
        cats_heading: ' Lorong ',
        countdown_label: 'Sisa waktu',
        campaign_cta: 'Semua promo',
        grid_see_all: 'Lihat lagi',
        story_eyebrow: 'Kata mereka',
        story_cta: 'Kenalan',
      },
    });
    expect(screen.getByRole('link', { name: 'Cek diskon' })).toBeTruthy();
    expect(screen.getByText('Lorong')).toBeTruthy();
    expect(screen.getByText('Sisa waktu')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Semua promo →' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Lihat lagi →' })).toBeTruthy();
    expect(screen.getByText('Kata mereka')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Kenalan' }).getAttribute('href')).toBe('/tentang');
  });
});
