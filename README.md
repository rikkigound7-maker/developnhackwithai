# Develop & Hack_With_Ai — static front end for an AI gateway

A complete, dependency-free front end for a hosted AI gateway: one OpenAI/Anthropic-compatible
endpoint, three subscription tiers, token plans, pay-per-use top-ups and an 18-model catalogue.
Twelve pages, a shared design system, and no build step — open `index.html` or drag the folder
onto Netlify.

The layout, copy, prices and model list mirror the reference gateway this was built against. The
brand, Telegram handle and API host are the only things changed.

**Live:** <https://rikkigound7-maker.github.io/developnhackwithai/> — served straight from this
repository's `main` branch by GitHub Pages, no build step.

## Deploy

**GitHub Pages.** This repo already publishes from `main` / root. Push to `main` and the site
rebuilds itself. Every link is relative (`pricing.html`, `assets/styles.css`), so it works both at
the domain root and under the `/developnhackwithai/` subpath.

**Drag and drop.** Zip this folder (or drag it directly) onto <https://app.netlify.com/drop>.
`netlify.toml`, `_redirects` and `404.html` are already in place, so pretty paths like `/pricing`
and a real 404 work immediately.

**From a repository.** Connect the repo, leave the build command empty, set the publish directory
to the folder containing `index.html`.

Locally: `python3 -m http.server 8123` in this folder, then open
<http://localhost:8123>. Opening `index.html` straight off disk works too.

## Pages

| File | What it is |
| --- | --- |
| `index.html` | Hero, console mockup, stats, three plan cards, 18-model preview, setup tabs, data cards, FAQ |
| `pricing.html` | Four tabs: Plans, Token Plan, Pay-per-use, Compare — plus six FAQs |
| `models.html` | 18-model catalogue with access-tier filters, live count and empty state |
| `docs.html` | Eight sections, five endpoints, six client tabs, error table, sticky scrollspy nav |
| `checkout.html` | Twelve radio cards (monthly, daily, token plans) with a live, currency-aware summary |
| `guides.html` | Four setup guides, four articles and the endpoint reference |
| `contact.html` | Support, billing and community channels, payment methods, address |
| `terms.html`, `privacy.html`, `refund.html`, `shipping.html` | Legal prose with its own sidebar |
| `404.html` | Not-found page with the three most likely destinations |

## Plans and pricing

| Plan | Per day | Per month | Parallel sessions | Models |
| --- | --- | --- | --- | --- |
| Pro | $5 | $40 | 2 | 8 base models |
| Max | $7 | $65 | 6 | 13 models (8 base + 5 extensions) |
| Ultron | $15 | $145 | 14 | 18 models, frontier set included |

Monthly plans are billed for 28 days. Token Plans: 1B / 5B / 40B tokens at $20 / $95 / $595 on
the base catalogue, and $50 / $185 / $1.200 on the frontier set. Pay-per-use is 20% of the official
provider price, with top-ups of $8, $15, $32, $80 and $160. A 500K-token trial is available once
per Telegram account on the base models.

The catalogue has 18 models in three access tiers: 8 on every plan, 5 more on Max and Ultron, and
5 frontier models on Ultron only.

## Endpoints

| Format | Base URL |
| --- | --- |
| OpenAI | `https://freeai.jembatanai.com/v1` |
| Anthropic | `https://freeai.jembatanai.com` (the SDK adds `/v1`) |

Five routes are documented: `/v1/models`, `/v1/chat/completions`, `/v1/messages`, `/v1/responses`
and `/v1/quota`. Keys use the `sk-` prefix.

## Behaviour (`assets/app.js`)

Vanilla ES5-ish JavaScript, one IIFE, no dependencies. Everything is driven by data attributes,
so the same code works on any page that includes the markup:

- **Theme** — `data-theme-toggle`, follows the OS on first visit, then remembers the choice in
  `localStorage` (`conduit.theme`). An inline snippet in each `<head>` applies it before paint, so
  there is no flash.
- **Currency** — `data-currency-toggle` swaps every `[data-price]` element between USD and IDR
  (`conduit.currency`). Any element can carry `data-price-suffix`. Plan, token-plan and checkout
  prices convert; the per-1M-token rate table and top-up cards deliberately stay in USD.
- **Tabs** — `data-tabs` container, `role="tab"` buttons, arrow-key navigation, `#plans` /
  `#compare` deep links.
- **Copy buttons** — `data-copy` pointing at an element id, with `data-copy-label` /
  `data-copied-label` for the label swap.
- **Catalogue** — `data-model-search`, `data-model-filter`, `data-model-count`, `data-model-empty`;
  supports `?access=` deep links.
- **Checkout** — `data-checkout`; each product radio carries `data-name`, `data-models`,
  `data-parallel`, `data-validity` and `data-amount`, and the summary is rendered into
  `[data-summary-*]`. Ordering continues in Telegram.
- **Scrollspy** — `data-spy` on the docs sidebar.
- **Reveal** — `data-reveal` fades sections in, disabled under `prefers-reduced-motion`.

`data-year` stamps the footer year.

## Rebranding

1. **Name and mark** — the `.brand` block in every page header and footer. The mark is
   `.brand-mark` in `styles.css` (a gradient square); the favicon is `assets/favicon.svg`.
2. **Colour and type** — the token block at the top of `assets/styles.css`: `--accent`,
   `--accent-2`, `--lime`, `--bg`, `--surface`, `--text-*`, plus `--grad` (the 115° gradient used on
   buttons and the console) and the two font families.
3. **Contact and endpoint** — the Telegram links in every page (`https://t.me/developnhackwithai`)
   and the API host in `docs.html`, the code samples and the footer (`freeai.jembatanai.com`).

## Before selling anything

- **Prices and products** — `pricing.html`, the plan cards on `index.html`, and the twelve radios in
  `checkout.html`. Visible labels and `data-*` values must agree.
- **Model catalogue** — all 18 cards in `models.html`: ids, context windows, tiers and availability.
  `data-name` on each card must match its visible `<h3>`, because the search filters on both.
- **Company details** — the address in `contact.html`, the support inboxes and the governing-law
  line in `terms.html`.
- **IDR conversion** — `IDR_PER_USD` near the top of `assets/app.js` is a fixed rate (16,000). For
  real pricing, fetch a rate or set a manual override per region.

The legal pages are written to be plausible and internally consistent; they are not legal advice
and should be reviewed by a lawyer for the jurisdiction you actually operate in.

## No backend, by design

Nothing here posts anywhere. Checkout continues to `https://t.me/developnhackwithai`, where the
existing bot handles payment and key delivery. There is no payment integration, no API proxy and
no analytics script.

## Accessibility and support

- Skip link, landmark regions, `aria-current` on the active nav item, labelled controls.
- Tabs implement the WAI-ARIA pattern with arrow/Home/End keys and a roving tabindex.
- Focus rings are visible on both themes; `prefers-reduced-motion` and `print` are handled.
- Tested in current Safari, Chrome and Firefox. The checkout cards rely on `:has()` for the
  selected state, which is supported in all of them; older browsers fall back to the native radio.

## Licence

The code in this folder is yours to use and modify. Fonts (Plus Jakarta Sans, JetBrains Mono) are
served from Google Fonts under the SIL Open Font License.
