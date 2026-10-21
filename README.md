# Slax

Slax is an open-source birthday reminder app. Add the birthdays you care about once, and Slax emails you before the big day so you never have to scramble for a gift or a plan again.

Live demo: [slax.studio](https://slax.studio)

## Contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Requirements](#requirements)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Auth flow and data model](#auth-flow-and-data-model)
- [Data notes / migration](#data-notes--migration)
- [Reminder schedule and timezone](#reminder-schedule-and-timezone)
- [Cron setup](#cron-setup)
- [Deployment](#deployment)
- [Scripts](#scripts)
- [Found a bug](#found-a-bug)
- [License](#license)
- [Thank you](#thank-you)

## Features

- **Email reminders** — everyone sharing an account gets an email listing upcoming birthdays, three days ahead of time.
- **Day-of reminders** — birthdays that fall today are included in the same email, so nothing slips through.
- **Self-birthday email** — your own birthday triggers a separate happy-birthday email to your account address.
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
| `NEXTAUTH_URL` | In production | Public base URL of the app. Optional for local development on `http://localhost:3000`; required in production. |
| `NEXTAUTH_SECRET` | Yes in production | Random secret used to sign sessions and verification tokens (`openssl rand -base64 32`). |
| `EMAIL_SERVER_HOST` | Yes | SMTP host, for example `smtp.gmail.com`. |
| `EMAIL_SERVER_PORT` | Yes | SMTP port, for example `465`. Port `465` uses implicit TLS; other ports negotiate STARTTLS. |
| `EMAIL_SERVER_USER` | Yes | SMTP username and the `From:` address for sign-in and reminder emails. |
| `EMAIL_SERVER_PASSWORD` | Yes | SMTP password or Gmail app password. |
| `key` | Yes for reminders | Shared secret that authorizes the reminder cron request. |
| `NEXT_PUBLIC_SITE_URL` | Optional | Canonical origin used by `/robots.txt` and `/sitemap.xml`. Takes precedence over `NEXTAUTH_URL`; falls back to `https://slax.studio`. |

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

## Data notes / migration

- Birthdays are stored in `Data.reminders`. Legacy records written as a BSON `Date` are still read correctly and are interpreted in **Asia/Kolkata**. New records are stored as date-only strings in `YYYY-MM-DD` form.
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

- All reminder matching runs in **Asia/Kolkata (IST)** regardless of where the user lives.
- The daily reminder email is sent **three days before** each birthday and also includes birthdays happening **today**.
- The account owner's own birthday triggers a **self-birthday email** on the day itself.
- A **February 29** birthday is observed on **February 28** in non-leap years, so leap-day birthdays still get reminders every year.

## Cron setup

The reminder endpoint is `POST /api/sendEmail`. Configure a scheduler (GitHub Actions, cronhub, cron-job.org, or any HTTP cron service) to call it **once a day**:

```http
POST https://your-domain.com/api/sendEmail
Content-Type: application/json

{ "key": "<value of key from .env.local>" }
```

Notes:

- The `key` body value must match the `key` environment variable.
- A missing or wrong key returns `401`.
- If one or more recipients fail, the endpoint returns **`502`** with counts of sent and failed emails so the scheduler can surface or retry the run. A run with nothing to send returns `200`.
- Vercel's built-in Cron sends `GET` requests, so use an external scheduler that can send a `POST` with a JSON body (for example GitHub Actions or cron-job.org).

## Deployment

1. Push the repository to GitHub.
2. Import it into [Vercel](https://vercel.com/new).
3. Add every variable from [`.env.example`](.env.example) in the project settings. Set `NEXTAUTH_URL` to your production URL (for example `https://slax.studio`).
4. Deploy, then point your cron scheduler at `/api/sendEmail`.

Any platform that can run `npm run build` and `npm run start` also works. No Postgres database or other service is required.

`/robots.txt` and `/sitemap.xml` are generated at request time and always use the canonical origin: `NEXT_PUBLIC_SITE_URL`, then `NEXTAUTH_URL`, then `https://slax.studio`. In production the request `Host` header never changes those URLs.

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
