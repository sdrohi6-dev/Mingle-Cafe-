# CafeFlow — Smart Restaurant & All-Day Bistro Management Platform

A production-grade, responsive restaurant and café management web application built for modern all-day brunch spots, bistros, and cafés. Delivers an interactive QR-driven digital menu, table reservation engine, drawer-integrated Gemini-powered taste discovery, seamless WhatsApp checkout, real-time live order tracking, and a full-featured admin management suite.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following product configurations were confirmed in Phase 1 interactive clarification:

- **Confirmed Concept**: **Modern All-Day Brunch and Bistro** showcase (artisanal coffee, sourdough tartines, specialty eggs, bowls, fresh juices, and signature desserts).
- **Confirmed Currency & Locale**: **Indian Rupee (INR ₹)** with seamless Indian number formatting, GST calculation, and one-tap **WhatsApp pre-filled ordering** (`wa.me` deep link itemized breakdown).
- **Confirmed Discovery UX**: **Quick Visual Filter & AI Taste Drawer** embedded directly on the menu experience, featuring instant tag/dietary filtering plus Gemini free-text dish matching with fallback rule scoring.
- **Data Persistence**: Offline-first reactive `localStorage` repository behind an extensible `DataService` interface, ready for Firebase/Supabase interchange without UI refactoring.

---

## 1. Overview & Core Concept

- **What It Does**: CafeFlow provides a unified digital ecosystem for both café guests and restaurant operators. Guests can browse a responsive menu with allergen and dietary tags, place dine-in/takeaway/delivery orders with instant WhatsApp or in-app checkout, reserve tables with live conflict prevention, and run AI taste discovery. Managers have access to an authenticated, role-ready dashboard with live Kanban orders, menu editor, table manager, discount promotions, and sales analytics.
- **Target Audience / Persona**:
  - *Café Guests*: Mobile patrons wanting instant QR ordering at table, quick takeaway pickup, or easy weekend brunch table reservations.
  - *Café Staff & Managers*: Fast-paced kitchen and floor teams needing clear ticket printing, live order status workflows, and easy menu availability toggles (e.g. marking sold out in 1 click).
- **Key Value**: Eliminates physical paper menu friction, speeds up table turnarounds, automates WhatsApp orders with zero commission fees, and personalizes ordering through conversational AI taste exploration.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Dine-In Table Flow**: Patrons scan a table QR code (or visit `/menu?table=4`). The app displays an active table banner ("Seated at Table 4"). Items added to the cart inherit the table number automatically for kitchen routing.
2. **Interactive Taste Discovery Drawer**: Tap "Discover Taste" on the menu or hero. Guests select preferences (Mood, Time of Day, Hunger level, Flavor, Allergens) or type freely (e.g. *"light brunch bowl, high protein, dairy-free"*). The engine runs Gemini flash analysis against currently available items and presents Top 3 recommendations with match percentages, pairing suggestions, and 1-tap cart additions.
3. **Cart & Dual Checkout**: Slide-out cart drawer with customizable add-ons (oat milk, extra shot, dressing), coupon validation, and loyalty points redemption. Patrons choose between (a) In-App Order (Mock UPI / Card / Cash) with real-time status tracking, or (b) Direct WhatsApp Order (`wa.me`) with a formatted itemized bill.
4. **Table Reservation Flow**: Guests select party size, seating zone (Sunlit Terrace, Main Bistro, Window Nook), and live-checked time slots. Avoids double bookings against table inventory and generates an instant `.ics` calendar invite upon confirmation.
5. **Kitchen & Floor Operations**: Operators log in to `/admin` (hashed authentication, rate limiting, session token) to manage orders across a drag-and-drop Kanban board, toggle dish availability in real time, configure seasonal menus, and inspect peak-hour analytics.

### Visual Identity & Theme
- **Color Discipline (60-30-10)**:
  - *Neutral Canvas (60%)*: Cream warmth (`#FFFDF9` light / `#161311` dark), avoiding sterile white or generic cold grays.
  - *Structural Surfaces (30%)*: Soft warm stone card backgrounds (`#FFFFFF` with subtle `#EDE8E1` borders in light; `#221C18` in dark).
  - *High-Intent Accents (10%)*: Terracotta amber (`#D9532F` primary CTA), roasted espresso (`#2E1C12` deep text), and organic sage (`#5B8266` for vegan/vegetarian & available indicators).
- **Typography Pairing**:
  - *Display / Headlines*: `Playfair Display` serif for rich, appetizing bistro character.
  - *Body / Controls*: `Plus Jakarta Sans` for clean legibility, single-line buttons, and tight touch targets.
  - *Data / Numeric*: `font-mono tabular-nums` for prices, timestamps, invoice IDs, and table numbers.
- **Zero-Pill Restraint**: Metadata (calories, prep time, origin) is displayed with unboxed typographic separators (`·` or `/`). Interactive filters are functional button controls with crisp pill-free segmented states.
- **Responsive Navigation**: Top 3-zone bar on desktop (Brand Wordmark, 5 nav links, "Order Now" CTA); mobile-first bottom bar with touch targets $\ge 44\text{px}$ capped at $<15\%$ of screen height.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Dual Checkout (In-App Database vs. WhatsApp Link)**
  - *Chosen Approach*: Support both direct in-app order submission and pre-formatted WhatsApp deep linking.
  - *Why*: In many restaurant markets, direct WhatsApp communication between customers and café managers is the most trusted, frictionless workflow, while in-app checkout enables live kitchen tracking.
  - *Alternatives Considered*: WhatsApp-only (limits analytics and tracking) or App-only (alienates guests who prefer messaging).
- **Decision 2: Taste Discovery Architecture (Hybrid Gemini + Local Scorer)**
  - *Chosen Approach*: Server-side Gemini API route (`/api/discovery/recommend`) using `gemini-3.8-flash` with structured JSON output, paired with a deterministic client-side fallback scorer.
  - *Why*: Guarantees instant, zero-failure recommendations even if offline or if API quotas are reached, while providing intelligent natural-language reasoning when connected.
  - *Allergen Guarantee*: Strict programmatic pre-filtering eliminates sold-out and allergen-conflicting dishes before prompting or scoring.
- **Decision 3: Architectural Data Layer (`DataService`)**
  - *Chosen Approach*: Reactive observer pattern wrapping `localStorage` with cross-tab `StorageEvent` synchronization and pre-seeded realistic mock data (30+ menu items, 8 categories, active offers, sample reservations, and reviews).
  - *Why*: Allows zero-friction instant demo and local persistence without external database provisioning, while maintaining an identical signature to Firestore/Supabase client libraries.

---

## 4. Technical Architecture & Data Strategy

### System & Component Hierarchy

```
┌────────────────────────────────────────────────────────────────────────┐
│                              CafeFlow App                              │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
          ┌─────────────────────────┴────────────────────────┐
          ▼                                                  ▼
┌───────────────────────────┐                      ┌─────────────────────┐
│   Customer Router (/)     │                      │ Admin Portal (/admin)│
│  - Home View              │                      │  - Secure Gate      │
│  - Digital Menu (/menu)   │                      │  - Live Kanban Board│
│  - QR Table Gen (/qr)     │                      │  - Menu Editor CRUD │
│  - Order Tracker (/track) │                      │  - Table Bookings   │
│  - Reservations (/reserve)│                      │  - Coupons & Offers │
│  - Taste Drawer (Modal)   │                      │  - Inquiries Inbox  │
│  - Slide-in Cart Drawer   │                      │  - Store Settings   │
└─────────────┬─────────────┘                      └──────────┬──────────┘
              │                                               │
              ▼                                               ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      State & Context Providers                         │
│  - SettingsContext (Branding, Currency, Tax, Hours, WhatsApp Number)   │
│  - CartContext (Items, Modifiers, Coupons, Order Type, Table Number)   │
│  - CustomerAuthContext (Phone OTP, Profile, Loyalty Points & Tiers)    │
│  - AdminAuthContext (Hashed Token, Session Timer, Rate Limiting)       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
          ┌─────────────────────────┴────────────────────────┐
          ▼                                                  ▼
┌───────────────────────────┐                      ┌─────────────────────┐
│  DataService Repository   │                      │  Express API Proxy  │
│  - Menu & Categories      │                      │  - /api/discovery   │
│  - Orders & Tracking      │                      │    (Gemini AI)      │
│  - Table Reservations     │                      │  - /api/health      │
│  - Offers, Reviews, Inbox │                      │                     │
│  (LocalStorage + Events)  │                      │                     │
└───────────────────────────┘                      └─────────────────────┘
```

### Core Entities & Data Model
- `MenuItem`: ID, title, categoryId, description, price, imageUrl, dietaryFlags (`veg`, `vegan`, `glutenFree`, `nutFree`, `spicy`), calories, prepTimeMinutes, rating, isAvailable, isSeasonal, modifiers (sizes, milk options, add-ons).
- `Category`: ID, name, slug, sortOrder, iconName.
- `Order`: ID, orderNumber, customerName, customerPhone, orderType (`dineIn`, `takeaway`, `delivery`), tableNumber, deliveryAddress, items, subtotal, discount, tax, total, status (`received`, `preparing`, `ready`, `served_out`, `completed`, `cancelled`), paymentMethod (`upi`, `card`, `cash`), createdAt, timeline.
- `Reservation`: ID, customerName, phone, email, date, timeSlot, partySize, seatingArea, occasion, specialNotes, status (`pending`, `confirmed`, `completed`, `cancelled`), tableId.
- `Offer`: Code, title, description, discountType (`percentage`, `flat`), discountValue, minOrderValue, maxDiscount, expiresAt, isActive.
- `Review`: ID, customerName, rating, comment, menuItemId, dishName, verifiedOrder, createdAt, status, reply.
- `Customer`: Phone, name, email, loyaltyPoints, tier (`Bronze`, `Silver`, `Gold`), favorites, ordersCount.
- `CafeSettings`: Name, tagline, address, phone, whatsappNumber, currencySymbol (`₹`), taxPercentage, deliveryFee, totalTables, openingHours, brandingColors.

### Interactive State Transitions
- **Menu Filter & Discovery**: Dynamic search bar, category horizontal scroll, and multi-tag filtering with zero layout jump; discovery drawer opens with step cards or free-text prompt.
- **Cart Calculations**: Subtotal, percentage coupon discount deduction, 5% GST tax computation, optional loyalty points redemption slider, and delivery fee calculation.
- **Admin Kanban Status Drag/Click**: Moving an order from "Received" to "Preparing" or "Ready" updates the status timestamp and notifies the customer-facing order tracking view across browser tabs.

---

## 5. Implementation Sequence & Verification Plan

1. **Brand & Asset Preparation**: Set up metadata, PWA manifest, font imports, Tailwind styling tokens, and domain images via parallel generation.
2. **Data Layer & Seed Store**: Construct `DataService` with full TypeScript interfaces and seed 30+ items across Coffee, Juices, Breakfast, Mains, Bakery, Desserts, and Seasonal specials.
3. **Core App Shell & Navigation**: Header with desktop 3-zone contract, sticky mobile bottom bar, Cart Drawer, and Theme Toggle.
4. **Customer Experience**:
   - Home page with hero, specials, and location map.
   - Digital Menu with table query parameter detection (`/menu?table=N`), category tabs, allergen filters, and item modifier modal.
   - Smart Discovery drawer with Gemini AI free-text analysis and rule-based fallback.
   - Table Reservation form with real slot availability check and `.ics` download.
   - Order Tracking page with real-time progress stepper.
   - QR Code Generator (`/qr`) with printable table sheets.
5. **Admin Management Suite (`/admin`)**:
   - Secure login gate with rate limiting and session management.
   - Dashboard KPIs and interactive charts.
   - Kanban & list order fulfillment with kitchen ticket print preview.
   - Menu item & category CRUD with live availability toggle.
   - Reservation manager, discount coupons, customer loyalty, and café settings.
6. **Testing & Verification**: TypeScript compile check (`compile_applet`), responsive viewport audit, accessibility check, and flow testing.
