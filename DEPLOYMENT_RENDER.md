# Edge-X Deployment to Render.com - Step by Step Guide

## Prerequisites
- GitHub/GitLab/Bitbucket account
- Render.com account (free tier available)
- Supabase project already set up

---

## Step 1: Prepare Your Repository

1. **Initialize Git (if not already done):**
   ```bash
   cd "C:\Users\nerav\Downloads\edge-x (1)"
   git init
   git add .
   git commit -m "Initial commit for Render deployment"
   ```

2. **Push to GitHub/GitLab/Bitbucket:**
   - Create a new repository on GitHub/GitLab/Bitbucket
   - Push your code:
   ```bash
   git remote add origin <your-repo-url>
   git branch -M main
   git push -u origin main
   ```

---

## Step 2: Configure Environment Variables in Render

### In Render Dashboard:
1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub/GitLab/Bitbucket repository
4. Configure the service:

**Basic Settings:**
- **Name:** `edge-x`
- **Environment:** `Node`
- **Region:** Choose closest to your users
- **Branch:** `main`
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npx http-server dist -p $PORT -a 0.0.0.0`

### Environment Variables (Add in Render Dashboard → Environment):

| Key | Value | Notes |
|-----|-------|-------|
| `VITE_SUPABASE_URL` | `https://qymkgzjcxpeqgctvsswq.supabase.co` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | `sb_publishable_JzyABTXD5OLscTHzeRfYbg_tVmlS9ce` | Your Supabase anon key |
| `VITE_SUPABASE_SERVICE_ROLE_KEY` | `[SET_IN_RENDER_DASHBOARD]` | **Keep secret! Set in Render dashboard** |
| `VITE_SUPABASE_FUNCTIONS_URL` | `https://qymkgzjcxpeqgctvsswq.supabase.co/functions/v1` | Supabase Functions URL |
| `VITE_APP_URL` | `https://your-app-name.onrender.com` | Will be your Render URL |

**Important:** Mark `VITE_SUPABASE_SERVICE_ROLE_KEY` as **Secret** in Render dashboard.

---

## Step 3: Configure Supabase for Production

### In Supabase Dashboard:
1. Go to **Authentication** → **Settings** → **URL Configuration**
2. Add to **Site URL:** `https://your-app-name.onrender.com`
3. Add to **Redirect URLs:**
   - `https://your-app-name.onrender.com/**`
   - `http://localhost:3000/**` (for local dev)

2. **Authentication → Providers → Email:**
   - Toggle **Enable email signup** → ON
   - **Confirm email:** OFF (for development) or ON (for production with email confirmation)

3. **Storage → Buckets:**
   - Create bucket: `product-images` (Public)
   - Create bucket: `avatars` (Private)
   - Set appropriate policies

---

## Step 4: Deploy Edge Functions (Separate from Web Service)

### Option A: Deploy via Supabase CLI (Recommended)
```bash
cd "C:\Users\nerav\Downloads\edge-x (1)"
supabase login
supabase link --project-ref qymkgzjcxpeqgctvsswq
supabase functions deploy
```

### Option B: Deploy via Supabase Dashboard
1. Go to **Edge Functions** in Supabase Dashboard
2. Create/Deploy each function:
   - `products`
   - `categories`
   - `cart`
   - `orders`
   - `users`
   - `wishlist`
   - `reviews`

---

## Step 5: Verify Deployment

1. **Wait for Render build to complete** (check build logs)
2. **Visit your Render URL:** `https://your-app-name.onrender.com`
3. **Test the flow:**
   - Sign up → Create Account
   - Sign In
   - Add to Cart → Check `cart_items` in Supabase
   - Add to Wishlist → Check `wishlist_items`
   - Place Order → Check `orders` & `order_items`

---

## Step 6: Post-Deployment Checklist

- [ ] Site loads at Render URL
- [ ] Sign Up works (check Supabase Auth → Users)
- [ ] Sign In works
- [ ] Add to Cart → Check `cart_items` in Supabase
- [ ] Wishlist works → Check `wishlist_items`
- [ ] Checkout flow works → Check `orders` & `order_items`
- [ ] Profile → Addresses work
- [ ] Edge Functions respond (check Edge Functions logs in Supabase)

---

## Step 7: Post-Deployment Checklist

- [ ] Site loads at Render URL
- [ ] Sign Up works (check Supabase Auth → Users)
- [ ] Sign In works
- [ ] Add to Cart → Check `cart_items` in Supabase
- [ ] Wishlist works → Check `wishlist_items`
- [ ] Checkout flow works → Check `orders` & `order_items`
- [ ] Profile → Addresses work
- [ ] Edge Functions respond (check Edge Functions logs in Supabase)

---

## Step 7: Post-Deployment Checklist

- [ ] Site loads at Render URL
- [ ] Sign Up works (check Supabase Auth → Users)
- [ ] Sign In works
- [ ] Add to Cart → Check `cart_items` in Supabase
- [ ] Wishlist works → Check `wishlist_items`
- [ ] Checkout flow works → Check `orders` & `order_items`
- [ ] Profile → Addresses work
- [ ] Edge Functions respond (check Edge Functions logs in Supabase)

---

## Troubleshooting Common Issues

| Issue | Solution |
|-------|----------|
| Build fails | Check Node version in `package.json` engines field |
| Environment variables not loading | Ensure all VITE_ vars are set in Render dashboard |
| CORS errors | Check Supabase CORS settings, add Render URL |
| Edge Functions 401 | Verify JWT token is sent, check Supabase JWT secret |
| WebSocket errors | Render free tier has limitations, expected for dev |

---

## Render Free Tier Limitations

- **Spins down after 15 min inactivity** (cold starts ~30s)
- **No custom domains** on free tier
- **No persistent storage** (use Supabase for all data)
- **750 hours/month** free tier limit

---

## Alternative: Use render.yaml (Infrastructure as Code)

The `render.yaml` file has been created in your project root. You can also deploy via:

1. **Render Dashboard → New → Blueprint**
2. Connect repository
3. Render will auto-detect `render.yaml` and configure everything

---

## Production Checklist

- [ ] Supabase RLS policies tested
- [ ] Edge Functions deployed and responding
- [ ] Environment variables set in Render
- [ ] Supabase Auth configured for production domain
- [ ] CORS headers configured in Supabase/Edge Functions
- [ ] Error monitoring set up (Sentry, etc.)
- [ ] Database backups enabled in Supabase
- [ ] Custom domain configured (if on paid plan)

---

## Support

Check Render logs and Supabase Edge Function logs for debugging.