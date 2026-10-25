CafeFlow — Smart Restaurant & All-Day Bistro Management Platform

A production-grade, responsive restaurant & café web application built with **React 19 + TypeScript + Tailwind CSS**, **Express**, and **Gemini AI**.

---

🍽️ Feature Overview

### 1. Customer-Facing Features
- **Hero & Story**: High-fidelity bistro photography, chef's specials, active promotions strip, verified reviews, and Google Maps embed.
- **Interactive Digital Menu (`/menu`)**:
  - 8 Categories with sticky horizontal scrolling (Specialty Coffee, Tea, Cold-Pressed Juices, All-Day Brunch, Bistro Mains & Bowls, Bakery & Viennoiserie, Desserts, Seasonal).
  - Search, dietary filters (Vegetarian, Vegan, Gluten-Free), price range slider, and in-stock toggle.
  - Item detail modal with customizable modifiers (milk choice, serving temperature, bread type, egg add-ons), special cooking notes, and allergen warnings.
  - Sold-out dish states (greyed out and add button disabled).
- **Table QR Menu (`/qr`)**:
  - Live QR code generator for Tables 1–20 linking to `/?tab=menu&table=N`.
  - Automatic table attachment and top table alert banner.
  - Printable 80mm table stand tent card preview and PNG download.
- **Dual Checkout & Cart Drawer**:
  - Quantity controls, modifier breakdown, delivery fee calculations, and 5% GST tax breakdown.
  - **Option A (In-App Order)**: Saved directly to the app data layer with payment method choice (UPI / Card / Pay at Counter) and instant rerouting to live tracking.
  - **Option B (WhatsApp Checkout)**: Auto-formats a pre-filled `wa.me` message with itemized order details, table number/address, and total for direct messaging to the café manager.
  - **Loyalty points redemption slider**: Instantly apply points as currency discounts at checkout.
  - **Promo code validation**: Expiry checking and minimum order threshold enforcement (`BRUNCH20`, `FIRSTFLOW`, `HAPPYHOUR`).
- **Live Order Tracking (`/track`)**:
  - 5-stage visual progress stepper (`Received` → `Preparing` → `Ready` → `Served/Out for Delivery` → `Completed`).
  - Real-time updates when the kitchen advances status in the admin console.
  - Order timeline activity log with chef timestamps.
- **Table Reservations (`/reserve`)**:
  - Date picker, real-time time slot grid (with conflict prevention and capacity enforcement).
  - Seating area selection (Sunlit Terrace, Main Bistro, Window Nook, Brew Bar Counter).
  - Instant booking reference and downloadable `.ics` calendar file.
  - Self-service booking lookup and cancellation.
- **Smart Taste Sommelier Drawer (`/discover`)**:
  - Step-by-step quiz (Mood, Craving/Flavor, Dietary/Allergens, Caffeine, Budget).
  - Free-text AI craving box powered by `gemini-3.8-flash` with structured JSON responses.
  - Programmatic pre-filtering ensuring sold-out items are never recommended.
  - Deterministic client-side fallback scorer if offline or API is unavailable.
  - Match percentage (e.g. 96%), appetizing culinary explanation, suggested drink pairing, and one-tap "Add to Bag".
  - "Surprise Me" button and "Save Taste Profile".
- **Reviews & Ratings (`/reviews`)**:
  - Aggregate rating scoreboard and star distribution bars.
  - "Write a Review" modal with dish selector and star rating.
  - Verified diner badges and manager response threads.
- **Loyalty & Account (`/account`)**:
  - Phone OTP login (demo mode accepts any 4-digit code like `1234`).
  - Tier progress bar (Bronze → Silver → Gold) based on total spend.
  - Rewards catalog with 1-click redemption (Free Specialty Coffee, Artisan Croissant, Signature Dessert, ₹500 Dining Voucher).
  - Order and reservation history.

---

## 🔒 Secure Admin Operations (`/admin`)

- **Authentication**: Protected route with session tokens, 1-hour auto-logout, and rate limiting (lockout after 5 failed attempts).
- **Demo Credentials**:
  - **Username**: `admin`
  - **Password**: `admin123`
- **Modules**:
  1. **Overview**: Key performance indicators (Revenue, Active Orders, Pending Bookings, Rating) and interactive Recharts graphs (Hourly peak sales, Top-selling items, Channel split).
  2. **Orders Kanban Board**: Real-time 4-column drag/advance fulfillment workflow with 1-click status triggers and thermal printable Kitchen Order Ticket (KOT) view.
  3. **Menu Catalog CRUD**: Add, edit, delete dishes, customize pricing, calories, prep times, and toggle live availability. CSV export and import.
  4. **Reservations**: Calendar and list view, table allocation, confirm/cancel guest bookings.
  5. **Offers & Coupons**: Create discount codes (percentage or flat discount, minimum order value, validity dates).
  6. **Reviews Moderation**: Approve, hide, or post official management replies.
  7. **Customers & Loyalty**: View diner profiles, order counts, and adjust points manually (+/- points).
  8. **Inquiries**: Review corporate brunch and private event requests, reply directly via WhatsApp or email.
  9. **White-Label Settings**: Customize café name, tagline, WhatsApp phone number, tax percentage, delivery fee, tables count, and reset factory demo data.

---

## 🛠️ Architecture & Backend Swap Guide

All data logic is centralized in `src/services/dataService.ts` using a reactive observer pattern over `localStorage`:

```
┌─────────────────────────┐
│     React Components    │
└────────────┬────────────┘
             │ calls
┌────────────▼────────────┐
│   DataService Interface │ <── Interchangeable Layer
└────────────┬────────────┘
             │ currently writes to
┌────────────▼────────────┐
│  localStorage + Events  │ (Can be swapped with Firebase Firestore / Supabase)
└─────────────────────────┘
```

To switch to **Firebase Firestore** or **Supabase**:
1. Implement the same methods (`getMenuItems`, `createOrder`, `updateOrderStatus`, etc.) in a new `firebaseDataService.ts`.
2. Swap the export in `src/services/dataService.ts`.
3. Frontend components and custom hooks will continue functioning without any modifications.
