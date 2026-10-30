# BlaBlaBikes - Nashik Motorcycle Ridesharing

BlaBlaBikes is a city-only motorcycle ride-sharing and legal peer-to-peer fuel cost-sharing web application designed for commuters in Nashik, Maharashtra, India.

> **Legal Cost-Sharing Principle**: BlaBlaBikes connects two-wheeler owners traveling on existing daily routes to share empty pillion seats. It is strictly non-commercial peer-to-peer fuel cost-sharing in compliance with Section 66 of the Motor Vehicles Act, 1988 — never a taxi, cab, or commercial passenger transport service.

---

## Phase 3 Documentation: Core Ride Flows & Leaflet Maps

### 1. Environment Variables
Configure these in your `.env.local` file:
```env
# Map Tiles & Attribution (OpenStreetMap default)
NEXT_PUBLIC_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
NEXT_PUBLIC_TILE_ATTRIBUTION='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

# Hotlines & Local Safety
NEXT_PUBLIC_EMERGENCY_NUMBER_POLICE=112
NEXT_PUBLIC_EMERGENCY_NUMBER_WOMEN=1091
```

### 2. Third-Party Upstream Usage Limits
- **OpenStreetMap Standard Tiles**: Public tiles are provided by OSM volunteer servers for development and light traffic only. Switch to a commercial provider (e.g., Mapbox, Stadia, Protomaps) or self-hosted tile server before launching heavy production traffic.
- **Photon Geocoding (`photon.komoot.io`)**: Used as a fallback after curated Nashik landmarks. Debounced to 300 ms client-side, cached for 10 minutes, and rate-limited to 30 requests/minute per IP. If Photon times out (3 s timeout), the server returns curated results only without failing the user experience.
- **OSRM Public Demo Server (`router.project-osrm.org`)**: Used for driving route distance and duration estimates. Cached for 10 minutes with a 3-second timeout and 30 req/min rate limit. When unreachable, the system automatically falls back to Haversine distance × 1.3 (city road winding factor) with `approximate: true`. Plan a dedicated OSRM or Valhalla routing instance for production scale.

### 3. Leaflet Architecture in Next.js 15
- **Client-Side Only**: Leaflet directly accesses `window` and `navigator`. All map components (`<RouteMap />` and `<PlacePickerMap />`) are wrapped with `next/dynamic` (`{ ssr: false }`) and render accessible skeleton placeholders during server rendering and initial hydration.
- **Marker Icon Fix**: Default Leaflet marker images frequently break with modern bundlers. BlaBlaBikes implements custom SVG `L.divIcon` markers with high-contrast color pins:
  - **Blue Pin (A)**: Pickup / Origin point
  - **Emerald Pin (B)**: Drop / Destination point
  - **Amber Pin**: Draggable place picker marker
- **Mobile Scroll Wheel Protection**: Scroll-wheel zoom is disabled by default on mobile screens so that scrolling through the page is never hijacked. Zoom is enabled only after an explicit click on the map.

### 4. Troubleshooting Guide
- **Blank Grey Tiles**:
  - Ensure `leaflet/dist/leaflet.css` is imported in the client component.
  - Verify container has an explicit CSS height (e.g., `height: 320px`).
  - When rendering inside tabs, drawers, or dialogs, Leaflet needs `map.invalidateSize()` after mount or visibility change. Both `<RouteMap />` and `<PlacePickerMap />` invoke this automatically.
- **Broken Marker Images**:
  - Do not use `L.Icon.Default.imagePath`. The project uses `createOriginIcon()` and `createDestinationIcon()` with inline SVGs, ensuring 100% reliable rendering across all environments.
- **Rate Limit Exceeded (HTTP 429)**:
  - Upstream place search and route distance endpoints are throttled to 30 req/minute per IP. In local development, an automatic in-memory sliding window rate limiter protects endpoints even without an active Redis instance.

---

## Running the Application

```bash
# 1. Install dependencies
npm install

# 2. Run database migrations
npm run db:migrate

# 3. Seed demo accounts and 30 Nashik sample rides
npm run db:seed

# 4. Start local development server
npm run dev

# 5. Run test suite
npm run test

# 6. Check i18n translation parity across en/hi/mr
npm run check-i18n
```

