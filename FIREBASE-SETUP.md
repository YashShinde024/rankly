# Rankly — Firebase Setup & Configuration

## 1. Firebase project

Project: `rankly-752d1`
Auth providers enabled: **Google**, **Email/Password**.

## 2. Environment variables

### Client (safe to expose — Firebase client config is public by design)

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=rankly-752d1.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=rankly-752d1
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=rankly-752d1.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

Optional:

```
# Shown on the contact page as the direct support address (mailto fallback)
NEXT_PUBLIC_SUPPORT_EMAIL=support@nyxen.in
```

### Server (NEVER use NEXT_PUBLIC_ for these)

Firebase Console → Project settings → Service accounts → **Generate new private key**.

```
FIREBASE_PROJECT_ID=rankly-752d1
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@rankly-752d1.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"
```

> When pasting into Vercel, keep the literal `\n` sequences — `src/lib/firebase/admin.ts`
> converts them to real newlines automatically.

Never commit service-account JSON files. `.gitignore` already covers `*serviceAccount*.json`.

## 3. Authorized domains (Authentication → Settings → Authorized domains)

- `localhost` (development)
- `rankly.nyxen.in` (production)
- `<your-vercel-preview-domain>.vercel.app` if you want sign-in on previews

Google sign-in and email verification links only work on authorized domains.

## 4. Firestore data model

| Collection        | Purpose | Written by |
|-------------------|---------|------------|
| `users/{uid}`     | Profile: uid, email, nickname, photoURL, provider, createdAt, updatedAt, lastLoginAt | Admin SDK (create), owner (limited field updates) |
| `audits/{auditId}`| Full report + index card + scores + ownership (`userId`) + visibility (`public`/`private`) + `analysisType`, `websiteType`, `nextAllowedAt`; guest docs add `expiresAt` (+7 days) | Admin SDK only |
| `domains/{hostname}` | 7-day canonical-domain cooldown source of truth (`latestAuditId`, `lastAuditAt`, `nextAllowedAt`) | Admin SDK only |
| `guests/{guestId}`   | Guest free-analysis consumption flag (signed httpOnly cookie identity) | Admin SDK only |

Document ID for audits is the public report code (`RKL-XXXXXX`), so report URLs are stable:
`/audit/RKL-A1B2C3`.

## 5. Deploy security rules

```bash
npm i -g firebase-tools
firebase login
firebase deploy --only firestore:rules
```

Rules enforce:

- users read/update only their own profile (limited fields; create/delete server-only)
- audits readable when `visibility == "public"` (and not expired) or owned by the requester;
  no client writes at all — scores, ownership, cooldowns are server-generated
- `guests/*` fully opaque to clients

## 6. Guest report TTL (7-day expiry)

Guest audit documents carry an `expiresAt` timestamp. Two layers apply:

1. **Read-time enforcement** — expired guest reports return 404 immediately, even before
   physical deletion.
2. **Firestore TTL policy (recommended)** — in Firebase Console → Firestore → Lifecycles/TTL,
   enable a TTL policy on the `expiresAt` field of the `audits` collection.

> Important: Firestore TTL deletion is **asynchronous**. Documents may persist up to ~24–72h
> past their expiration timestamp before physical removal. The read-time check guarantees
> correctness regardless of cleanup timing.

Authenticated users' reports do not carry `expiresAt` and are retained until a future
retention policy changes this.

## 7. Guest usage enforcement

- A signed, httpOnly cookie (`rankly_guest`) identifies the browser.
- The audit API checks `guests/{id}.auditUsed` server-side before running any new analysis.
- The flag is set **only after** the analysis succeeds AND the report is verified in Firestore.
- Failed requests, invalid URLs, persistence failures never consume the free analysis.
- Clearing cookies/localStorage does not reset the server-side record tied to that browser,
  and cannot unlock another browser's limit.

## 8. Email verification

- Email/password sign-ups receive a verification email and land on a dedicated
  "Check your inbox" screen with resend cooldown (60s).
- Sign-in with an unverified email/password account routes to the same verification state.
- Google accounts are trusted as verified per Firebase's identity state.

## 9. Legacy storage migration

Audits created before Firebase integration live in Vercel Blob / local `.data`.
Read paths fall back to the legacy store, so existing report URLs keep working until they
naturally expire under the old 30-day retention.
