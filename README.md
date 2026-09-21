# storefront-freshmarket

The `freshmarket` storefront template: a grocery / daily-needs look with
Indonesian copy, built for any shop that picks it. Everything that is not a
design — API client, tenant config, cart, checkout state, the helpers that
decide what a page may say — comes from
[`@sepetakhq/storefront-kit`](https://www.npmjs.com/package/@sepetakhq/storefront-kit).

Nothing about a merchant is in here. Name, contact strip, nav, categories,
hero, the "why shop here" list, payment methods and couriers all arrive from
`/storefront/config` and `/storefront/home`; a product or category without a
picture renders as a two-letter tile on its category's tint.

## Develop

Run the platform API first (`make up && make seed && make api` in the
`lilyalora` checkout; the seed installs the *Pasar Segar* demo tenant on this
template), then:

```
npm install
npm run dev          # http://freshmarket.localhost:5177, /api proxied to the API on :8090
```

Open it on `freshmarket.localhost`, not `localhost`: the API resolves the shop
from the Host header. `API_TARGET` and `DEV_PORT` override the proxy target
and port. The document head is filled from the API by the kit's `seoDevPlugin`.

## Ship

Every push to `main` builds and uploads to the template registry
(`.github/workflows/release.yml`); the API serves the new build within a
minute. To see the registry path locally, publish to the dev MinIO:

```
npm run publish:local
open http://freshmarket.localhost:8090/
```

## Rules

- Serve exactly the kit's `ROUTE_CONTRACT` (`src/routes.test.js` pins it).
- Keep the `<!--seo:start-->` / `<!--seo:end-->` markers in `index.html`.
- Copy is Indonesian, the kit's default; the merchant's own words come from
  config and are never hardcoded. Branch on `payment.kind`, render
  `order.timeline`.
- The template's own decisions live in `src/lib/copy.js` as pure functions
  with tests: discount percent, quick-add state, the sticky bar, filters.
