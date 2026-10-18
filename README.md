# KIPLExchange — Next.js Web App

Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · TanStack Query · TanStack Table · Axios

## Chalane ka tarika

```bash
npm install
cp .env.example .env.local   # API URL yahan set hai
npm run dev                  # http://localhost:3000
```

Production: `npm run build && npm start`

## Kya kya hai

| Route | Kaam |
|---|---|
| `/` | Home page (Navbar me Login / Sign Up, Hero, Services, About, Contact, Footer) |
| `/login` | Mobile → OTP → Verify → Dashboard |
| `/register` | Name + Mobile + Email → `/user/create` → OTP → Verify → Dashboard |
| `/dashboard` | Wallets, pending, today's purchase/sales, stock (TanStack Table) |
| `/dashboard/payment`, `/fix-margin`, `/purchase`, ... | Menu pages (placeholder, `[section]` route) |
| `/privacy-policy`, `/terms` | Sample legal pages |

## Do (2) dashboard layouts

Dashboard header me **Sidebar / Top** switch hai.
- **Sidebar** → `src/components/layout/sidebar-layout.tsx`
- **Top nav** → `src/components/layout/topbar-layout.tsx`

User ki choice `localStorage` me save hoti hai (`layout-mode`).

## Important files

```
src/
  config/site.ts              ← company naam, phone, email, menu items (sab yahin change karo)
  lib/axios.ts                ← tumhara axiosInstance (token auto add, 401 pe /login)
  lib/session.ts              ← token / user localStorage helpers (SSR safe)
  services/auth.service.ts    ← sendOTP, verifyOTP, createUser (tumhari API)
  services/dashboard.service.ts ← DEMO dashboard data (real API yahan lagao)
  hooks/useAuth.ts            ← TanStack Query mutations (login, verify, signup, logout)
  hooks/useSession.ts         ← route guard
  providers/                  ← QueryClient + Layout (sidebar/topbar) context
```

## Dhyan dene wali baatein

1. **OTP token**: `/auth/login-app` ke response me `token` ya `data.token` dhundhta hai. Agar backend kisi aur key me bhejta hai, `extractOtpToken()` (auth.service.ts) me change karo.
2. **OTP length**: 6 digit maana hai — `src/components/auth/otp-step.tsx` me `OTP_LENGTH` badlo agar 4 hai.
3. **CORS**: Browser se `api.recharge.copy.kashishindiapvtltd.com` call hoga, toh backend par `http://localhost:3000` aur apna live domain allow hona chahiye. "Network error" aaye toh pehle yahi check karo.
4. **Dashboard data** abhi demo hai. Operator naam bhi sample hain (purane dashboard me sirf logo the).
