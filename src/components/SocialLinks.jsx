// One glyph per kind the platform knows (tenant.SocialKinds). A kind this
// bundle predates falls back to its first letters rather than nothing, so a
// newly added network is visible before the template learns its icon.
const GLYPH = {
  instagram: 'IG',
  whatsapp: 'WA',
  tiktok: 'TT',
  facebook: 'FB',
};

const NAME = {
  instagram: 'Instagram',
  whatsapp: 'WhatsApp',
  tiktok: 'TikTok',
  facebook: 'Facebook',
};

export default function SocialLinks({ links, tone = 'dark', size = 28 }) {
  if (!links?.length) return null;
  const dark = tone === 'dark';
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {links.map((l, i) => (
        <a
          key={`${l.kind}-${i}`}
          href={l.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={NAME[l.kind] ?? l.kind}
          title={NAME[l.kind] ?? l.kind}
          style={{
            width: size,
            height: size,
            borderRadius: 8,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: size < 28 ? 10 : 11,
            fontWeight: 800,
            letterSpacing: '.5px',
            background: dark ? 'rgba(255,255,255,.1)' : 'var(--fm-tint)',
            color: dark ? '#CFE3D5' : 'var(--fm-ink)',
          }}
        >
          {GLYPH[l.kind] ?? String(l.kind ?? '?').slice(0, 2).toUpperCase()}
        </a>
      ))}
    </div>
  );
}
