# CodeSwayam Auth - Authentication Service

## Overview

**CodeSwayam Auth** is a dedicated authentication and account management service. It handles user registration, login, password reset, account settings, and integrates with **Clerk** for enterprise-grade authentication. This service provides a seamless authentication experience across the CodeSwayam platform with features like OAuth, multi-factor authentication, and session management.

---

## 🎯 Key Features

- **User Authentication**: Register, login, logout with Clerk integration
- **Account Management**: Profile management, account settings
- **Password Management**: Reset password, change password flows
- **OAuth Integration**: Social login (Google, GitHub, etc.)
- **Session Management**: Secure session handling
- **Multi-Factor Authentication**: Additional security layer
- **Invoice Management**: View and download invoices
- **Dashboard**: Personalized user dashboard
- **Responsive Design**: Mobile-optimized interface
- **Razorpay Integration**: Payment processing for credits/subscriptions

---

## 🛠️ Tech Stack

### Frontend Framework
- **Framework**: Next.js 16.x (React 19.x)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 with PostCSS
- **UI Components**: Radix UI, @codeswayam/ui

### Authentication
- **Auth Provider**: Clerk (enterprise authentication)
- **Google OAuth**: @react-oauth/google

### Key Libraries
- **Forms**: React Hook Form, Zod
- **HTTP Client**: Axios
- **PDF Export**: html2pdf.js
- **Toast Notifications**: Sonner
- **Icons**: Lucide React
- **Shared Packages**: @codeswayam/ui, @codeswayam/api-client

---

## 📋 Prerequisites

- **Node.js**: v18 or higher
- **npm**: v11.6.2+
- **Clerk Account**: For authentication setup

---

## 🔧 Installation & Setup

### 1. Install Dependencies

```bash
# From root directory
npm install

# Or from codeswayam-auth directory
cd codeswayam-auth
npm install
```

### 2. Environment Variables

Create `.env.local` file in the `codeswayam-auth` directory:

```env
# Clerk Configuration (Required)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
NEXT_PUBLIC_API_TIMEOUT=10000

# Redirect URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Google OAuth (Optional)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com

# Razorpay Configuration (Optional - for payments)
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id

# Feature Flags
NEXT_PUBLIC_ENABLE_SOCIAL_LOGIN=true
NEXT_PUBLIC_ENABLE_2FA=true
```

### 3. Clerk Setup

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Create a new application
3. Set sign-in/sign-up URLs
4. Configure OAuth providers
5. Copy keys to `.env.local`

---

## 🚀 Running the Application

### Development Mode

```bash
# Start development server
npm run dev

# Access at http://localhost:3003
```

### Build for Production

```bash
# Create optimized build
npm run build

# Test production build locally
npm run start

# Access at http://localhost:3003
```

---

## 📁 Project Structure

```
codeswayam-auth/
├── app/
│   ├── layout.tsx              # Root layout with Clerk provider
│   ├── page.tsx                # Home/redirect page
│   ├── globals.css             # Global styles
│   ├── account/
│   │   ├── layout.tsx
│   │   ├── page.tsx            # Account overview
│   │   └── settings.tsx        # Account settings
│   ├── dashboard/
│   │   ├── layout.tsx
│   │   └── page.tsx            # User dashboard
│   ├── login/
│   │   ├── layout.tsx
│   │   └── page.tsx            # Login page
│   ├── signup/
│   │   ├── layout.tsx
│   │   └── page.tsx            # Sign up page
│   ├── forgot-password/
│   │   └── page.tsx            # Password reset request
│   ├── reset-password/
│   │   └── page.tsx            # Password reset form
│   ├── invoices/
│   │   ├── layout.tsx
│   │   ├── page.tsx            # Invoices list
│   │   └── [id]/               # Invoice detail
│   ├── profile/
│   │   ├── layout.tsx
│   │   └── page.tsx            # User profile
│   └── api/                    # API routes
│       ├── auth/
│       ├── user/
│       └── invoices/
├── components/
│   ├── navbar.tsx              # Navigation bar
│   ├── footer.tsx              # Footer
│   ├── providers.tsx           # Auth providers setup
│   ├── razorpay-checkout.tsx   # Payment component
│   ├── ui/                     # Reusable UI components
│   └── forms/                  # Form components
├── lib/
│   ├── api.ts                  # API client
│   ├── auth-mode.tsx           # Auth mode utilities
│   ├── auth-redirect.ts        # Auth redirection logic
│   ├── use-clerk-exchange.ts   # Clerk token exchange hook
│   └── utils.ts                # Utility functions
├── public/
│   └── images/
├── tailwind.config.ts
├── tsconfig.json
└── next.config.ts
```

---

## 📝 Available Scripts

```bash
# Development
npm run dev              # Start dev server at port 3003
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
```

---

## 🔐 Authentication Flow

### Sign Up Flow
1. User navigates to `/signup`
2. Enters email and password
3. Clerk creates account
4. User redirected to dashboard
5. Account is created in backend

### Login Flow
1. User navigates to `/login`
2. Enters email and password
3. Clerk authenticates
4. JWT token issued
5. User redirected to dashboard

### Password Reset
1. User clicks "Forgot Password" on login
2. Enters email address
3. Receives reset email from Clerk
4. Clicks link in email
5. Sets new password
6. Can log in with new password

### OAuth/Social Login
1. User clicks "Sign in with Google"
2. Redirected to Google OAuth
3. User authorizes CodeSwayam
4. Returned to app with OAuth token
5. Account created or linked

---

## 📋 Pages & Features

### Login (`/login`)
- Email/password login
- Social login buttons
- Remember me option
- "Forgot password" link
- Sign up redirect

### Sign Up (`/signup`)
- Email/password registration
- Social sign up
- Terms & conditions
- Email verification
- Login redirect

### Dashboard (`/dashboard`)
- Welcome message
- Quick stats
- Recent activity
- Quick action buttons
- Subscription status

### Account (`/account`)
- Account overview
- Basic information
- Account status
- Subscription details
- Action buttons

### Account Settings (`/account/settings`)
- Profile information
- Email preferences
- Privacy settings
- Security options
- Connected accounts

### Profile (`/profile`)
- User information
- Avatar/photo
- Bio/description
- Social links
- Edit profile form

### Invoices (`/invoices`)
- List of invoices
- Invoice details
- Download invoice (PDF)
- Invoice search/filter
- Date range filtering

### Forgot Password (`/forgot-password`)
- Email input
- Verification message
- Resend link option

### Reset Password (`/reset-password`)
- Password confirmation
- New password input
- Password strength indicator
- Success message

---

## 🔌 API Integration

### User Endpoints
- `GET /api/user` - Get current user
- `PATCH /api/user` - Update user profile
- `POST /api/user/avatar` - Upload avatar
- `DELETE /api/user` - Delete account

### Invoices Endpoints
- `GET /api/invoices` - List invoices
- `GET /api/invoices/:id` - Get invoice details
- `GET /api/invoices/:id/download` - Download PDF

### Auth Endpoints
- `POST /api/auth/exchange` - Exchange Clerk token for backend JWT
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout

---

## 💳 Razorpay Integration & Billing UI

### Payment Processing

The auth service implements the `<RazorpayButton>` component to initiate checkout flows for credit packs or SaaS subscription plans (including upgrades):

```typescript
import { RazorpayButton } from "@/components/razorpay-checkout";

// Simple subscription purchase
<RazorpayButton
  saasProductId={plan.id}
  billingCycle="monthly"
  currency="INR"
  planName={plan.name}
/>

// Upgrade subscription (supports proration calculations)
<RazorpayButton
  saasProductId={plan.id}
  billingCycle="monthly"
  currency="INR"
  planName={plan.name}
  upgradeFromSubscriptionId={currentActiveSub.id}
/>
```

### Upgrade & Cancellation Workflows
- **Proration Price Breakdown**: When upgrading a plan inside the `UpgradeModal`, the interface estimates the unused subscription time credit and displays a breakdown of the new plan price, unused credit deduction (-₹X), referral points discount, and final net payment due today.
- **7-Day Cancellation Lock**: The subscription dashboard cards compute whether an active plan was purchased more than 7 days ago. If so, the cancel trash button is disabled and renders a Lock icon with a descriptive tooltip explaining that cancellation is locked.

---

## 🎨 UI Components

### Using @codeswayam/ui

All UI components are imported from shared package:

```typescript
import {
  Button,
  Card,
  Input,
  Form,
  Dialog,
  // ... more components
} from "@codeswayam/ui"
```

---

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm test -- --coverage

# E2E testing
npm run test:e2e
```

---

## 🌍 Deployment

### Deploy to Vercel

```bash
npm i -g vercel
vercel
```

### Environment Variables (Production)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_API_BASE_URL` (production API URL)
- `NEXT_PUBLIC_RAZORPAY_KEY_ID`

### Clerk Configuration
1. Update Clerk dashboard with production URLs
2. Configure allowed origins
3. Set up email templates
4. Configure OAuth providers

---

## 🤝 Contributing

### Code Standards
- Follow Next.js best practices
- Use TypeScript strictly
- Write accessible components
- Test on mobile devices

### Adding New Pages

1. Create directory in `app/`
2. Add `page.tsx` and `layout.tsx`
3. Use Clerk authentication hooks
4. Add navigation links
5. Test authentication flow

---

## 🐛 Troubleshooting

### Clerk Not Working
- Verify publishable key in `.env.local`
- Check Clerk dashboard configuration
- Clear browser cache
- Restart dev server

### Redirect Loop
- Check redirect URLs in Clerk
- Verify `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL`
- Check middleware configuration

### Payment Not Processing
- Verify Razorpay key
- Check payment amount
- Review browser console for errors

### Build Errors
```bash
rm -rf .next node_modules
npm install
npm run build
```

---

## 📚 Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Razorpay Documentation](https://razorpay.com/docs)
- [Tailwind CSS](https://tailwindcss.com)

---

## 📄 License

ISC License

---

## 📞 Support

For issues:
1. Check Clerk documentation
2. Review error logs
3. Check environment variables
4. Open GitHub issue

---

**Last Updated**: April 2026

For more information, see the main [README.md](../../README.md)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
