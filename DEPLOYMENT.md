# ShaadiSaathi (शादी साथी) — Production Deployment Manual 🚀

This document provides complete, step-by-step instructions for deploying ShaadiSaathi to production environments (Frontend on Vercel/Netlify, Backend on Render/Railway/AWS/DigitalOcean, Database on MongoDB Atlas).

---

## 1. Prerequisites & Required Accounts

Before deploying, ensure you have active accounts on:
1. **MongoDB Atlas** (Database hosting)
2. **Cloudinary** (Image & media CDN storage)
3. **Razorpay Dashboard** (Indian payment gateway integration)
4. **Vercel** or **Netlify** (Static Frontend SPA hosting)
5. **Render**, **Railway**, or **AWS/DigitalOcean** (Node.js API hosting)
6. **SMTP Email Provider** (SendGrid, Mailgun, AWS SES, or Gmail App Password)

---

## 2. Third-Party Service Setup

### 2.1. MongoDB Atlas Setup
1. Create a free or dedicated cluster in the **AWS / Mumbai (ap-south-1)** region for optimal latency.
2. In **Database Access**, create a database user:
   - Username: `shaadisaathi_app`
   - Password: `<GENERATE_STRONG_PASSWORD>`
   - Role: `Read and write to any database`
3. In **Network Access**, add IP whitelist entries:
   - For serverless/cloud backend platforms (Render/Railway), add `0.0.0.0/0` (Allow access from anywhere) or specify your dedicated hosting static egress IPs.
4. Obtain the connection string:
   ```text
   mongodb+srv://shaadisaathi_app:<PASSWORD>@cluster0.xxxxx.mongodb.net/shaadisaathi?retryWrites=true&w=majority&appName=ShaadiSaathi
   ```

### 2.2. Cloudinary Setup
1. Log in to [Cloudinary Console](https://console.cloudinary.com/).
2. Copy your **Cloud Name**, **API Key**, and **API Secret** from the dashboard.
3. Under **Settings > Upload**, ensure auto-tagging or allowed formats (`jpg`, `jpeg`, `png`, `webp`) are configured.

### 2.3. Razorpay Payment Gateway Setup
1. Log in to [Razorpay Dashboard](https://dashboard.razorpay.com/).
2. Generate API Keys under **Settings > API Keys**:
   - `RAZORPAY_KEY_ID` (e.g., `rzp_test_...` or `rzp_live_...`)
   - `RAZORPAY_KEY_SECRET`
3. Configure Webhooks under **Settings > Webhooks > Add New Webhook**:
   - **Webhook URL**: `https://api.yourdomain.com/api/v1/payments/webhook`
   - **Secret**: `<STRONG_WEBHOOK_SECRET>` (e.g. 32-character random string)
   - **Alert Email**: Your devops/admin email
   - **Active Events**:
     - `payment.captured`
     - `payment.failed`
     - `refund.processed`
     - `order.paid`

### 2.4. SMTP Email Setup
1. Configure credentials for transactional emails (order confirmations, quotation status updates):
   - **Host**: `smtp.sendgrid.net` (or `smtp.gmail.com`)
   - **Port**: `587` (TLS) or `465` (SSL)
   - **User**: `apikey` (or your SMTP username)
   - **Password**: `<YOUR_SMTP_API_KEY_OR_APP_PASSWORD>`
   - **From**: `"ShaadiSaathi Notifications" <no-reply@yourdomain.com>`

---

## 3. Environment Variables Reference

### Backend (`server/.env.production`)
```env
# Server
PORT=5000
NODE_ENV=production
CLIENT_URL=https://shaadisaathi.yourdomain.com

# Database
MONGODB_URI=mongodb+srv://shaadisaathi_app:<PASSWORD>@cluster0.xxxxx.mongodb.net/shaadisaathi?retryWrites=true&w=majority

# JWT Secrets (Generate with: openssl rand -base64 64)
JWT_ACCESS_SECRET=your_super_secret_production_access_key_minimum_64_chars_long
JWT_REFRESH_SECRET=your_super_secret_production_refresh_key_minimum_64_chars_long
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Razorpay
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_matching_razorpay_dashboard

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# SMTP Email
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.xxxxxxxxxxxxxxxxxxxxxxxx
SMTP_FROM="ShaadiSaathi" <orders@yourdomain.com>
```

### Frontend (`client/.env.production`)
```env
VITE_API_BASE_URL=https://api.yourdomain.com/api/v1
VITE_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxxx
```

---

## 4. Backend Deployment (Render / Railway / DigitalOcean / EC2)

### Option A: Render.com
1. Create a new **Web Service** on Render and link your GitHub repository.
2. Configure settings:
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/server.js`
   - **Plan**: Standard (1 GB RAM minimum recommended for concurrent holds and image buffers)
3. Add all environment variables from Section 3.
4. Set Health Check path to `/health`.
5. Deploy service. Note down the public URL (e.g. `https://shaadisaathi-api.onrender.com`).

### Option B: Self-Hosted Linux (Ubuntu 22.04 LTS / EC2 / Droplet)
1. Install Node.js 20 LTS, Git, and PM2:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs nginx certbot python3-certbot-nginx
   sudo npm install -g pm2
   ```
2. Clone repository & install:
   ```bash
   git clone https://github.com/your-org/ai-wedding-planner.git /var/www/shaadisaathi
   cd /var/www/shaadisaathi/server
   npm install --omit=dev
   cp .env.example .env
   # Edit .env with production credentials
   ```
3. Start application with PM2 cluster mode:
   ```bash
   pm2 start src/server.js --name "shaadisaathi-api" -i max
   pm2 save
   pm2 startup
   ```
4. Configure Nginx Reverse Proxy with SSL:
   ```nginx
   server {
       server_name api.yourdomain.com;

       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
5. Obtain free SSL certificate:
   ```bash
   sudo certbot --nginx -d api.yourdomain.com
   ```

---

## 5. Frontend Deployment (Vercel)

1. Sign in to [Vercel](https://vercel.com) and click **Add New Project**.
2. Select your repository.
3. Configure Project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variables:
   - `VITE_API_BASE_URL` = `https://api.yourdomain.com/api/v1`
   - `VITE_RAZORPAY_KEY_ID` = `<RAZORPAY_KEY_ID>`
5. Verify `client/vercel.json` exists with SPA rewrite rule:
   ```json
   {
     "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
   }
   ```
6. Click **Deploy**. Assign your custom domain (e.g. `shaadisaathi.yourdomain.com`).

---

## 6. Database Seeding & Initial Admin Setup

Once the backend is connected to MongoDB Atlas, run the production catalog seed:

```bash
cd server
NODE_ENV=production npm run seed
```

This populates:
- 7 Core Indian Wedding Categories (Bridal & Groom Wear, Jewellery, Photography & Cinematography, Banquets & Farmhouses, Mehndi & Makeup Artists, Decor & Floral Setup, Sound & DJ Setup).
- Seed vendors with verified profiles across Delhi NCR, Mumbai, Jaipur, and Bengaluru.
- Production-ready listings across all 4 transaction types (**Rent**, **Buy New**, **Buy Used**, **Book Services**).

### Bootstrapping Admin Account
Register a user via `/register` or POST `/api/v1/auth/register`, then elevate their role in MongoDB Atlas:
```javascript
db.users.updateOne(
  { email: "admin@shaadisaathi.com" },
  { $set: { role: "admin", isEmailVerified: true } }
);
```

---

## 7. Production Security & Verification

1. **CORS Restrictions**: Verify `CLIENT_URL` in `server/.env` exactly matches your frontend domain (e.g., `https://shaadisaathi.yourdomain.com`).
2. **Secure Cookies**: In production (`NODE_ENV=production`), refresh tokens are transmitted with `SameSite=None` and `Secure=true`.
3. **Database Indexes**: Verify the following compound indexes are created automatically by Mongoose:
   - `listings`: `category`, `transactionType`, `city`, `price`, `isActive`, text index on `{ title: "text", description: "text", city: "text", tags: "text" }`.
   - `rentalreservations`: `{ listingId: 1, startDate: 1, endDate: 1, status: 1 }`.
   - `ordergroups`: `{ orderGroupId: 1, razorpayOrderId: 1 }`.
   - `payments`: `{ razorpayPaymentId: 1, idempotencyKey: 1 }`.
4. **Health Check**: Call `GET https://api.yourdomain.com/health` to confirm database connectivity and uptime status.

---

## 8. Backup & Maintenance

- **Daily Backups**: Configure MongoDB Atlas automated snapshots with 7-day retention.
- **Log Management**: PM2 logs are saved to `~/.pm2/logs/`. On cloud hosts (Render/Railway), view streaming logs directly from the platform console.
- **Razorpay Reconciliation**: Use the Admin Dashboard (`/admin/dashboard`) to verify payments captured against fulfilled order groups.
