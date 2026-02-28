# PWA POS System

An offline-first Progressive Web App (PWA) Point of Sale (POS) system designed for small local shops.

## Features

- **100% Offline Capable**: Works entirely offline using IndexedDB via Dexie.js.
- **PWA Ready**: Installable on Desktop, iOS, and Android.
- **Product Management**: Full CRUD, categories, barcodes, and stock tracking.
- **POS Screen**: Search products by name/barcode, fast checkout, cash payment change calculator.
- **Receipts**: Pre-configured thermal printer layout (80mm) ready to print via `window.print()`.
- **Reports**: Track your overall sales metrics and view past receipts.
- **Settings & Utils**: Dark mode, Multi-language (English and Tamil), Database Export (JSON) and Import.

## Tech Stack

- **React 18** and **TypeScript** (Vite template).
- **Tailwind CSS** for responsive, mobile-first styling.
- **Zustand** for global Cart and UI state management.
- **Dexie.js** and `dexie-react-hooks` for effortless reactive IndexedDB queries.
- **react-i18next** for Internationalization.
- **Lucide React** for icons.
- **vite-plugin-pwa** for service workers and application manifest generation.

## Local Development & Setup

Make sure you have [Node.js](https://nodejs.org) installed on your system.

### 1. Install dependencies

```bash
npm install
```

### 2. Run the Development Server

```bash
npm run dev
```
Access the app usually at `http://localhost:5173`.

### 3. Build for Production

```bash
npm run build
```
This generates optimized, minified files in the `dist` folder. The command guarantees no TypeScript errors are present.

### 4. Preview the Production Build

```bash
npm run preview
```
This runs a local server observing the compiled outputs in `dist`. This is required to truly preview the service worker logic and PWA offline behaviors natively without deploying.

## Running Offline

When deploying or previewing the production build (`npm run preview`), the browser automatically caches assets via service workers. Once cached, simply turn off your network adapter, and the site will still load instantly and function fully.

## Backup and Export

Since the application uses IndexedDB, data is localized strictly to the specific browser of the device. If the cache is cleared aggressively, data may be lost.
To keep data safe:
1. Go to **Settings**.
2. Click **Backup Database (Export)** to download a JSON snapshot of all products, categories, sales, customers, and settings.
3. Keep this file safe. Use **Restore Database (Import)** to reload data anytime.
