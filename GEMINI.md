# CodeSwayam Auth Standards & Instructions

## 🎯 Purpose
The Authentication Service handles user identity, account management, and billing/invoices across the CodeSwayam platform. It integrates with Clerk for robust auth and Razorpay for payments.

## 🛠 Tech Stack
- **Framework**: Next.js 16 (App Router), React 19
- **Auth Provider**: Clerk (@clerk/nextjs)
- **OAuth**: @react-oauth/google
- **Payments**: Razorpay
- **PDF Generation**: html2pdf.js (for invoices)
- **Styling**: Tailwind CSS v4, @codeswayam/ui
- **Shared Libs**: @codeswayam/api-client

## 📂 Key Directories & Files
- `app/login/`, `app/signup/`: Custom auth pages using Clerk primitives.
- `app/account/`: Account settings and profile management.
- `app/invoices/`: Billing history and invoice generation.
- `lib/use-clerk-exchange.ts`: Hook for exchanging Clerk tokens for backend JWTs.
- `lib/auth-redirect.ts`: Logic for handling post-login redirections.

## 📐 Local Conventions
- **Token Exchange**: Every authenticated session must exchange the Clerk token for a backend-compatible JWT using the shared utility.
- **Invoices**: Use the `html2pdf.js` integration in `app/invoices/[id]` for client-side PDF generation.
- **Port**: This application runs on port **3003**.

## 🔄 Specific Workflows
- **Development**: `npm run dev` (starts on port 3003).
- **Clerk Sync**: Ensure Webhooks are configured if database synchronization with Clerk is required (see Core API documentation).

## 🔐 Environment Variables
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Clerk public key.
- `CLERK_SECRET_KEY`: Clerk secret key (server-side).
- `NEXT_PUBLIC_RAZORPAY_KEY_ID`: Razorpay public key for the checkout modal.
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL`: Auth page path (usually `/login`).
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL`: Post-login redirect (usually `/dashboard`).
