import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// The cart and the toast are mocked so the card's decisions are what is
// asserted, not the provider plumbing the kit already tests.
const cart = { items: [], add: vi.fn(), setQty: vi.fn(), remove: vi.fn() };
vi.mock('@sepetakhq/storefront-kit/cart/CartProvider', () => ({ useCart: () => cart }));
const toast = { showToast: vi.fn() };
// The kit's useToast returns the show function itself; mocking it as an
// object is how a card that threw on every quick-add once passed here.
vi.mock('@sepetakhq/storefront-kit/ui/ToastProvider', () => ({ useToast: () => toast.showToast }));

const ProductCard = (await import('./ProductCard.jsx')).default;

afterEach(cleanup);
beforeEach(() => {
  cart.items = [];
  cart.add.mockClear();
  cart.setQty.mockClear();
  cart.remove.mockClear();
});

function product(over) {
  return {
    id: 'p1',
    slug: 'apel-fuji',
    name: 'Apel Fuji Merah 1 kg',
    category_key: 'sayur',
    category_label: 'Sayur & Buah',
    image: '',
    image_srcset: '',
    price: 38500,
    compare_at_price: 45000,
    on_sale: true,
    stock: 24,
    availability: 'available',
    ...over,
  };
}

function card(p) {
  return render(
    <MemoryRouter>
      <ProductCard p={p} />
    </MemoryRouter>,
  );
}

describe('ProductCard', () => {
  it('shows the discount, the strike-through, the stock and initials when there is no photo', () => {
    card(product());
    expect(screen.getByText('14% OFF')).toBeTruthy();
    expect(screen.getByText('Rp 45.000').tagName).toBe('S');
    expect(screen.getByText(/stok 24/)).toBeTruthy();
    expect(screen.getByText('AF')).toBeTruthy();
  });

  it('says nothing about a discount it cannot compute', () => {
    card(product({ compare_at_price: 0 }));
    expect(screen.queryByText(/OFF/)).toBeNull();
    expect(screen.queryByText('Rp 0')).toBeNull();
  });

  it('adds one and confirms, then becomes a stepper', () => {
    const p = product();
    card(p);
    fireEvent.click(screen.getByRole('button', { name: 'Tambah ke keranjang' }));
    expect(cart.add).toHaveBeenCalledWith(p, 1, null);
    expect(toast.showToast).toHaveBeenCalled();

    cleanup();
    cart.items = [{ productId: 'p1', variantId: null, qty: 2 }];
    card(p);
    expect(screen.getByRole('group', { name: /Jumlah/ })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Tambah' }));
    expect(cart.setQty).toHaveBeenCalledWith('p1:', 3);
    fireEvent.click(screen.getByRole('button', { name: 'Kurangi' }));
    expect(cart.setQty).toHaveBeenCalledWith('p1:', 1);
  });

  it('removes the line when stepping down from one, and caps + at the stock', () => {
    cart.items = [{ productId: 'p1', variantId: null, qty: 1 }];
    card(product({ stock: 1 }));
    expect(screen.getByRole('button', { name: 'Tambah' }).disabled).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Kurangi' }));
    expect(cart.remove).toHaveBeenCalledWith('p1:');
  });

  it('sends a variant product to its page instead of adding', () => {
    card(product({ has_variants: true, price_max: 72000 }));
    const link = screen.getByRole('link', { name: 'Pilih varian' });
    expect(link.getAttribute('href')).toBe('/produk/apel-fuji');
    expect(screen.getByText(/mulai/)).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Tambah/ })).toBeNull();
  });

  it('disables with the reason for sold out, scheduled and ended', () => {
    card(product({ sold_out: true, availability: 'sold_out' }));
    expect(screen.getByRole('button', { name: 'Stok habis' }).disabled).toBe(true);
    cleanup();
    card(product({ availability: 'ended' }));
    expect(screen.getByRole('button', { name: 'Penjualan ditutup' }).disabled).toBe(true);
    cleanup();
    card(product({ availability: 'scheduled', sell_from: '2030-01-01T00:00:00Z' }));
    expect(screen.getByRole('button', { name: /Dibuka/ }).disabled).toBe(true);
  });

  it('marks a pre-order and hides the stock count for it and for unlimited stock', () => {
    card(product({ preorder: true, preorder_lead_days: 2 }));
    expect(screen.getByText(/Pre-order/)).toBeTruthy();
    expect(screen.queryByText(/stok/)).toBeNull();
    cleanup();
    card(product({ unlimited_stock: true, stock: 0 }));
    expect(screen.queryByText(/stok/)).toBeNull();
    expect(screen.getByRole('button', { name: 'Tambah ke keranjang' }).disabled).toBe(false);
  });

  it('never shows a variant line quantity on a variant-less card', () => {
    cart.items = [{ productId: 'p1', variantId: 'v9', qty: 4 }];
    card(product());
    expect(screen.getByRole('button', { name: 'Tambah ke keranjang' })).toBeTruthy();
  });
});
