# Rankly

**Website Search, Answer & Generative Engine Visibility Intelligence.**  
*Know what's holding your website back.*

Rankly is an independent software product developed by **Yash Shinde** from **Nyxen** ([https://nyxen.in](https://nyxen.in)).

---

## 🧭 Architecture & Product Model

Rankly analyzes websites across three distinct visibility layers:

1. **Search Engine Optimization (SEO)**: Technical crawlability, Core Web Vitals TTFB, SSL/TLS, canonical link tags, viewport responsiveness, metadata, and link integrity.
2. **Answer Engine Optimization (AEO)**: Query intent matching, question-oriented subheadings (`How`, `Why`, `What`), FAQ schemas, and concise answer blocks for Google AI Overviews and featured snippets.
3. **Generative Engine Optimization (GEO)**: Entity clarity, Schema.org JSON-LD knowledge graph integration, semantic heading trees, and author/publisher provenance for AI models (ChatGPT, Gemini, Perplexity).

Rankly separates deterministic diagnostic observations from artificial intelligence synthesis:

- **Deterministic Rules Engine**: Inspects actual HTTP status codes, headers, DOM structure, canonical tags, heading hierarchies, image alt tags, robots.txt, XML sitemaps, and JSON-LD schemas.
- **Multi-Pillar Scorer**: Calculates mathematical visibility scores across SEO, AEO, and GEO without asking an LLM to invent metrics.
- **Gemini AI Layer**: Receives structured findings (never raw HTML) and translates technical bottlenecks into root-cause explanations, prioritized next moves, and suggested copy to deploy.
- **Graceful Fallback**: If `GEMINI_API_KEY` is not provided or the Gemini API is unreachable, the audit completes deterministically without errors.

```
Browser
 └──> /onboarding (4-Step Guided Setup & URL Input)
 └──> Next.js 16 Route Handler (POST /api/audit)
       ├──> SSRF & Protocol Guard (rejects private IPs, loopback, cloud metadata)
       ├──> IP Rate Limiter (5 audits / IP / hour)
       ├──> Domain Cooldown & Duplicate Detector (5-minute window)
       ├──> Concurrency Throttling (max 10 parallel crawler fetches)
       ├──> Server-Side Fetcher (8s timeout, 2.5MB cap, User-Agent, max 5 redirects)
       ├──> Parallel Auxiliary Fetcher (/robots.txt, /sitemap.xml)
       ├──> Cheerio DOM & Metadata Signal Parser
       ├──> Page Type Classifier (Homepage, Blog, E-commerce, SaaS, Docs, Portfolio)
        ├──> 26 Deterministic SEO, AEO & GEO Check Modules
       ├──> Mathematical Multi-Pillar Scorer & Radar Generator
       ├──> Gemini AI Interpretation (with structured JSON schema & fallback)
       ├──> Audit Cache & Sanitized Persistence
       └──> Interactive Intelligence Report (/audit/[id]) & Rankly Index (/explore)
```

---

## 🚀 Core Product Features

### 1. Premium Guided Onboarding (`/onboarding`)
- **Step 01 / Welcome**: Overview of Search (SEO), Answer (AEO), and Generative (GEO) intelligence.
- **Step 02 / Website Type**: Classifies site model (SaaS, Business, Portfolio, Blog, E-commerce, Agency).
- **Step 03 / Target Website**: Direct URL input accepting `yourwebsite.com` or full URLs.
- **Step 04 / Priority Goals**: Focus on Search, Answers, Generative, or All Three.
- **Instant Audit Launch**: Clicking *"Analyze my website →"* initiates the live crawl immediately and navigates directly to the generated report.

### 2. Rankly Index (`/explore` & `/explore/[auditId]`)
- **Live Analytical Directory**: Real, sanitized audit summaries generated from organic product usage without fake placeholder cards.
- **Hostname Search & Filtering**: Real-time search across analyzed domains with Score (`High 80+`, `Needs Attention <80`) and Pillar filters (`SEO 70+`, `AEO 70+`, `GEO 70+`).
- **Sanitized Public Summary**: Anonymized detail view at `/explore/[auditId]` showing overall score, 3 pillars, and issue counts without exposing IP addresses or private query parameters.

### 3. Comprehensive Report Information Architecture (`/audit/[id]`)
- **Executive Diagnostic Summary**: Evidence-based headline and top 3 bottlenecks.
- **3 Pillar Score Cards**: Traditional Search (SEO), Answer Readiness (AEO), Generative Clarity (GEO).
- **SVG Visibility Radar & Charts**: 6-axis polygonal radar, findings distribution bar, category bars, and heading structure breakdown.
- **AEO & GEO Readiness Diagnostics**: Interrogative heading counts, FAQ detection, entity clarity, and extracted visual heading hierarchy tree.
- **Page Health Snapshot**: Exact values for title length, meta desc length, H1, images missing alt, internal/outbound links, schema types, and word count.
- **Comprehensive Findings Explorer**: Filterable by Pillar (`SEO`, `AEO`, `GEO`) and Status (`Critical`, `Warnings`, `Passed`) with expandable diagnostic rows.
- **Rankly AI Interpretation**: Distinct from measured observations, featuring code snippets and deployable suggested copy blocks.
- **Action Plan (Your Next 3 Moves)**: Top 3 prioritized actions based on verified impact.
- **Print-Ready PDF Export**: Formatted A4 layout with executive summary, pillars, snapshot tables, and next 3 moves.

### 4. Detailed Findings View (`/audit/[id]/details`)
- **Full Check-by-Check Breakdown**: Expandable table of all 26 diagnostic checks with status, severity, measured value, expected value, and actionable recommendations.
- **Contextual Navigation**: Audit local nav bar for switching between report summary and detailed findings.

### 5. About Page (`/about`)
- **Editorial Overview**: Clear explanation of what Rankly measures and how it differs from SEO-only tools.
- **Architecture Walkthrough**: Visual breakdown of the deterministic rules engine, multi-pillar scorer, and AI interpretation layer.
- **Security & Privacy Summary**: Overview of SSRF protection, rate limiting, and data sanitization.

### 6. How It Works (`/how-it-works`)
- **Step-by-Step Pipeline**: Visual walkthrough of the 6-stage audit process — from URL probing and DNS resolution through DOM parsing, check execution, scoring, and AI synthesis.

### 7. Page Type Classification
- **Automatic Detection**: Deterministically classifies pages into 7 types based on URL patterns and Schema.org signals: `Homepage`, `Blog / Article`, `E-commerce`, `Product / SaaS`, `Documentation`, `Portfolio`, and `Unknown`.
- **Adaptive Scoring**: AEO and GEO checks adjust severity thresholds based on detected page type (e.g., author provenance is critical for editorial content but informational for homepages).

---

## 🛡️ Anti-Abuse & Security Architecture

1. **IP Rate Limiting**: Strict 5 audits per IP per hour. Returns HTTP `429 Too Many Requests` with `Retry-After` header.
2. **Domain Cooldown**: 5-minute cooldown per normalized domain to prevent repeat hammering.
3. **Duplicate Detection**: Returns existing recent audit references when the same domain is requested within the cooldown window.
4. **Concurrency Protection**: Throttles active concurrent crawler fetches to prevent server exhaustion.
5. **SSRF Guard**: Blocks loopback, private IPv4/IPv6 ranges, link-local, cloud metadata (`169.254.169.254`), non-HTTP protocols, and re-validates every redirect hop.
6. **Crawler Guard**: Enforces 8s timeout, 2.5MB payload cap, and `text/html` validation.

---

## ⚙️ Environment Variables

Create `.env.local` based on `.env.example`:

```bash
# Google Gemini API Key (Optional: Server-Side AI Interpretation)
GEMINI_API_KEY=your_gemini_api_key_here
```

> **Note**: If `GEMINI_API_KEY` is omitted, Rankly will continue to perform full deterministic audits and will automatically generate rule-based fallback recommendations without failing.

---

## 🏗️ Tech Stack

| Layer | Technology | Version |
|-------|-----------|----------|
| Framework | Next.js (App Router) | 16.3.1 |
| Runtime | React | 19.2.8 |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x |
| Animation | Framer Motion | 13.x |
| Icons | Lucide React | 1.32.x |
| HTML Parser | Cheerio | 1.2.x |
| AI | Google Gemini (`@google/genai`) | 2.17.x |
| Testing | Vitest | 4.1.x |
| IDs | nanoid | 6.x |

---

## 🛠️ Local Development & Testing

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run Vitest test suites (28/28 unit & integration tests across 7 suites)
npx vitest run

# Type check
npx tsc --noEmit

# Build production application
npm run build
```

---

## 📄 License & Attribution

Created by **Yash Shinde** from **Nyxen** ([https://nyxen.in](https://nyxen.in) · [https://yashshinde.is-a.dev](https://yashshinde.is-a.dev)).
