# Ankara showcase

A luxury-style storefront for an Ankara clothing brand: a full-screen hero that changes cloth as you scroll, an order flow that saves to MongoDB, seven more content sections, and an admin panel to manage it all.

Built with Next.js 14 (App Router), React, Tailwind CSS, Framer Motion, MongoDB (Mongoose) and Lucide icons.

## Quick start

You need Node.js 18.17 or newer. MongoDB is optional to start with.

```bash
npm install
cp .env.local.example .env.local   # then edit it (see below)
npm run dev
```

- Site: http://localhost:3000
- Admin: http://localhost:3000/admin

The first run downloads two Google fonts, so you need an internet connection.

## Environment variables

Set these in `.env.local`:

| Variable | What it does |
| --- | --- |
| `MONGODB_URI` | Your MongoDB connection string. Needed to save orders, edits and uploaded images. |
| `ADMIN_PASSWORD` | The password for `/admin`. Use a long one. |
| `ADMIN_SECRET` | A long random string used to sign the admin login cookie. |

Examples for `MONGODB_URI`:

```
# Local MongoDB
MONGODB_URI=mongodb://127.0.0.1:27017/ankara-showcase

# MongoDB Atlas (also allow your IP under Network Access)
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/ankara-showcase?retryWrites=true&w=majority
```

Restart `npm run dev` after changing `.env.local`.

### Running without a database

With `MONGODB_URI` empty the site still works in demo mode:

- The site shows the four built-in colourways.
- Orders are confirmed on screen but not saved.
- The admin opens, but saving and image uploads are switched off, with a banner explaining why.

On the first visit with a database connected, the four starter colourways are saved to it automatically.

## The admin panel

Open `/admin` and sign in with `ADMIN_PASSWORD`. The login lasts 7 days.

**Colourways tab**
- Add, duplicate, reorder and delete colourways (up to 12, at least 1).
- Edit the name, tagline and price, and turn "In stock" off to show "Sold out".
- Upload an image. It is resized to 1600px and compressed to WebP in your browser, then stored in MongoDB. Limit: 4 MB. PNG or WebP with a transparent background looks best.
- Set the background behind the image: four colour pickers, eight presets, or "Auto from image".
- Choose the shape behind the garment (none, circle, arch, square) with its colour and opacity.
- Until you upload an image, a generated Ankara pattern is used. You can change its pattern and four colours.

**Hero & site tab**
- Turn "Scroll to change cloth" on or off, and set the scroll distance per cloth.
- Edit the headline, description, brand name, contact email and product name.

**Orders tab**
- See every order with customer details, and set its status: pending, confirmed, shipped or cancelled.

A bar appears at the bottom when you have unsaved changes. Changes go live on the next page load of the site.

## How scroll-to-change works

- On large screens (1024px wide and 720px tall or more) the hero stays pinned and scrolling steps through the colourways, then the page carries on.
- On phones and tablets there is no pinning. Visitors swipe the garment left or right instead.
- If you turn the setting off, visitors use the thumbnails or the "Show next colourway" button.

## Project structure

```
app/
  page.jsx                  loads products and settings, renders the site
  layout.jsx                fonts and metadata
  admin/                    admin pages (dashboard and login)
  api/
    products/               public product list
    orders/                 saves customer orders
    media/[id]/             serves uploaded images
    admin/                  login, product, settings, upload, orders (all protected)
components/
  Showcase.jsx              hero, scroll logic, purchase panel
  Sections.jsx              ticker, collection, story, size guide, steps, FAQ, footer
  Nav.jsx, CheckoutModal.jsx, ProductArt.jsx, Backdrop.jsx, VariantPreview.jsx
  admin/                    admin screens and form controls
models/                     Product, Order, Setting, Media (Mongoose)
lib/                        database, auth, validation, theme helpers, default content
middleware.js               protects /admin and /api/admin
```

## Things to replace

- **Size chart:** the numbers in `components/Sections.jsx` are samples. Put in your own.
- **Copy:** the story, steps and FAQ text in `components/Sections.jsx` is placeholder wording. Edit it to match how you really work (payment, delivery, changes).
- **Brand name and email:** `Ankara House` and `hello@ankarahouse.example` are defaults. Change them in the admin, or in `lib/defaultSettings.js`.
- **Newsletter box:** the footer form is not connected to anything. Wire it to your email provider in `components/Sections.jsx`.
- **Nav links:** they scroll to sections on the page. If you add separate pages, switch them to Next.js `<Link>`.
- **Currency:** prices are in naira (₦), set in `lib/format.js` and the product data.

## Deploying

Any host that runs Next.js works (for example Vercel).

1. Push the project to a Git repository and import it on your host.
2. Add `MONGODB_URI`, `ADMIN_PASSWORD` and `ADMIN_SECRET` as environment variables.
3. In MongoDB Atlas, allow your host's IP addresses (or `0.0.0.0/0` while testing).
4. Deploy, then sign in at `/admin` on your live domain.

Uploaded images live in MongoDB, so you don't need file storage on the host.

## Security notes

- The admin is protected by one shared password and a signed, HTTP-only cookie. Login attempts are limited, but the limit is kept in memory, so on serverless hosts it resets between instances.
- Order prices are looked up on the server, so a customer can't change the price in their browser.
- Never commit `.env.local`. It is already in `.gitignore`.
- Orders are saved but payment is not taken online. You confirm and collect payment with the customer after the order comes in.

## Troubleshooting

| Problem | Fix |
| --- | --- |
| Admin says "MongoDB is not connected" | Set `MONGODB_URI` in `.env.local` and restart. For Atlas, check the IP allowlist and password. |
| Sign-in says admin is not set up | Add `ADMIN_PASSWORD` to `.env.local` and restart. |
| "That image is over 4 MB" | Use a smaller image. Most are shrunk automatically, but very large originals can still fail. |
| Fonts fail on first run | Check your internet connection. The fonts come from Google Fonts. |
| Scroll-to-change doesn't happen | It only runs on large screens and needs the setting on and at least two colourways. |
| Changes in the admin don't show | Reload the site. If you see the old content, check that the save bar said "Saved". |

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm run start` | Run the production build |
