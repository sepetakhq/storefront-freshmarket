import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

import { useConfig } from '@sepetakhq/storefront-kit/config/ConfigProvider';
import { useHome } from '@sepetakhq/storefront-kit/hooks/queries';
import { qk } from '@sepetakhq/storefront-kit/api/queryKeys';
import { serverNow } from '@sepetakhq/storefront-kit/api/client';

import ProductCard from '../components/ProductCard.jsx';
import { Tile } from '../components/Tile.jsx';
import { Img, SIZES } from '../ui/Img.jsx';
import { CountdownCells } from '../ui/Countdown.jsx';
import { EmptyState, ErrorState, ProductGridSkeleton, Skeleton } from '../ui/states.jsx';
import { bannerBg, initials, showCountdown } from '../lib/copy.js';

const wrap = { maxWidth: 1280, margin: '0 auto', padding: '0 20px' };
const h2 = { fontSize: 24, fontWeight: 800, margin: 0, letterSpacing: '-0.3px' };
const eyebrow = { fontSize: 11.5, fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--fm-green)' };

/**
 * The home page is the section list the merchant published, in order. The
 * trust strip and the WhatsApp block are not sections: they come from the
 * brand block and render in fixed places, because the design put them there.
 */
export default function HomeRoute() {
  const { data, isPending, isError, error, refetch } = useHome();

  if (isPending) return <HomeSkeleton />;
  if (isError) {
    return (
      <div style={{ ...wrap, padding: '60px 20px' }}>
        <ErrorState error={error} onRetry={refetch} />
      </div>
    );
  }
  const sections = data?.sections ?? [];
  if (sections.length === 0) return <EmptyHome />;

  return (
    <main>
      {sections.map((sec, i) => (
        <Section key={sec.id ?? i} sec={sec} />
      ))}
      <WhatsAppCta />
    </main>
  );
}

function Section({ sec }) {
  switch (sec.type) {
    case 'hero':
      return sec.hero ? (
        <>
          <Hero hero={sec.hero} />
          <TrustStrip />
        </>
      ) : null;
    case 'cats':
      return sec.cats?.length ? <Categories cats={sec.cats} /> : null;
    case 'campaign':
      return sec.campaign?.products?.length ? <Deals campaign={sec.campaign} /> : null;
    case 'grid':
    case 'carousel':
      return sec.grid?.products?.length ? <Grid grid={sec.grid} /> : null;
    case 'banner':
      return sec.banner?.text ? <Banner banner={sec.banner} /> : null;
    case 'features':
      return sec.features?.items?.length ? <Features features={sec.features} /> : null;
    case 'story':
      return sec.story?.title ? <Testimonial story={sec.story} /> : null;
    default:
      // A type this bundle predates: skipped, the way the resolver skips
      // one it does not know.
      return null;
  }
}

/* --- hero ---------------------------------------------------------------- */

function Hero({ hero }) {
  const { brand } = useConfig();
  const picture = brand.heroImages?.[0];
  return (
    <section style={{ background: 'var(--fm-ink)', color: '#fff' }}>
      <div style={{ ...wrap, display: 'grid', gap: 32, gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', alignItems: 'center', padding: '44px 20px' }}>
        <div>
          {brand.hero_eyebrow && <div style={{ ...eyebrow, color: 'var(--fm-lime)' }}>{brand.hero_eyebrow}</div>}
          <h1 style={{ fontSize: 'clamp(30px, 4.6vw, 52px)', fontWeight: 800, lineHeight: 1.08, letterSpacing: '-0.8px', margin: '12px 0 14px' }}>
            {hero.title} {hero.em && <span style={{ color: 'var(--fm-lime)' }}>{hero.em}</span>}
          </h1>
          {hero.sub && <p style={{ fontSize: 16, lineHeight: 1.6, color: '#CFE3D5', margin: '0 0 24px', maxWidth: 520 }}>{hero.sub}</p>}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link to="/katalog" className="fm-btn fm-btn-sun">
              {hero.cta || 'Belanja sekarang'} →
            </Link>
            <Link to="/katalog?sale=1" className="fm-btn" style={{ border: '1.5px solid rgba(255,255,255,.35)', color: '#fff' }}>
              Lihat promo
            </Link>
          </div>
        </div>
        <div style={{ justifySelf: 'center', width: '100%', maxWidth: 480 }}>
          <Img
            src={picture?.url}
            srcSet={picture?.srcset}
            sizes={SIZES.heroSolo}
            alt={picture?.alt ?? ''}
            ratio="1200/1040"
            radius={18}
            priority
            style={{ background: 'rgba(255,255,255,.06)', border: '1px dashed rgba(255,255,255,.22)' }}
            fallback={
              <div className="fm-tile" style={{ color: 'var(--fm-mint)', fontSize: 40, background: 'transparent' }}>
                {initials([brand.wordmark_primary, brand.wordmark_accent].filter(Boolean).join(' '))}
              </div>
            }
          />
        </div>
      </div>
    </section>
  );
}

/** brand.hero_stats as the four trust tiles under the hero. */
function TrustStrip() {
  const { brand } = useConfig();
  const stats = brand.heroStats ?? [];
  if (stats.length === 0) return null;
  return (
    <section style={{ ...wrap, marginTop: -18 }}>
      <div style={{ background: '#fff', border: '1px solid var(--fm-line)', borderRadius: 14, display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(${stats.length > 3 ? 160 : 200}px, 1fr))`, gap: 1, overflow: 'hidden', boxShadow: '0 10px 30px rgba(18,37,27,.08)' }}>
        {stats.map((s, i) => (
          <div key={i} style={{ padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'center', borderRight: i < stats.length - 1 ? '1px solid var(--fm-line)' : 'none' }}>
            <span aria-hidden="true" style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--fm-tint-2)', color: 'var(--fm-green)', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 12, flexShrink: 0 }}>
              {initials(s.value)}
            </span>
            <span style={{ minWidth: 0 }}>
              <span style={{ display: 'block', fontWeight: 800, fontSize: 13.5 }}>{s.value}</span>
              <span style={{ display: 'block', fontSize: 12, color: 'var(--fm-muted)' }}>{s.label}</span>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* --- categories --------------------------------------------------------- */

function Categories({ cats }) {
  const { brand } = useConfig();
  return (
    <section style={{ ...wrap, padding: '40px 20px 0' }}>
      <h2 style={h2}>{brand.sections?.cats_heading || 'Belanja per Kategori'}</h2>
      <div style={{ marginTop: 16, display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
        {cats.map((c) => (
          <Link key={c.key} to={`/katalog?cat=${encodeURIComponent(c.key)}`} className="hv-card" style={{ background: '#fff', border: '1px solid var(--fm-line)', borderRadius: 14, padding: 12, display: 'flex', gap: 12, alignItems: 'center', color: 'var(--fm-text)', transition: 'transform .15s, box-shadow .15s' }}>
            <span style={{ width: 52, height: 52, borderRadius: 12, overflow: 'hidden', flexShrink: 0 }}>
              <Img src={c.image} srcSet={c.image_srcset} sizes={SIZES.thumb} alt="" ratio="1/1" fallback={<Tile label={c.label} tintKey={c.key} size={15} />} />
            </span>
            <span style={{ minWidth: 0 }}>
              <span style={{ display: 'block', fontWeight: 800, fontSize: 13.5 }}>{c.label}</span>
              {c.subtitle && <span style={{ display: 'block', fontSize: 11.5, color: 'var(--fm-muted)', marginTop: 2 }}>{c.subtitle}</span>}
            </span>
            <span aria-hidden="true" style={{ marginLeft: 'auto', color: 'var(--fm-muted-2)' }}>›</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* --- deals (campaign) --------------------------------------------------- */

function Deals({ campaign }) {
  const qc = useQueryClient();
  const { brand } = useConfig();
  const ticking = showCountdown(campaign.ends_at, serverNow());
  return (
    <section style={{ ...wrap, padding: '40px 20px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div>
          {campaign.badge && <div style={eyebrow}>{campaign.badge}</div>}
          <h2 style={h2}>{campaign.title}</h2>
        </div>
        {ticking && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12.5, color: 'var(--fm-muted)', fontWeight: 600 }}>Berakhir dalam</span>
            <CountdownCells until={campaign.ends_at} onExpire={() => qc.invalidateQueries({ queryKey: qk.home })} />
          </div>
        )}
        <Link to="/katalog?sale=1" className="hv-pink" style={{ marginLeft: 'auto', fontWeight: 700, fontSize: 13.5 }}>
          {brand.sections?.grid_see_all || 'Lihat semua deal →'}
        </Link>
      </div>
      <div className="product-grid" style={{ marginTop: 16 }}>
        {campaign.products.map((p) => (
          <ProductCard key={p.id} p={p} variant="campaign" />
        ))}
      </div>
    </section>
  );
}

function Grid({ grid }) {
  const { brand } = useConfig();
  return (
    <section style={{ ...wrap, padding: '40px 20px 0' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
        <h2 style={h2}>{grid.title}</h2>
        <Link to="/katalog" className="hv-pink" style={{ fontWeight: 700, fontSize: 13.5 }}>
          {brand.sections?.grid_see_all || 'Lihat semua →'}
        </Link>
      </div>
      <div className="product-grid" style={{ marginTop: 16 }}>
        {grid.products.map((p) => (
          <ProductCard key={p.id} p={p} />
        ))}
      </div>
    </section>
  );
}

/* --- banner ------------------------------------------------------------- */

function Banner({ banner }) {
  const tone = bannerBg(banner.bg);
  return (
    <section style={{ ...wrap, padding: '32px 20px 0' }}>
      <div style={{ background: tone.background, color: tone.color, borderRadius: 18, padding: '28px 28px', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
        <p style={{ margin: 0, fontSize: 'clamp(17px, 2.2vw, 24px)', fontWeight: 800, lineHeight: 1.3, flex: '1 1 360px', letterSpacing: '-0.3px' }}>{banner.text}</p>
        {banner.cta && (
          <Link to="/katalog" className="fm-btn" style={{ background: tone.accent, color: tone.accentText }}>
            {banner.cta}
          </Link>
        )}
      </div>
    </section>
  );
}

/* --- features ("kenapa belanja di sini") -------------------------------- */

function Features({ features }) {
  return (
    <section style={{ ...wrap, padding: '44px 20px 0' }}>
      <h2 style={{ ...h2, textAlign: 'center' }}>{features.title}</h2>
      <div style={{ marginTop: 20, display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))' }}>
        {features.items.map((it, i) => (
          <div key={i} style={{ background: '#fff', border: '1px solid var(--fm-line)', borderRadius: 14, padding: 18 }}>
            <span aria-hidden="true" style={{ display: 'inline-grid', placeItems: 'center', width: 40, height: 40, borderRadius: 12, background: 'var(--fm-tint-2)', color: 'var(--fm-green)', fontWeight: 800, fontSize: 13 }}>
              {it.mark || initials(it.title)}
            </span>
            <h3 style={{ margin: '12px 0 6px', fontSize: 15, fontWeight: 800 }}>{it.title}</h3>
            {it.body && <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55, color: 'var(--fm-muted)' }}>{it.body}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}

/* --- story as a testimonial --------------------------------------------- */

function Testimonial({ story }) {
  const { brand } = useConfig();
  return (
    <section style={{ ...wrap, padding: '44px 20px 0' }}>
      <div style={{ background: 'var(--fm-tint-2)', borderRadius: 18, padding: '32px 28px', display: 'grid', gap: 18, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', alignItems: 'center' }}>
        <div>
          {brand.sections?.story_eyebrow && <div style={eyebrow}>{brand.sections.story_eyebrow}</div>}
          <h2 style={{ ...h2, marginTop: 6 }}>{story.title}</h2>
        </div>
        <div>
          {story.text && <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6, color: 'var(--fm-ink)', fontWeight: 500 }}>{story.text}</p>}
          {brand.sections?.story_cta && (
            <Link to="/katalog" className="fm-btn fm-btn-primary" style={{ marginTop: 18 }}>
              {brand.sections.story_cta}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

/* --- the newsletter block, as a WhatsApp link --------------------------- */

function WhatsAppCta() {
  const { brand } = useConfig();
  if (!brand.whatsapp_url) return null;
  return (
    <section style={{ ...wrap, padding: '44px 20px 56px' }}>
      <div style={{ border: '1.5px dashed var(--fm-mint)', borderRadius: 18, padding: '24px 26px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 320px' }}>
          <h2 style={{ ...h2, fontSize: 20 }}>Promo ke WhatsApp</h2>
          <p style={{ margin: '6px 0 0', fontSize: 13.5, color: 'var(--fm-muted)' }}>
            {brand.whatsapp_text || 'Dapat info diskon dan produk baru lebih dulu.'}
          </p>
        </div>
        <a href={brand.whatsapp_url} target="_blank" rel="noopener noreferrer" className="fm-btn fm-btn-primary">
          Chat WhatsApp
        </a>
      </div>
    </section>
  );
}

/* --- states ------------------------------------------------------------- */

function EmptyHome() {
  return (
    <div style={{ ...wrap, padding: '60px 20px' }}>
      <EmptyState
        title="Toko sedang disiapkan"
        body="Belum ada bagian di halaman depan. Katalognya sudah bisa dilihat."
        action={
          <Link to="/katalog" className="fm-btn fm-btn-primary">
            Lihat katalog
          </Link>
        }
      />
    </div>
  );
}

function HomeSkeleton() {
  return (
    <div aria-busy="true">
      <div style={{ background: 'var(--fm-ink)', height: 320 }} />
      <div style={{ ...wrap, padding: '40px 20px' }}>
        <Skeleton height={28} width={260} />
        <div style={{ marginTop: 16 }}>
          <ProductGridSkeleton count={8} />
        </div>
      </div>
    </div>
  );
}

