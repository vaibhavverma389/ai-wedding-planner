# ShaadiSaathi (शादी साथी) — REST API Documentation 📖

**Base URL**: `https://api.yourdomain.com/api/v1` (Local: `http://localhost:5000/api/v1`)  
**Standard Response Envelope**:
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}
```
**Standard Error Envelope**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Detailed description of error",
    "details": [ ... ]
  }
}
```

---

## 1. Authentication & Session Management (`/auth`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/auth/register` | Public | Register customer or vendor account. |
| `POST` | `/auth/login` | Public | Authenticate with email/password; returns JWT access token & sets HTTP-only refresh cookie. |
| `POST` | `/auth/refresh` | Public | Refresh expired access token via HTTP-only cookie. |
| `POST` | `/auth/logout` | Authenticated | Invalidate refresh token and clear HTTP-only cookie. |
| `GET` | `/auth/me` | Authenticated | Get current authenticated user profile & roles. |

### Register Request Schema
```json
{
  "name": "Pooja Sharma",
  "email": "pooja@example.com",
  "password": "Password123!",
  "role": "customer",
  "phone": "+919876543210"
}
```

---

## 2. Categories & Taxonomy (`/categories`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/categories` | Public | List all active categories with icon, slug, and listing count. |
| `GET` | `/categories/:slug` | Public | Get category details by slug. |
| `POST` | `/categories` | Admin | Create a new category. |
| `PUT` | `/categories/:id` | Admin | Update an existing category. |
| `DELETE` | `/categories/:id` | Admin | Soft-delete / deactivate category. |

---

## 3. Marketplace Listings & Catalog (`/listings`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/listings` | Public | Search, filter, and paginate marketplace listings. |
| `GET` | `/listings/:id` | Public | Get listing by ID (increments view count). |
| `GET` | `/listings/slug/:slug` | Public | Get listing by SEO slug. |
| `POST` | `/listings` | Vendor | Create listing (`rent`, `buy_new`, `buy_used`, `service`). |
| `PUT` | `/listings/:id` | Vendor / Admin | Update owned listing. |
| `DELETE` | `/listings/:id` | Vendor / Admin | Delete owned listing. |
| `GET` | `/listings/:id/availability` | Public | Check date-range availability for rental items. |

### Catalog Query Parameters (`GET /listings`)
- `q`: Search keyword (searches title, description, tags, city via MongoDB text index).
- `transactionType`: `rent`, `buy_new`, `buy_used`, `service`.
- `category`: Category ObjectId or slug.
- `city`: e.g. `Delhi NCR`, `Mumbai`, `Jaipur`, `Bengaluru`.
- `minPrice` / `maxPrice`: Numerical price boundaries.
- `condition`: (For used items) `like_new`, `good`, `fair`.
- `sortBy`: `price_asc`, `price_desc`, `newest`, `popular`, `rating`.
- `page`: Page index (default: `1`).
- `limit`: Items per page (default: `12`, max: `50`).

---

## 4. Vendor Profiles & Directory (`/vendors`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/vendors` | Public | Filter and list verified vendors. |
| `GET` | `/vendors/:id` | Public | Get public vendor storefront profile with portfolio and reviews. |
| `POST` | `/vendors/profile` | Vendor | Create or update vendor business profile. |
| `POST` | `/vendors/:id/reviews` | Customer | Submit a verified review and rating for vendor. |

---

## 5. Cart Management (`/cart`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/cart` | Customer | Fetch current customer cart with breakdown of item types. |
| `POST` | `/cart/items` | Customer | Add item to cart (supports rental date selection). |
| `PUT` | `/cart/items/:itemId` | Customer | Update quantity or rental duration of cart item. |
| `DELETE` | `/cart/items/:itemId` | Customer | Remove specific item from cart. |
| `DELETE` | `/cart` | Customer | Clear entire cart. |

---

## 6. Service Quotations (`/quotes`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/quotes` | Customer | Request custom quotation for service listing. |
| `GET` | `/quotes/my` | Customer | Fetch customer requested quotes. |
| `GET` | `/quotes/vendor` | Vendor | Fetch quotation requests assigned to vendor. |
| `GET` | `/quotes/:id` | Customer / Vendor | View quotation negotiation details. |
| `PUT` | `/quotes/:id/vendor-offer` | Vendor | Submit custom pricing, deliverables, and payment milestones. |
| `PUT` | `/quotes/:id/accept` | Customer | Customer accepts vendor quote terms. |
| `PUT` | `/quotes/:id/reject` | Customer / Vendor | Decline or terminate quote. |

---

## 7. Checkout & Payments (`/checkout` & `/payments`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/checkout/initialize` | Customer | Validate cart items, create 15-min rental holds, generate OrderGroup, and create Razorpay gateway order. |
| `POST` | `/payments/verify` | Customer | Verify HMAC-SHA256 signature from client checkout modal, transition holds, decrement stock, and confirm orders. |
| `POST` | `/payments/webhook` | Webhook (Public) | Secure Razorpay server-to-server webhook endpoint verifying `X-Razorpay-Signature`. |
| `POST` | `/payments/:paymentId/refund` | Admin | Process full or partial refund and log audit record. |

### Checkout Initialize Request Schema
```json
{
  "shippingAddress": {
    "fullName": "Pooja Sharma",
    "phone": "+919876543210",
    "addressLine1": "Plot 42, Civil Lines",
    "addressLine2": "Near Raj Mandir",
    "city": "Jaipur",
    "state": "Rajasthan",
    "pincode": "302001",
    "country": "India"
  }
}
```

---

## 8. Orders & Fulfillment (`/orders`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/orders/my` | Customer | List customer order groups with status badges and sub-orders. |
| `GET` | `/orders/:id` | Customer / Vendor | View sub-order details, tracking numbers, and items. |
| `PUT` | `/orders/:id/status` | Vendor / Admin | Update sub-order fulfillment lifecycle (`PENDING` -> `CONFIRMED` -> `SHIPPED` / `DISPATCHED` -> `DELIVERED` -> `RETURNED`). |
| `PUT` | `/orders/:id/security-deposit` | Vendor / Admin | Settle security deposit for rental orders (deduct damages or refund). |

---

## 9. Wedding Event Planner (`/events`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/events` | Customer | List user's wedding events. |
| `POST` | `/events` | Customer | Create a new wedding planner profile (dates, partner names, overall budget). |
| `GET` | `/events/:id` | Customer | Get wedding details including sub-events (Sangeet, Haldi, Reception), budget lines, tasks, and RSVP guests. |
| `PUT` | `/events/:id` | Customer | Update core wedding details and budget. |
| `POST` | `/events/:id/sub-events` | Customer | Add ceremonial sub-event with date, time, and venue. |
| `POST` | `/events/:id/budget-items` | Customer | Add budget item with estimated and actual cost. |
| `POST` | `/events/:id/tasks` | Customer | Add planning task checklist item. |
| `PUT` | `/events/:id/tasks/:taskId` | Customer | Toggle task completion status or due date. |
| `POST` | `/events/:id/guests` | Customer | Add guest entry with RSVP status (`attending`, `declined`, `pending`), dietary preference, and plus-ones. |

---

## 10. Vendor Dashboard (`/vendor-dashboard`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/vendor-dashboard/metrics` | Vendor | Total revenue, pending orders, active listings, and average rating. |
| `GET` | `/vendor-dashboard/orders` | Vendor | Paginated list of sub-orders assigned to vendor. |
| `GET` | `/vendor-dashboard/listings` | Vendor | Paginated list of vendor's marketplace listings. |
| `GET` | `/vendor-dashboard/quotes` | Vendor | Incoming quotation requests with status filters. |

---

## 11. Admin Control Plane (`/admin`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/admin/metrics` | Admin | Platform-wide GMV, vendor commissions, user counts, and dispute stats. |
| `GET` | `/admin/vendors` | Admin | List vendors pending verification. |
| `PUT` | `/admin/vendors/:id/verify` | Admin | Approve or reject vendor KYC & business license. |
| `GET` | `/admin/listings/moderation` | Admin | List flagged or pending listings. |
| `PUT` | `/admin/listings/:id/moderate` | Admin | Approve, reject, or suspend listing. |
| `GET` | `/admin/orders` | Admin | Platform-wide order oversight with filter by status. |

---

## 12. In-App Notifications (`/notifications`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/notifications` | Authenticated | List user notifications with unread count. |
| `PUT` | `/notifications/:id/read` | Authenticated | Mark individual notification as read. |
| `PUT` | `/notifications/read-all` | Authenticated | Mark all notifications as read. |

---

## 13. System Health (`/health`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/health` | Public | Service heartbeat: uptime, memory usage, and MongoDB connection status. |
