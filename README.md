# Renee GPT

A production-ready AI chat assistant with real-time streaming responses, multimodal file analysis, and multi-model support. Built with React 19 and deployed on AWS CloudFront + S3.

<!-- Replace with your own screenshot or GIF -->
<!-- ![Renee GPT Screenshot](docs/screenshot.png) -->

## Architecture

```
┌─────────────┐     HTTPS      ┌──────────────┐     S3 OAC      ┌──────────┐
│   Browser    │ ──────────────▶│  CloudFront   │ ──────────────▶│  S3      │
│  (React SPA) │                │  (CDN + TLS)  │                │  (Static)│
└──────┬───────┘                └──────────────┘                └──────────┘
       │
       │  SSE streaming
       ▼
┌──────────────┐
│  FastAPI      │   ← Backend API (separate repo)
│  Backend      │
└──────────────┘
```

**Frontend** — React 19 SPA served from S3 via CloudFront with OAC, HSTS, and security headers.
**Backend** — FastAPI with JWT auth, token refresh via HttpOnly cookies, and Server-Sent Events for streaming chat responses.

## Features

- **Real-time streaming chat** — Token-by-token SSE streaming for instant response rendering
- **Multi-model support** — Switch between ChatGPT (fast inference) and Renee GPT (DeepSeek)
- **Multimodal file analysis** — Attach and analyze documents/images via Base64 encoding
- **JWT authentication** — Login, registration, and automatic token refresh with HttpOnly cookies
- **Guest mode** — Try the assistant without creating an account
- **Chat history** — Persistent conversation history for registered users
- **Responsive design** — Mobile-first UI with collapsible sidebar
- **Dark theme** — Full dark mode with custom design system
- **Error boundary** — Graceful error handling with user-friendly recovery UI
- **Production optimized** — Code splitting, console stripping, CSS code splitting, source maps

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Framework** | React 19 | Latest concurrent features, improved performance over React 18 |
| **Build tool** | Vite 8 | Sub-second HMR, Oxc-based minification (faster than esbuild/Terser) |
| **Styling** | Tailwind CSS 4 | Utility-first with new @theme directive, zero-runtime CSS |
| **Hosting** | AWS CloudFront + S3 | Global CDN with <50ms TTFB, S3 origin with OAC for zero-trust access |
| **IaC** | Terraform | Reproducible infrastructure, version-controlled AWS resources |
| **CI/CD** | GitHub Actions | Automated lint + build on PRs, deploy on merge to main |

## Run Locally

```bash
git clone https://github.com/yourusername/renee_gpt_frontend.git
cd renee_gpt_frontend
cp .env.example .env.development   # then edit VITE_API_URL
npm install && npm run dev
```

The app opens at `http://localhost:5173`. You need the [backend API](https://github.com/yourusername/renee_gpt_backend) running for full functionality.

## Environment Variables

All API URLs come from environment variables — never hardcoded.

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL (no trailing slash) | `https://api.yourdomain.com` |

Files:
- `.env.example` — Committed template with placeholder values
- `.env.development` — Local dev config (gitignored)
- `.env.production` — Production config (gitignored, set via CI secrets)

## Build & Deploy

### Build

```bash
npm run build
```

Output goes to `dist/`. Production builds automatically:
- **Strip console logs** and debugger statements via Oxc
- **Code-split** React + vendor bundles from app code via `manualChunks`
- **CSS code-split** for optimal loading
- **Generate source maps** for error tracking

### Infrastructure (Terraform)

```bash
cd infra
terraform init
terraform plan -var="domain_name=app.yourdomain.com"
terraform apply -var="domain_name=app.yourdomain.com"
```

This provisions:
- Private S3 bucket with versioning
- CloudFront distribution with OAC (US + Europe, PriceClass_100)
- ACM TLS certificate
- Security headers (HSTS, X-Frame-Options DENY, strict referrer policy)
- SPA routing (404/403 → index.html)

### CI/CD

Two GitHub Actions workflows:

- **`ci.yml`** — Runs on every PR: `npm ci` → `lint` → `build`. Fails the PR if any step fails.
- **`deploy.yml`** — Runs on merge to main: lint → build → S3 sync → CloudFront invalidation.

**Required GitHub Secrets:**

| Secret | Description |
|--------|-------------|
| `VITE_API_URL` | Production API URL |
| `AWS_ROLE_ARN` | IAM role ARN for OIDC federation |
| `S3_BUCKET_NAME` | S3 bucket name from Terraform output |
| `CLOUDFRONT_DISTRIBUTION_ID` | Distribution ID from Terraform output |

## Project Structure

```
renee_gpt_frontend/
├── .github/workflows/       # CI/CD pipelines
│   ├── ci.yml               # PR checks (lint + build)
│   └── deploy.yml           # Deploy on merge to main
├── infra/
│   └── frontend.tf          # Terraform AWS infrastructure
├── public/
│   ├── favicon.svg          # App icon
│   └── icons.svg            # SVG sprite (social icons)
├── src/
│   ├── main.jsx             # React entry point with ErrorBoundary
│   ├── App.jsx              # Root component with view routing
│   ├── ErrorBoundary.jsx    # Global error boundary
│   ├── index.css            # Tailwind theme, animations, scrollbar
│   ├── Auth/
│   │   ├── Login.jsx        # Login + session check + token refresh
│   │   └── Register.jsx     # Registration form
│   └── Interface/
│       └── ChatInterface.jsx # Main chat UI with streaming
├── .env.example             # Environment variable template
├── vite.config.js           # Build config (splitting, minification)
└── package.json
```

## License

MIT
