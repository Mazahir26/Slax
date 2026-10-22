# Slax

Slax is an open-source birthday reminder app. Add the birthdays you care about once, and Slax emails you before the big day so you never have to scramble for a gift or a plan again.

Live demo: [slax.vercel.app](https://slax.vercel.app)

## Contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Requirements](#requirements)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Auth flow and data model](#auth-flow-and-data-model)
- [Data notes / migration](#data-notes--migration)
- [Reminder schedule and timezone](#reminder-schedule-and-timezone)
  - [Delivery failure semantics](#delivery-failure-semantics)
- [Cron setup](#cron-setup)
- [Deployment](#deployment)
- [Scripts](#scripts)
- [Found a bug](#found-a-bug)
- [License](#license)
- [Thank you](#thank-you)

## Features

- **Email reminders** — one email per local day when birthdays are due, covering today, tomorrow and the next three days.
- **Day-of reminders** — birthdays that fall today are included in the same email, so nothing slips through.
- **Timezone-aware scheduling** — reminders go out shortly after your local midnight, not at a fixed server time.
- **Self-birthday email** — your own birthday triggers a separate happy-birthday email to your account address.
- **Plain-text alternatives** — every email also includes a text part for clients that block HTML.
- **Multi-device support** — sign in from as many devices as you like; there is no device limit.
- **Dark mode** — follows your system preference and can be toggled manually.
- **Responsive UI** — works on phones, tablets and desktops.
- **No ads, free forever** — the project is open source and MIT licensed.

## Tech stack

- [Next.js 16](https://nextjs.org/) (Pages Router, `pages/`)
- [React 19](https://react.dev/)
- [Tailwind CSS 4](https://tailwindcss.com/) with [shadcn/ui](https://ui.shadcn.com/) components and [lucide-react](https://lucide.dev/) icons
- [NextAuth.js v4](https://next-auth.js.org/) with passwordless email magic links
- [MongoDB](https://www.mongodb.com/) via the official Node.js driver and `@next-auth/mongodb-adapter`
- [Nodemailer](https://nodemailer.com/) for transactional email
- [Vercel](https://vercel.com/) for hosting (any Node.js host works)

The app does **not** use Postgres. All persistence is MongoDB.

## Requirements

- **Node.js >= 20.9** (22 or 24 LTS recommended; see `engines` in `package.json`)
- A **MongoDB** database (MongoDB Atlas has a free tier)
- An **SMTP** account for outgoing email. With Gmail, enable two-factor authentication and create an [App Password](https://support.google.com/accounts/answer/185833) — do not use your normal password.

## Getting started

```bash
git clone https://github.com/Mazahir26/Slax.git
cd Slax
npm install
cp .env.example .env.local
# edit .env.local and fill in the required values
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

You can replace the logo in [`public/logo.png`](public/logo.png) and change the app name in [`components/layout/navbar.tsx`](components/layout/navbar.tsx).

## Environment variables

Copy [`.env.example`](.env.example) to `.env.local` and fill in:

| Variable | Required | Description |
| --- | --- | --- |
| `MONGODB_URI` | Yes | `mongodb://` or `mongodb+srv://` connection string. |
| `NEXTAUTH_URL` | Production only | Public base URL of the app. Local development works without it on `http://localhost:3000`. Set it to `https://slax.vercel.app` for **Production** only and leave it unset for **Preview** so NextAuth v4 auto-detects each preview deployment's domain. |
| `NEXTAUTH_SECRET` | All environments | Random secret used to sign sessions and verification tokens (`openssl rand -base64 32`). Set a value for Production, Preview and local development. |
| `EMAIL_SERVER_HOST` | Yes | SMTP host, for example `smtp.gmail.com`. |
| `EMAIL_SERVER_PORT` | Yes | SMTP port, for example `465`. Port `465` uses implicit TLS; other ports negotiate STARTTLS. |
| `EMAIL_SERVER_USER` | Yes | SMTP username and the `From:` address for sign-in and reminder emails. |
| `EMAIL_SERVER_PASSWORD` | Yes | SMTP password or Gmail app password. |
| `key` | Yes for reminders | Shared secret that authorizes the reminder request. |
| `NEXT_PUBLIC_SITE_URL` | Optional | Canonical origin used by `/robots.txt`, `/sitemap.xml` and email links. Takes precedence over `NEXTAUTH_URL`; falls back to the preview deployment URL on Vercel Preview, then `https://slax.vercel.app`. Set it only for Production if you want a fixed canonical origin. |

`.env.local` and other local env files are git-ignored. Never commit real credentials.

## Auth flow and data model

1. A visitor enters their email on `/signup`.
2. NextAuth creates a verification token and emails a magic link through your SMTP account. The link is valid for **12 hours**.
3. Following the link signs the user in and, on first use, sends them to onboarding to add their own birthday.
4. Sessions use JWT cookies, so no session state is required on the server.

MongoDB collections:

- `auth.users`, `auth.accounts`, `auth.verification_tokens` — managed by the NextAuth MongoDB adapter.
- `auth.sessions` — not used for session state (sessions are JWTs in cookies); it is only touched as a best-effort cleanup when an account is deleted.
- `Data.reminders` — birthday records (`name`, `date`, `user`, `isUser`).
- `Data.email_deliveries` — one claim per user / local day / email kind (`sending`, `sent` or `failed`). Used to make reminder runs at-most-once. The collection and its indexes are created automatically on first use.

## Data notes / migration

- Birthdays are stored in `Data.reminders`. Legacy records written as a BSON `Date` are still read correctly and are interpreted in the user's stored timezone, falling back to **Asia/Kolkata** for users without one. New records are stored as date-only strings in `YYYY-MM-DD` form; those are civil dates and are never timezone-shifted.
- **Timezone backfill is automatic.** Accounts created before timezone support have no `timezone` field and keep working with the **Asia/Kolkata** default; no migration is required. When an existing user opens the dashboard, the app stores their browser timezone once and shows a “Timezone updated” toast. An existing `timezone` value is never overwritten.
- **Delivery records are automatic.** `Data.email_deliveries` and its indexes are created the first time the reminder endpoint runs. You do not need to create the collection or run any migration script.
- **Self-birthday index:** before the unique partial index on `{ user: 1 }` where `isUser: true` can be built, remove any duplicate legacy self-birthday rows for the same user. Run this once against the `Data` database in `mongosh`:

  ```js
  db.reminders
    .aggregate([
      { $match: { isUser: true } },
      { $group: { _id: "$user", ids: { $push: "$_id" }, count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } },
    ])
    .forEach(({ ids }) => {
      // Keep the newest row (highest ObjectId) for each user.
      ids.sort((a, b) => b.toString().localeCompare(a.toString()));
      db.reminders.deleteMany({ _id: { $in: ids.slice(1) } });
    });
  ```

  The app creates the index automatically on the next self-birthday write, or you can create it explicitly:

  ```js
  db.reminders.createIndex(
    { user: 1 },
    {
      unique: true,
      partialFilterExpression: { isUser: true },
      name: "unique_user_self_birthday",
    }
  );
  ```

- **Concurrent first sign-ins:** the MongoDB adapter does not create a unique index on `auth.users.email`. Add one to prevent two concurrent first sign-ins from creating duplicate users (resolve any existing duplicates first):

  ```js
  // In the `auth` database.
  db.users.createIndex(
    { email: 1 },
    { unique: true, name: "unique_user_email" }
  );
  ```

## Reminder schedule and timezone

- Reminders are triggered **hourly** by your external scheduler (see [Cron setup](#cron-setup)). The first run after a user's local midnight sends that day's email, so a reminder can arrive up to about **one hour after local midnight**.
- Each account stores an IANA timezone (for example `Europe/Berlin`) in its `timezone` field, and reminder matching uses that timezone.
- Accounts created before timezone support have no `timezone` field. They keep working with the **Asia/Kolkata** fallback and require no migration.
- The first time an existing user opens the dashboard, Slax stores their browser timezone once and shows a **“Timezone updated”** toast. Users who already have a timezone are not updated again, so an explicitly stored value is never overwritten.
- The reminder email is selected per user as the **today**, **tomorrow**, **upcoming** (two to three days ahead) or **mixed** variant when several cases apply. The account owner's own birthday triggers a separate **self-birthday email** on the day itself. Every variant includes a **plain-text alternative** to the HTML body.
- A **February 29** birthday is observed on **February 28** in non-leap years, so leap-day birthdays still get reminders every year.
- **Idempotency:** each user receives at most one reminder email and at most one self-birthday email per **local calendar day** (once per user, per day, per email kind). Claims are recorded in `Data.email_deliveries` before sending, so running the job every 5 minutes, hourly or daily is safe: runs that find an existing claim skip that user. See [Delivery failure semantics](#delivery-failure-semantics) for how failures are handled.

### Delivery failure semantics

Slax is **at-most-once by default**, not exactly-once. Raw SMTP cannot prove whether a message was accepted when the connection drops mid-conversation, so the guarantees are deliberately asymmetric: when in doubt, the claim is kept and an email may be missed rather than sent twice.

- **All claims are acquired before the first SMTP send.** If acquiring any claim fails, the claims acquired by that run are released (best effort) and the endpoint returns `500` without starting a send.
- **Definite pre-delivery failures** — `EAUTH`, `EENVELOPE`, `EMESSAGE`, `EDNS`, `ENOTFOUND`, `EAI_AGAIN`, `EPROTO` — mean the message was never handed to the server. The claim is released, so the next hourly run retries it.
- **Ambiguous or unknown SMTP outcomes** — `ETIMEDOUT`, `ESOCKET`, `ECONNRESET`, `EPIPE`, `ECONNECTION` and anything unrecognised — may mean the server accepted the message before the connection failed. `ECONNECTION` is included because nodemailer can also emit it when the connection closes during a pending send, after the server may already have accepted the message. The claim is kept with status `failed` (plus a sanitized error code) and is **not retried that local day**. This prevents duplicates at the cost of a possible missed email.
- **Sent but not recorded:** if `markDeliverySent` fails, the claim stays as `sending`, so the message is not retried and not duplicated.
- Every settled task is finalized independently; one database error never skips the remaining tasks.
- A run with any send failure or any finalization failure returns **`502`** with `failed`, `finalizeFailed`, `skipped`, `noOfMails` and `UserBirthdays` counts. A clean run returns `200`.

## Cron setup

Slax does not depend on a specific scheduler. Create an hourly HTTP cron job at [cron-job.org](https://cron-job.org), [Upstash](https://upstash.com), or any HTTP scheduler you prefer.

Configure the job to send:

```http
POST https://slax.vercel.app/api/sendEmail
Content-Type: application/json

{ "key": "<value of key from .env.local>" }
```

Notes:

- Choose a scheduler whose request timeout is long enough for the endpoint.
- Enable the scheduler's failure notifications if available.
- The `key` body value must match the `key` environment variable. A missing or wrong key returns `401`.
- Hourly is the default cadence. Running every 15 minutes is also safe: delivery claims are recorded per user, local day and email kind, so runs that find an existing claim skip that user.
- If one or more sends fail, or a sent/failed delivery cannot be finalized in MongoDB, the endpoint returns **`502`** with counts of sent, failed, finalization-failed and skipped emails. A run with nothing to send returns `200`.

## Deployment

1. Push the repository to GitHub.
2. Import it into [Vercel](https://vercel.com/new).
3. Add the variables from [`.env.example`](.env.example) in the project settings.
4. Set `NEXTAUTH_URL=https://slax.vercel.app` for **Production** only. Leave `NEXTAUTH_URL` unset for **Preview** so NextAuth v4 auto-detects each preview deployment's domain from Vercel's system environment.
5. Set `NEXT_PUBLIC_SITE_URL` only for **Production** if you want a fixed canonical origin. Preview deployments automatically use `VERCEL_BRANCH_URL` (the stable per-branch domain) and fall back to `VERCEL_URL` (the per-deployment domain).
6. Set `NEXTAUTH_SECRET` for all environments, including Preview.
7. Ensure Vercel **System Environment Variables** are enabled in the project settings. NextAuth's automatic URL detection for Preview depends on the system-provided `VERCEL` and `VERCEL_URL` variables.
8. After deploy, create the external hourly cron job as described in [Cron setup](#cron-setup).

Any platform that can run `npm run build` and `npm run start` also works. No Postgres database or other service is required.

`/robots.txt` and `/sitemap.xml` are generated at request time and use the canonical origin: `NEXT_PUBLIC_SITE_URL`, then `NEXTAUTH_URL`, then the Vercel Preview origin (`VERCEL_BRANCH_URL` or `VERCEL_URL` when `VERCEL_ENV=preview`), then a loopback host during local development, then `https://slax.vercel.app`. In production the request `Host` header never changes those URLs, and Preview deployments never fall back to the production origin unless Vercel's system environment is unavailable.

### Dependency audit

`npm audit --omit=dev` reports **0 vulnerabilities** in production dependencies. A full `npm audit` currently flags advisories in the dev-only `eslint-config-next` → `micromatch` → `braces` chain. They are not shipped at runtime, and the suggested fix downgrades `eslint-config-next` to a breaking older major, so it is intentionally left until Next.js updates the dependency.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server. |
| `npm run build` | Create a production build. |
| `npm run start` | Serve the production build. |
| `npm run lint` | Run ESLint. |
| `npm run typecheck` | Generate Next.js route types, then run TypeScript without emitting files. |

## Found a bug

- Open an issue on [GitHub](https://github.com/Mazahir26/Slax/issues).
- Or [contact the author](http://mazahir26.github.io/).

## License

This project is licensed under the MIT License — see [LICENSE.md](LICENSE.md) for details.

## Thank you

Thanks for checking out the project. If you build your own version, the author would love to see it — reach out via [mazahir26.github.io](http://mazahir26.github.io/) or the repository.

[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/mazahir)
