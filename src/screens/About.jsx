import { Img, SIZES } from '../ui/Img.jsx';
import { useConfig } from '@sepetakhq/storefront-kit/config/ConfigProvider';
import { paragraphs } from '@sepetakhq/storefront-kit/shared/format';

export default function About() {
  const { brand } = useConfig();
  // Already resolved by the API: a merchant who has not chosen a portrait gets
  // the hero this page has always borrowed, and the choice between the two is
  // not the storefront's to make.
  const portrait = brand.aboutImage;
  // The heading and the shop's name are the same string for most shops, so an
  // unset title renders the wordmark rather than an empty h1.
  const title =
    brand.aboutTitle ||
    [brand.wordmark_primary, brand.wordmark_accent].filter(Boolean).join(' ');
  const story = paragraphs(brand.aboutBody);

  return (
    <main
      aria-label={`Tentang ${title}`}
      style={{ flex: 1, maxWidth: 1000, margin: '0 auto', padding: '36px 20px 60px', width: '100%' }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 36, alignItems: 'center' }}>
        <Img
          src={portrait?.url}
          srcSet={portrait?.srcset}
          alt={portrait?.alt || brand.wordmark_primary}
          ratio="4/5"
          sizes={SIZES.hero}
          style={{
            flex: '1 1 320px',
            minWidth: 280,
            maxWidth: 440,
            borderRadius: '200px 200px 24px 24px',
            border: '8px solid #EFF1EC',
          }}
        />
        <div style={{ flex: '1 1 380px', minWidth: 300 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: '#9AA89C',
            }}
          >
            Cerita kami
          </div>
          <h1
            style={{
              fontFamily: "'Plus Jakarta Sans',system-ui,sans-serif",
              fontSize: 'clamp(34px,5vw,48px)',
              fontWeight: 600,
              margin: '10px 0 14px',
            }}
          >
            {title}
          </h1>
          {/*
            Text nodes, never dangerouslySetInnerHTML. The body is copy a
            merchant typed into the backoffice, and the shortest path from
            "let them use bold" to "let them inject a script" runs through
            exactly this element.

            The last paragraph carries the wider gap, so the spacing above the
            contact box does not depend on how many paragraphs were written.
          */}
          {story.map((para, i) => (
            <p
              key={i}
              style={{
                color: '#5C6B60',
                fontSize: 16,
                lineHeight: 1.75,
                margin: i === story.length - 1 ? '0 0 22px' : '0 0 14px',
              }}
            >
              {para}
            </p>
          ))}

          <div
            style={{ background: '#EFF1EC', borderRadius: 18, padding: '18px 20px', marginBottom: 18 }}
          >
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>Kunjungi kami</div>
            <div style={{ color: '#5C6B60', fontSize: 14.5, lineHeight: 1.7 }}>
              {brand.address_line1}
              <br />
              {brand.address_line2}
              <br />
              Email: {brand.email}
            </div>
          </div>

          {brand.whatsapp_url ? (
          <a
            className="hv-primary"
            href={brand.whatsapp_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              background: '#1B7A43',
              color: '#fff',
              borderRadius: 999,
              padding: '13px 28px',
              fontWeight: 700,
              fontSize: 14.5,
            }}
          >
            {brand.whatsapp_text}
          </a>
          ) : null}
        </div>
      </div>
    </main>
  );
}
