# Treabyn Retail POS & Accounting

A highly scalable, offline-first Point of Sale (POS) and Accounting system built specifically for the Nigerian retail market.

## Architecture Highlights
- **Monorepo (Turborepo)**: Clean separation of the desktop application, web dashboard, and shared packages (e.g., license-core).
- **Desktop Application (Electron + React)**: Built with Vite, React 18, and TailwindCSS for a high-performance, native-like experience.
- **Offline-First Data Layer**: Utilizes WebAssembly `sql.js` within Electron to provide zero-latency offline SQLite caching, with a robust background synchronization queue to Supabase.
- **Secure Licensing**: Hardware-locked, AES-256 encrypted local license validation paired with a secure Supabase Edge Function validator.
- **Automated Provisioning**: Paystack webhook integration completely automates tenant creation, license generation, and welcome email delivery via Resend.

## Getting Started

### Prerequisites
- Node.js v18+
- npm (with workspace support)

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Development
Start the desktop application in development mode:
```bash
npm run dev:desktop
```
*(This concurrently starts the Vite dev server and the Electron shell)*

### Production Build
Generate the Windows NSIS Installer (executable):
```bash
npm run build:desktop
```
*(Output will be generated in `apps/desktop/release`)*

## Environment Configuration
Please reference the `.env.example` file for required environment configuration variables for both the Vite client and the Supabase Edge Functions.

## License Security
The application employs an HMAC-SHA256 signature verification to prevent tampering. Local cache bypass attempts are mitigated by AES-256-CBC encryption bounds to the specific device fingerprint (UUID/MAC address).
