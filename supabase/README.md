# Edge-X Backend with Supabase

Complete backend infrastructure for the Edge-X e-commerce platform using Supabase (PostgreSQL + Auth + Edge Functions + Realtime + Storage).

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React + Vite)                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Auth Context│  │ React Query │  │ API Service Layer   │  │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘  │
└─────────┼────────────────┼─────────────────────┼─────────────┘
          │                │                     │
          ▼                ▼                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Platform                          │
│  ┌──────────┐ ┌──────────┐ ┌─────────────┐ ┌──────────────┐ │
│  │ Postgres │ │   Auth   │ │ Edge Funcs  │ │  Storage     │ │
│  │ Database │ │          │ │  (Deno)     │ │  (Images)    │ │
│  └──────────┘ └──────────┘ └─────────────┘ └──────────────┘ │
│         │                                                    │
│    ┌────▼────┐                                               │
│    │   RLS   │  Row Level Security Policies                  │
│    │ Policies│                                               │
│    └─────────┘                                               │
└─────────────────────────────────────────────────────────────┘
```

## Database Schema

### Core Tables

| Table | Description |
|-------|-------------|
| `users` | Extended user profiles (extends auth.users) |
| `categories` | Product categories with hierarchy |
| `products` | Product catalog with variants |
| `product_images` | Product image gallery |
| `product_variants` | Color/size combinations with stock |
| `cart_items` | User shopping cart |
| `wishlist_items` | User wishlist |
| `orders` | Customer orders |
| `order_items` | Order line items |
| `reviews` | Product reviews |
| `notifications` | User notifications |
| `addresses` | Shipping/billing addresses |
| `coupons` | Discount codes |
| `coupon_usages` | Coupon redemption tracking |
| `settings` | Site configuration |

### Key Features

- **UUID Primary Keys** - All tables use UUIDs
- **Row Level Security (RLS)** - Comprehensive policies for data access control
- **Automatic Timestamps** - `created_at`/`updated_at` with triggers
- **Foreign Key Constraints** - Referential integrity
- **Check Constraints** - Data validation (e.g., rating 1-5, positive quantities)
- **Indexes** - Optimized query performance

## Edge Functions (API Endpoints)

| Function | Endpoint | Methods | Auth Required |
|----------|----------|---------|---------------|
| `products` | `/functions/v1/products` | GET, POST, PUT, DELETE | GET: No, Others: Admin |
| `categories` | `/functions/v1/categories` | GET, POST, PUT, DELETE | GET: No, Others: Admin |
| `cart` | `/functions/v1/cart` | GET, POST, PUT, DELETE | Yes |
| `orders` | `/functions/v1/orders` | GET, POST, PUT | Yes |
| `users` | `/functions/v1/users` | GET, PUT | Yes (own), Admin (all) |
| `wishlist` | `/functions/v1/wishlist` | GET, POST, DELETE | Yes |
| `reviews` | `/functions/v1/reviews` | GET, POST, PUT, DELETE | Yes |

## Setup Instructions

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your project URL and anon key from Settings → API

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
VITE_SUPABASE_FUNCTIONS_URL=https://your-project-ref.supabase.co/functions/v1
VITE_APP_URL=http://localhost:5173
```

### 3. Run Database Migrations

Using Supabase CLI:

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

Or manually in Supabase SQL Editor:
1. Run `supabase/schema.sql`
2. Run `supabase/rls-policies.sql`
3. Run `supabase/seed.sql`

### 4. Deploy Edge Functions

```bash
# Deploy all functions
supabase functions deploy

# Or deploy individually
supabase functions deploy products
supabase functions deploy categories
supabase functions deploy cart
supabase functions deploy orders
supabase functions deploy users
supabase functions deploy wishlist
supabase functions deploy reviews
```

### 5. Configure Auth Providers

In Supabase Dashboard → Authentication → Providers:
- Enable Email/Password
- Configure OAuth providers (Google, GitHub, etc.) if needed
- Set Site URL and Redirect URLs

### 6. Configure Storage

Create storage buckets in Supabase Dashboard → Storage:
- `product-images` - Public bucket for product images
- `avatars` - Private bucket for user avatars

Set bucket policies for public read access on product-images.

### 7. Install Dependencies & Run

```bash
npm install
npm run dev
```

## Frontend Integration

### Auth Context

```tsx
import { useAuth } from './context/AuthContext';

function MyComponent() {
  const { user, appUser, signIn, signOut, loading } = useAuth();
  // ...
}
```

### Data Fetching with React Query

```tsx
import { useProducts, useCart, useCreateOrder } from './hooks/useApi';

function ProductList() {
  const { data, isLoading } = useProducts({ category: 'sneakers', page: 1 });
  // ...
}

function Checkout() {
  const createOrder = useCreateOrder();
  const handleSubmit = async (orderData) => {
    await createOrder.mutateAsync(orderData);
  };
}
```

### API Service Layer

```tsx
import { api } from './services/api';

// Direct API calls (not using React Query)
const products = await api.products.list({ search: 'nike', limit: 10 });
const cart = await api.cart.get();
await api.cart.add({ product_id: 'uuid', selected_size: 'US 10', quantity: 1 });
```

## RLS Policy Summary

### Public Access (No Auth)
- View published products
- View active categories
- View published reviews
- View active coupons
- View public settings

### Authenticated Users (Own Data)
- Full CRUD on own cart
- Full CRUD on own wishlist
- View own orders
- Create orders
- View/update own profile
- Manage own addresses
- View own notifications
- Create reviews for delivered orders

### Admin/Owner Access
- Full CRUD on all products
- Full CRUD on all categories
- View all orders
- Update order statuses
- Manage all users
- Manage coupons
- View all reviews (moderate)
- Manage settings

## Business Logic (Database Functions)

- `handle_new_user()` - Creates user profile on signup
- `generate_order_number()` - Generates unique order numbers
- `decrement_product_stock()` - Reduces stock on order creation
- `increment_product_stock()` - Restores stock on cancellation
- `increment_coupon_usage()` - Tracks coupon redemptions
- `handle_updated_at()` - Auto-updates timestamps

## Security Best Practices

1. **Never expose service role key** on frontend
2. **Use RLS policies** for all data access control
3. **Validate on both client and server** (Edge Functions)
4. **Use prepared statements** (Supabase client does this)
5. **Enable MFA** for admin accounts
6. **Rotate keys periodically**
7. **Monitor audit logs** in Supabase Dashboard

## Development Workflow

```bash
# Start local development (requires Docker)
supabase start

# Run migrations locally
supabase db reset

# Generate types from schema
supabase gen types typescript --local > src/integrations/supabase/types.ts

# Deploy to production
supabase db push
supabase functions deploy
```

## Testing

```bash
# Run Edge Function tests
supabase functions test

# Test RLS policies
# Use Supabase Dashboard → SQL Editor with different user contexts
```

## Monitoring & Debugging

- **Logs**: Supabase Dashboard → Logs → Edge Functions
- **Database**: Supabase Dashboard → Table Editor / SQL Editor
- **Auth**: Supabase Dashboard → Authentication → Users
- **Realtime**: Supabase Dashboard → Realtime → Publications
- **Storage**: Supabase Dashboard → Storage

## Production Checklist

- [ ] Environment variables set in hosting platform
- [ ] Service role key only in Edge Functions (not frontend)
- [ ] RLS policies tested with all user roles
- [ ] Storage buckets configured with correct policies
- [ ] Auth providers configured with production URLs
- [ ] Email templates customized in Auth settings
- [ ] Rate limiting enabled on Edge Functions
- [ ] Database backups configured
- [ ] Monitoring alerts set up
- [ ] SSL/TLS enforced