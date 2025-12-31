# Plan: For Magical Use Only - The Manifestorium Hub

This plan outlines the transformation of the current Next.js site into the high-intent, "found" aesthetic of the desert art-tech brand.

## Phase 1: Vercel Deployment & Environment Setup
To deploy this site, you need to connect your GitHub repo to Vercel and set the following **Environment Variables** in the Vercel Dashboard ([Settings > Environment Variables](/settings#integrations:vercel)):

### Required Variables:
- `CONTENTFUL_SPACE_ID`: Your Contentful Space ID.
- `CONTENTFUL_ACCESS_TOKEN`: Your Contentful Content Delivery API (CDA) token.
- `STRIPE_SECRET_KEY`: Your Stripe Secret Key (starts with `sk_`).
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Your Stripe Publishable Key (starts with `pk_`).
- `SITE_URL`: Set to `https://www.formagicaluseonly.com` (for Stripe redirects).

---

## Phase 2: The Cinematic Intro
Implement a "Discovery Sequence" that triggers on first load to establish the desert-tech vibe.
- [ ] Add `framer-motion` for smooth, high-end transitions.
- [ ] Create a `DiscoveryIntro.jsx` component:
  - Initial "Dust Drift" static effect (low opacity grain).
  - UV-Glitch text reveals: "Scanning Desert Frequencies..."
  - Final fade into the Hub.

## Phase 3: The Hub (Portal Selection)
Restructure `app/page.js` to serve as a world-selector rather than a standard scroll-page.
- [ ] **Iconography**: Implement the specific glyphs:
  - **The Manifestorium**: Bus icon (active).
  - **The Tank**: Glass Dome (Locked/Coming Soon).
  - **The Archive**: Filing Sigil (Locked).
- [ ] **Discovery Language**:
  - Replace "Shop" with "Unearth Magic".
  - Replace "Buy Now" with "Acquire This Form".
  - Replace "Portfolio" with "Field Notes".

## Phase 4: Product Rituals (PDP Enhancements)
Update `app/products/[slug]/page.js` to handle the specific layout requirements.
- [ ] **Variant Selector**: Segmented buttons for "Select a Form".
- [ ] **Collapsible Rituals**: Care instructions and Disclaimer sections using `<details>`.
- [ ] **Contentful Text Rendering**: Implement `white-space: pre-line` for multi-line descriptions.

## Phase 5: Contentful Content Type Mapping
Guidance for setting up your fields in Contentful:
- **Product Name**: Text
- **Slug**: Symbol (URL friendly)
- **Product Description**: Long Text (Markdown or multi-line)
- **Product Images**: Media (Array)
- **variantUx**: JSON Object (Crucial for Stripe integration)
  - Format: `{"variants": {"default": {"price": 50, "priceId": "price_..."}}}`

---

## Success Criteria
- Site feels "discovered" rather than "visited."
- 100% Mobile-first responsiveness.
- Stripe checkout flow handles shipping collection for physical relics.

