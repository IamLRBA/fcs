# PostgreSQL Architecture & Migration Plan

## MysticalPIECES — Production Database Design

This document defines the PostgreSQL schema, ORM configuration, migration strategy, backend architecture, and security model.

### Current implementation (local + app)

- **ORM**: Prisma; schema file `prisma/schema.prisma`.
- **Product catalog**: Stored in PostgreSQL; read/write via `app/api/products` routes; admin and storefront consume these APIs.
- **Local database**: Optional `docker-compose.yml` (Postgres on host port **5433**). First-time flow is documented in the repo **README** under *First-time setup (database)* — configure `.env` from `.env.example` (no secrets in git), then `npm run db:up`, `npx prisma db push`, optionally `npm run import:products`.
- **Seeding from JSON**: `scripts/import-products-from-json.js` (`npm run import:products`) upserts by SKU from `data/products.json`.

---

## 1. PostgreSQL Schema Design

### 1.1 Entity Overview

| Entity | Purpose |
|--------|--------|
| **User** | Customer accounts (login, profile, orders, reviews). |
| **AdminUser** | Admin accounts; separate from customers, no hardcoded credentials. |
| **Category** | Category metadata (slug, title, description) for shop structure. |
| **Product** | Catalog items with sizes, colors, stock, category/section. |
| **ProductImage** | Multiple images per product with ordering. |
| **Order** | Customer orders with delivery and denormalized customer/address. |
| **OrderItem** | Line items with product snapshot and quantity. |
| **Review** | Customer reviews; can be product-specific or general testimonials. |
| **ProductRemoval** | Audit log for “product bought” / “mistakenly posted” (replaces localStorage bought list). |

### 1.2 Table Specifications

#### User (customers)

| Column | Type | Constraints | Notes |
|--------|------|-------------|--------|
| id | String (cuid) | PK | |
| email | String | UNIQUE, NOT NULL | Lowercased. |
| fullName | String | NOT NULL | |
| phone | String | NOT NULL | |
| passwordHash | String | NOT NULL | Bcrypt/argon2. |
| profileImageUrl | String? | | Optional. |
| isActive | Boolean | DEFAULT true | Admin can deactivate. |
| lastViewedProductIds | String[] | | Array of product IDs (e.g. last 20). |
| createdAt | DateTime | NOT NULL | |
| updatedAt | DateTime | NOT NULL | |

**Indexes:** `email` (unique), `isActive`, `createdAt`.

---

#### AdminUser

| Column | Type | Constraints | Notes |
|--------|------|-------------|--------|
| id | String (cuid) | PK | |
| username | String | UNIQUE, NOT NULL | |
| passwordHash | String | NOT NULL | Bcrypt/argon2. |
| createdAt | DateTime | NOT NULL | |
| updatedAt | DateTime | NOT NULL | |

**Indexes:** `username` (unique). No credentials in code.

---

#### Category

| Column | Type | Constraints | Notes |
|--------|------|-------------|--------|
| id | String (cuid) | PK | |
| slug | String | UNIQUE, NOT NULL | e.g. shirts, tees, coats. |
| title | String | NOT NULL | Display name. |
| description | String? | | Category blurb. |
| createdAt | DateTime | NOT NULL | |
| updatedAt | DateTime | NOT NULL | |

**Indexes:** `slug` (unique). Used for nav and product grouping.

---

#### Product

| Column | Type | Constraints | Notes |
|--------|------|-------------|--------|
| id | String (cuid) | PK | |
| name | String | NOT NULL | |
| brand | String | NOT NULL | |
| category | String | NOT NULL | Matches Category.slug. |
| section | String | NOT NULL | Subcategory (e.g. gentle, checked). |
| description | String | NOT NULL | |
| condition | String | NOT NULL | e.g. Like New, Good. |
| sku | String | UNIQUE, NOT NULL | |
| priceUgx | Int | NOT NULL | Current price. |
| originalPriceUgx | Int? | | Optional compare-at price. |
| stockQty | Int | NOT NULL, DEFAULT 0 | Stock; decrement on order. |
| sizes | String[] | NOT NULL | e.g. ["S","M","L"]. |
| colors | String[] | NOT NULL | e.g. ["White","Black"]. |
| isActive | Boolean | DEFAULT true | Hide from storefront if false. |
| createdAt | DateTime | NOT NULL | |
| updatedAt | DateTime | NOT NULL | |

**Indexes:** `sku` (unique), `category`, `section`, `isActive`, composite `(category, section)` for listing.

---

#### ProductImage

| Column | Type | Constraints | Notes |
|--------|------|-------------|--------|
| id | String (cuid) | PK | |
| productId | String | FK → Product, NOT NULL | |
| url | String | NOT NULL | Path or full URL. |
| sortOrder | Int | NOT NULL, DEFAULT 0 | Display order. |
| createdAt | DateTime | NOT NULL | |

**Indexes:** `productId`. Relation: Product 1 ──* ProductImage.

---

#### Order

| Column | Type | Constraints | Notes |
|--------|------|-------------|--------|
| id | String (cuid) | PK | |
| userId | String? | FK → User | Null = guest. |
| status | Enum | NOT NULL | pending, confirmed, dispatched, delivered. |
| deliveryOption | Enum | NOT NULL | kampala, outside. |
| subtotalUgx | Int | NOT NULL | |
| deliveryFeeUgx | Int | NOT NULL | |
| totalUgx | Int | NOT NULL | |
| notes | String? | | |
| customerFullName | String | NOT NULL | Snapshot. |
| customerEmail | String | NOT NULL | Snapshot. |
| customerPhone | String | NOT NULL | Snapshot. |
| addressStreet | String | NOT NULL | |
| addressCity | String | NOT NULL | |
| createdAt | DateTime | NOT NULL | |
| updatedAt | DateTime | NOT NULL | |

**Indexes:** `userId`, `status`, `createdAt` (desc for history).

---

#### OrderItem

| Column | Type | Constraints | Notes |
|--------|------|-------------|--------|
| id | String (cuid) | PK | |
| orderId | String | FK → Order, NOT NULL | |
| productId | String? | FK → Product | Null if product deleted. |
| productName | String | NOT NULL | Snapshot. |
| sku | String | NOT NULL | Snapshot. |
| size | String? | | Selected size. |
| color | String? | | Selected color. |
| quantity | Int | NOT NULL | |
| priceUgx | Int | NOT NULL | Price at order time. |
| imageUrl | String? | | Primary image at order time. |
| createdAt | DateTime | NOT NULL | |

**Indexes:** `orderId`. Relation: Order 1 ──* OrderItem.

---

#### Review

| Column | Type | Constraints | Notes |
|--------|------|-------------|--------|
| id | String (cuid) | PK | |
| userId | String | FK → User, NOT NULL | |
| productId | String? | FK → Product | Null = general testimonial. |
| productName | String? | | Denormalized. |
| text | String | NOT NULL | |
| rating | Int | NOT NULL | 1–5. |
| createdAt | DateTime | NOT NULL | |
| updatedAt | DateTime | NOT NULL | |

**Indexes:** `userId`, `productId`, `createdAt`. Used for testimonials and product reviews.

---

#### ProductRemoval (audit)

| Column | Type | Constraints | Notes |
|--------|------|-------------|--------|
| id | String (cuid) | PK | |
| productId | String? | FK → Product | Null if product already deleted. |
| productSnapshot | Json? | | Name, sku, etc. for history. |
| reason | Enum | NOT NULL | PRODUCT_BOUGHT, MISTAKENLY_POSTED. |
| removedAt | DateTime | NOT NULL | |

**Indexes:** `removedAt`, `reason`. Replaces `mysticalpieces_bought_products` in localStorage.

---

### 1.3 Relationships (ER Summary)

- **User** 1 ──* **Order** (optional: guest orders have `userId = null`).
- **User** 1 ──* **Review**.
- **AdminUser** — standalone; no FKs from other tables.
- **Category** — referenced by Product.category (logical; can add FK later).
- **Product** 1 ──* **ProductImage**.
- **Product** 1 ──* **OrderItem** (optional FK).
- **Product** 1 ──* **Review** (optional).
- **Order** 1 ──* **OrderItem**.
- **ProductRemoval** ──? **Product** (optional).

---

## 2. ORM Choice and Configuration

### 2.1 Recommendation: **Prisma**

| Criterion | Prisma | Drizzle |
|----------|--------|--------|
| Schema format | Declarative, single file | TypeScript schema (more code) |
| Migrations | Built-in, robust | Supported |
| TypeScript | Full type generation from schema | Good |
| Next.js usage | Well documented (serverless, edge) | Good |
| Learning curve | Low | Slightly higher (SQL-like) |
| Ecosystem | Mature, Prisma Studio | Lighter |

**Choice: Prisma** for this project because:

1. Single `schema.prisma` gives a clear, readable schema and matches the design above.
2. Migrations and `prisma generate` keep DB and app types in sync with minimal boilerplate.
3. Next.js + Prisma patterns (singleton client, server components, API routes) are well established.
4. No need for raw SQL or maximum performance tuning at this stage; Prisma’s DX and safety are more valuable.

### 2.2 Required Packages

```bash
npm install prisma @prisma/client
npm install -D prisma
```

- **prisma**: CLI (migrate, generate, studio).
- **@prisma/client**: Generated client used at runtime.

**First-time setup:**

```bash
# 1. Install
npm install prisma @prisma/client

# 2. Ensure .env has DATABASE_URL (see .env.example)
# 3. Create initial migration and tables
npx prisma migrate dev --name init

# 4. Generate client (also runs after migrate)
npx prisma generate

# 5. Optional: open Prisma Studio
npx prisma studio
```

### 2.3 Configuration Files

- **prisma/schema.prisma** — Data model, datasource, generator (see below).
- **.env** / **.env.example** — `DATABASE_URL` (and optional `DIRECT_URL` for migrations).

### 2.4 Database Connection

- **Datasource**: `postgresql` with `url = env("DATABASE_URL")`.
- **Direct URL**: For connection pooling (e.g. Vercel), uncomment `directUrl` in `prisma/schema.prisma` and set `DIRECT_URL`; otherwise omit.
- **Client**: Single `PrismaClient` instance in `lib/db.ts` with `globalThis` caching in development to avoid exhausting connections in Next.js hot reload:

```ts
// lib/db.ts (create when implementing)
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### 2.5 Environment Variables (Database & Auth)

See **.env.example** in project root. Summary:

- **Database:** `DATABASE_URL`, optionally `DIRECT_URL`.
- **Auth/sessions:** e.g. `NEXTAUTH_SECRET`, `NEXTAUTH_URL` (if using NextAuth); or `SESSION_SECRET` for custom sessions.
- **Existing:** Keep `SENDGRID_*`, `SMTP_*`, `TWILIO_*`, `WHATSAPP_*`, `GREEN_API_*`, `FROM_EMAIL`, `FROM_NAME` as already used.

---

## 3. Database Schema Code (Prisma)

The full schema is in **prisma/schema.prisma** (see repository). It includes:

- Generator `client` with `provider = "prisma-client-js"`.
- Datasource `db` with `provider = "postgresql"`, `url`, and optional `directUrl`.
- Models: **User**, **AdminUser**, **Category**, **Product**, **ProductImage**, **Order**, **OrderItem**, **Review**, **ProductRemoval**.
- Enums: **OrderStatus**, **DeliveryOption**, **RemovalReason**.
- All relations, `@id`, `@unique`, `@index`, and `@@index` as per design above.

---

## 4. Migration Plan (Current Data → PostgreSQL)

### 4.1 Prerequisites

1. PostgreSQL instance (local or cloud).
2. Prisma installed; `DATABASE_URL` set.
3. Run `npx prisma migrate dev` to create tables (and optionally seed categories).

### 4.2 Step 1: Seed Categories

- From **data/products.json**, extract top-level keys under `products`: `shirts`, `tees`, `coats`, `pants-and-shorts`, `footwear`, `accessories`.
- For each: `slug` = key, `title` = value.title, `description` = value.description.
- Insert via seed script (`prisma/seed.ts`) or one-off script. No dependency on existing DB data.

### 4.3 Step 2: Migrate Products (data/products.json)

- Parse `data/products.json`.
- For each category → subcategories → product array:
  - Create **Product** row: map `id` → optional external id or generate new cuid; name, brand, category, section, description, condition, sku, price_ugx, original_price, stock_qty, sizes, colors, isActive = true.
  - For each entry in `images[]`, create **ProductImage** with `productId`, `url`, `sortOrder`.
- Run in a transaction. If keeping legacy string IDs for a transition period, add a temporary `legacyId` column and backfill; otherwise use new Prisma ids everywhere.

### 4.4 Step 3: Migrate Admin User

- Create one **AdminUser** with hashed password (bcrypt/argon2).
- Store username and hash in DB; **remove** hardcoded admin credentials from `lib/auth.ts` and any config.

### 4.5 Step 4: Migrate Users (localStorage mysticalpieces_users)

- **Challenge:** Data is in users’ browsers. Options:
  - **A) No bulk migration:** Rely on new signups and “forgot password” / re-registration. Existing localStorage users re-register or use a one-time “import my account” flow that reads from a file they export (if you add export).
  - **B) One-time import tool:** Build an admin-only page that accepts a JSON upload of exported `mysticalpieces_users`, hashes passwords, and creates User rows. Users must export from a dev/build that still has the old logic.
- Recommend **B** for a single migration window; then remove export and import.

### 4.6 Step 5: Migrate Orders (localStorage mysticalpieces_orders)

- Same as users: data is per-browser. Options:
  - **A)** Do not migrate; keep old orders in localStorage until cleared (or show “Order history before [date] is not available”).
  - **B)** Admin import: accept JSON of orders, create Order + OrderItems; optionally attach to User by email match (userId).
- New orders from go-live use DB only.

### 4.7 Step 6: Migrate Reviews (localStorage mysticalpieces_reviews)

- If you have a way to export global reviews (e.g. admin export), run a script that:
  - Matches `author` to User by fullName/email (or creates anonymous user if needed).
  - Creates **Review** with productId/productName if present, else null (testimonial).
- Otherwise treat as loss or manual re-entry; new reviews go to DB.

### 4.8 Step 7: Migrate Product Additions / Bought List (localStorage)

- **mysticalpieces_products:** Admin-added products live in localStorage. Options:
  - Export from admin (if you add export), then run script to insert Product + ProductImages.
  - Or treat as one-time: re-add critical products via admin UI after cutover.
- **mysticalpieces_bought_products:** Import into **ProductRemoval** with productSnapshot and reason.

### 4.9 Step 8: Cart

- Cart stays **client-only** (session/localStorage) until you optionally add “saved cart” per user in DB. No migration of cart contents; users keep current cart until they checkout or clear.

### 4.10 Order of Execution (Summary)

1. Apply Prisma migrations; create tables.
2. Seed categories from JSON.
3. Migrate products + product images from JSON.
4. Create initial AdminUser; remove hardcoded admin creds.
5. (Optional) Build and run user/order/review import tools; run once.
6. (Optional) Import bought products into ProductRemoval.
7. Switch app to use DB for products, users, orders, reviews, admin; keep cart client-side unless you add saved carts.

---

## 5. Backend Architecture (Next.js ↔ Database)

### 5.1 Where Queries Live

- **lib/db.ts** — Single Prisma client instance (singleton in dev).
- **lib/repositories/** or **lib/services/** — Optional layer: e.g. `productService.ts`, `orderService.ts`, `userService.ts`, `reviewService.ts` that wrap Prisma calls and encapsulate rules (e.g. stock decrement on order).
- **API routes** and/or **Server Actions** call these services/repositories (or Prisma directly for simple CRUD).

### 5.2 API Routes vs Server Actions

| Use case | Prefer | Reason |
|----------|--------|--------|
| Form submissions (login, signup, checkout) | Server Actions | Less boilerplate, progressive enhancement, same origin. |
| Fetching data for RSC (product list, order history) | Server Components + direct Prisma/service | No extra endpoint; good caching. |
| Client-side fetch (cart sync, live search) | API routes | Clear REST semantics; callable from client. |
| Auth (session, login) | NextAuth or Server Actions | NextAuth uses routes; custom auth can use actions. |

**Recommendation:**

- **Server Actions** for: auth (login/signup/logout), checkout (create order, validate stock), admin product CRUD, admin user management, review submission. Keeps mutations next to the UI and avoids exposing unnecessary REST surface.
- **API routes** for: optional REST endpoints if you need them (e.g. `/api/products`, `/api/orders` for external or mobile), or for webhooks (e.g. payments later).
- **Server Components** for: product listing, category pages, order history (when logged in), public review/testimonial display. Read from `lib/db` or a service in the component (or a small data layer).

### 5.3 Suggested Structure

```
lib/
  db.ts              # Prisma client singleton
  auth/
    config.ts        # NextAuth or session config
    [...nextauth]/route.ts  # If NextAuth
  services/          # Optional
    product.ts       # getProductsByCategory, getProductBySku, create, update, delete
    order.ts         # createOrder, getOrdersByUser, getOrderById, updateStatus
    user.ts          # findByEmail, create, update, updateLastViewed
    review.ts        # create, getByProduct, getTestimonials
    admin.ts         # adminLogin, adminSession
  repositories/      # Optional (if you want a clear data layer)
    ...
app/
  api/               # Keep send-email, send-whatsapp; add only if needed
    send-email/route.ts
    send-whatsapp/route.ts
    products/       # Optional: GET /api/products?category=...
    orders/         # Optional: GET/POST for external clients
  (pages use Server Components or Client + Server Actions)
```

Database access only from server (API routes, Server Actions, Server Components). Never expose Prisma client to the client bundle.

---

## 6. Security Improvements

### 6.1 Password Storage

- **Never** store plain-text passwords.
- Use **bcrypt** (e.g. `bcryptjs`) or **argon2** for hashing on signup and when setting admin password.
- Compare hash on login with `compare()`; never compare plain text.

### 6.2 Sessions

- **Option A — NextAuth.js:** Use Credentials provider for customers and a custom provider or second Credentials provider for admin; store session in JWT or DB (e.g. Prisma adapter). Secure cookie, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`.
- **Option B — Custom:** Encrypt session payload (userId, role) with `SESSION_SECRET`; store in HTTP-only cookie; validate on server on each request. Prefer HTTP-only, Secure, SameSite.

### 6.3 Admin Authentication

- Admin users in **AdminUser** table with hashed passwords.
- Admin login: validate username/password against DB; create admin session (separate cookie or session claim, e.g. `role: 'admin'`).
- Protect admin routes: middleware or layout that checks admin session and redirects to `/admin/login` if not authenticated.
- **Remove** all hardcoded admin credentials from code and config.

### 6.4 Customer Authentication

- Customers in **User** table; signup/login via Server Action or NextAuth Credentials.
- Enforce `isActive` on login; inactive users cannot log in.
- Optional: rate limiting on login/signup (e.g. Upstash or in-memory).

### 6.5 Data Access

- Orders: users see only their own (filter by `userId` or session); admins see all.
- Products: public read for active products; create/update/delete only for admins.
- Reviews: users create only for themselves; admins can moderate (e.g. soft delete or hide flag later).

---

## 7. Final Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              BROWSER (Client)                                │
│  • React components (existing UI)                                           │
│  • Cart state (localStorage / or future: sync to DB for logged-in users)     │
│  • Forms → Server Actions or fetch → API                                     │
└───────────────────────────────┬─────────────────────────────────────────────┘
                                │
                                │ HTTPS
                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         NEXT.JS APPLICATION (Server)                          │
│                                                                               │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────┐  │
│  │ Server          │  │ Server Actions  │  │ API Routes                   │  │
│  │ Components      │  │ (auth, checkout,│  │ /api/send-email              │  │
│  │ (product list,  │  │  admin CRUD,    │  │ /api/send-whatsapp           │  │
│  │  order history) │  │  reviews)       │  │ (optional: /api/products)    │  │
│  └────────┬────────┘  └────────┬────────┘  └──────────────┬──────────────┘  │
│           │                    │                           │                  │
│           └────────────────────┼───────────────────────────┘                  │
│                                │                                              │
│                                ▼                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐  │
│  │ lib/db.ts (PrismaClient singleton)                                      │  │
│  │ lib/auth (session / NextAuth)                                           │  │
│  │ lib/services/* (product, order, user, review, admin) — optional          │  │
│  └────────────────────────────────────┬────────────────────────────────────┘  │
└─────────────────────────────────────────┼──────────────────────────────────────┘
                                          │
                                          │ DATABASE_URL
                                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         POSTGRESQL (Database)                                │
│                                                                               │
│  User  │  AdminUser  │  Category  │  Product  │  ProductImage  │  Order  │   │
│  OrderItem  │  Review  │  ProductRemoval                                        │
│                                                                               │
│  (Indexes, FKs, enums as in prisma/schema.prisma)                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Flow summary:**

1. **Browser** sends requests to Next.js (pages, Server Actions, or API routes).
2. **Next.js** authenticates (session/NextAuth), then calls **lib/db** (and optionally **lib/services**) to read/write data.
3. **Prisma** translates to SQL and talks to **PostgreSQL** via `DATABASE_URL`.
4. Responses flow back to the browser; UI stays largely unchanged while persistence moves from localStorage/JSON to PostgreSQL.

---

## Implementation Order (When You Start Coding)

1. Add Prisma + schema; run first migration; add `lib/db.ts`.
2. Seed categories and migrate products from `data/products.json`.
3. Implement auth (NextAuth or custom) and AdminUser; remove hardcoded admin.
4. Expose products via Server Components or API; switch product pages to DB.
5. Implement order creation (Server Action) and order history from DB.
6. Migrate user signup/login to DB; optionally run user/order/review import once.
7. Add reviews in DB; optionally migrate old reviews.
8. Add ProductRemoval for admin “bought/mistaken” flow; optionally migrate bought list.
9. Keep cart in client until you optionally add saved-cart in DB.

This document and **prisma/schema.prisma** together define the full database architecture and migration plan for safe implementation.
