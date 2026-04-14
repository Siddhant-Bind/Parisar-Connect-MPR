# Parisar Connect

**Parisar Connect** is a complete Housing/Apartment Management System designed to digitize and centralize operations by connecting residents, management (admins), and security personnel to ensure efficiency, transparency, and high security.

---

## 📊 Project Completion Analysis against PRD

The application has successfully met all **Phase 1 In-Scope Requirements** outlined in the Product Requirement Document (PRD).

### 1. Role-Based Capabilities (✅ 100% Completed)
- **Resident Module**: 
  - Real-time dashboard for announcements, complaints, visitors, and pending payments.
  - Ability to raise complaints, prep-approve visitors, and register for events.
- **Admin Module**: 
  - Comprehensive dashboard offering statistics on resident count, complaint statuses, payment collections, and recent visitors.
  - Ability to push society-wide or cross-society notices (events). 
  - Resident lifecycle and role administration.
- **Security (Guard) Module**: 
  - Scan or log walk-in visitors.
  - Verify pre-approved visitors efficiently.
  - Record entry/exit timestamps.

### 2. Multi-tenant Society Support (✅ Completed)
- Single centralized platform supporting multiple distinctive societies.
- Database enforces `societyId` constraints allowing data isolation.
- Advanced features like "Cross-Society Event Notices" have been implemented for public relations and networking between neighboring buildings.

### 3. Theme & Accessibility (✅ Completed)
- Full Light and Dark Mode support spanning all views seamlessly using ShadCN UI and Tailwind CSS.
- Responsive design tailored for mobile device utility.

### 4. Technical Non-Functional Successes
- **Performance**: Standardized via React Query catching and Prisma optimizations.
- **Security**: Data isolation at the routing level.

---

## 🚀 Deployment Guide & Required Changes

The project is structured entirely as a Monorepo using a `client/` Vite frontend and a `server/` Node.js backend. 

### Step 1: Environment Variables Setup
You must configure the `.env` variables on your staging/production environments.

**For the Server:**
Create a `.env` in the `server/` directory:
```env
PORT=5000
DATABASE_URL="postgres://[username]:[password]@[hostname]/postgres"
DIRECT_URL="postgres://[username]:[password]@[hostname]/postgres"
CORS_ORIGIN="https://[your-frontend-domain].com"
JWT_SECRET="your_secure_jwt_secret"
JWT_EXPIRY="7d"
```

**For the Client:**
Create a `.env` in the `client/` directory:
```env
VITE_API_URL="https://api.[your-domain].com/api/v1"
```

### Step 2: Database Preparation (PostgreSQL)
1. Ensure your PostgreSQL instance (e.g., Supabase / Neon or AWS RDS) is active.
2. In the `server` directory, run the database migrations and generate the Prisma Client for production:
```bash
cd server
npm install --omit=dev
npx prisma generate
npx prisma db push
```
*(Note: If migrating structured schemas on a fresh production database, use `npx prisma migrate deploy` instead of `db push` to retain safe rollback states).*

### Step 3: Backend Deployment (Node.js)
The backend does not require compilation. However, you should run it using a production process manager like **PM2** on your VPS (Ubuntu/Linux), or use **Docker**.
```bash
npm install -g pm2
pm2 start src/index.js --name "parisar-backend"
```
Ensure your server is reverse-proxied using Nginx to map `localhost:5000` to a secure `https://api...` endpoint.

### Step 4: Frontend Deployment (Static Hosting)
The Vite+React frontend must be built before serving.
```bash
cd client
npm install
npm run build
```
Once the build concludes, copy the generated `client/dist` directory to your web server (e.g., **Vercel, Netlify, or Nginx directory**).

### Recommended Deployment Platforms:
- **Database**: Supabase / Neon
- **Frontend**: Vercel / Netlify
- **Backend**: Render / DigitalOcean App Platform / AWS EC2
