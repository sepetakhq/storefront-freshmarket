import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { useCategories, useProducts } from '@sepetakhq/storefront-kit/hooks/queries';

import ProductCard from '../components/ProductCard.jsx';
import { EmptyState, ErrorState, InlineError, ProductGridSkeleton } from '../ui/states.jsx';
import { SORTS, applySaleFilter, catalogTitle, filterChips, sortOrDefault } from '../lib/copy.js';

const ALL = 'Semua';

/**
 * The aisle. Every filter lives in the URL -- `cat`, `sort`, `sale`, `q` --
 * so a filtered page is a link and the back button unwinds a change. The
 * API knows cat/sort/q; "sedang diskon" is applied over the pages already
 * loaded, which is why its count says so.
 */
export default function CatalogRoute() {
  const [params, setParams] = useSearchParams();
  const cat = params.get('cat') || ALL;
  const sort = sortOrDefault(params.get('sort'));
  const sale = params.get('sale') === '1';
  const q = (params.get('q') ?? '').trim();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const categories = useCategories();
  const products = useProducts({ cat, sort, q });
  const cats = categories.data ?? [];

  const patch = (changes) => {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(changes)) {
      if (v === null || v === undefined || v === '' || v === ALL || (k === 'sort' && v === 'featured')) next.delete(k);
      else next.set(k, String(v));
    }
    setParams(next);
  };

  const loaded = (products.data?.pages ?? []).flatMap((p) => p.products);
  const items = applySaleFilter(loaded, sale);
  const filters = { cat: cat === ALL ? '' : cat, sale, q };
  const chips = filterChips(filters, cats);
  const title = catalogTitle(filters, cats);

  return (
    <main aria-label="Katalog" style={{ width: '100%', maxWidth: 1280, margin: '0 auto', padding: '20px 20px 56px' }}>
      <nav aria-label="Breadcrumb" style={{ fontSize: 12.5, color: 'var(--fm-muted)', marginBottom: 12 }}>
        <Link to="/" style={{ color: 'inherit' }}>Beranda</Link> / <span style={{ color: 'var(--fm-text)', fontWeight: 600 }}>{title}</span>
      </nav>

      <div className="fm-catalog">
        <aside>
          <div className="fm-mob" style={{ marginBottom: 10 }}>
          <button
            type="button"
            className="fm-btn fm-btn-light"
            style={{ width: '100%', justifyContent: 'space-between', textTransform: 'none', letterSpacing: 0 }}
            aria-expanded={filtersOpen}
            onClick={() => setFiltersOpen((o) => !o)}
          >
            <span>Filter & Kategori{chips.length ? ` (${chips.length})` : ''}</span>
            <span aria-hidden="true">{filtersOpen ? '▲ Tutup' : '▼ Buka'}</span>
          </button>
          </div>
          <div className="fm-filter-panel" data-open={filtersOpen ? 'true' : 'false'} style={{ background: '#fff', border: '1px solid var(--fm-line)', borderRadius: 14, padding: 16 }}>
            <div style={sideHead}>Kategori</div>
            {categories.isError ? (
              <InlineError error={categories.error} onRetry={categories.refetch} />
            ) : (
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 2 }}>
                <li>
                  <FilterRow active={cat === ALL} onClick={() => patch({ cat: null })}>
                    Semua produk
                  </FilterRow>
                </li>
                {cats.map((c) => (
                  <li key={c.key}>
                    <FilterRow active={cat === c.key} onClick={() => patch({ cat: c.key })}>
                      {c.label}
                    </FilterRow>
                  </li>
                ))}
              </ul>
            )}
            <div style={{ ...sideHead, marginTop: 18 }}>Filter</div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, fontWeight: 600, padding: '6px 4px', cursor: 'pointer' }}>
              <input type="checkbox" checked={sale} onChange={(e) => patch({ sale: e.target.checked ? '1' : null })} />
              Sedang diskon
            </label>
          </div>
        </aside>

        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: '-0.3px' }}>{title}</h1>
            <span style={{ fontSize: 12.5, color: 'var(--fm-muted)' }} aria-live="polite">
              {products.isPending ? 'Memuat…' : `${items.length} produk${sale ? ' dari yang dimuat' : ''}${products.hasNextPage ? '+' : ''}`}
            </span>
            <label style={{ marginLeft: 'auto', fontSize: 12.5, color: 'var(--fm-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
              Urutkan
              <select
                value={sort}
                onChange={(e) => patch({ sort: e.target.value })}
                style={{ border: '1.5px solid var(--fm-line)', borderRadius: 8, padding: '7px 10px', fontSize: 13, background: '#fff', fontWeight: 600 }}
              >
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {chips.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
              <span style={{ fontSize: 12, color: 'var(--fm-muted)' }}>Filter aktif:</span>
              {chips.map((ch) => (
                <button key={ch.key} type="button" className="fm-chip" onClick={() => patch(ch.clear)} aria-label={`Hapus filter ${ch.label}`}>
                  {ch.label} <span aria-hidden="true">×</span>
                </button>
              ))}
              <button type="button" onClick={() => patch({ cat: null, q: null, sale: null })} className="hv-pink" style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--fm-muted)' }}>
                Hapus semua
              </button>
            </div>
          )}

          <div style={{ marginTop: 16 }}>
            {products.isPending ? (
              <ProductGridSkeleton count={8} />
            ) : products.isError ? (
              <ErrorState error={products.error} onRetry={products.refetch} />
            ) : items.length === 0 ? (
              <EmptyState
                title="Tidak ada produk yang cocok"
                body={q ? `Tidak ada yang bernama “${q}”. Coba kata lain atau pilih kategori.` : 'Coba longgarkan filter atau pilih kategori lain.'}
                action={
                  <button type="button" className="fm-btn fm-btn-primary" onClick={() => patch({ cat: null, q: null, sale: null })}>
                    Lihat semua produk
                  </button>
                }
              />
            ) : (
              <>
                <div className="product-grid">
                  {items.map((p) => (
                    <ProductCard key={p.id} p={p} />
                  ))}
                </div>
                {products.hasNextPage && (
                  <div style={{ textAlign: 'center', marginTop: 24 }}>
                    <button
                      type="button"
                      className="fm-btn fm-btn-ghost"
                      disabled={products.isFetchingNextPage}
                      onClick={() => products.fetchNextPage()}
                    >
                      {products.isFetchingNextPage ? 'Memuat…' : 'Muat lagi'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

const sideHead = { fontSize: 11, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--fm-muted-2)', marginBottom: 8 };

function FilterRow({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      style={{
        width: '100%',
        textAlign: 'left',
        padding: '7px 8px',
        borderRadius: 8,
        fontSize: 13.5,
        fontWeight: active ? 800 : 600,
        color: active ? 'var(--fm-green)' : 'var(--fm-text)',
        background: active ? 'var(--fm-tint-2)' : 'transparent',
      }}
    >
      {children}
    </button>
  );
}
