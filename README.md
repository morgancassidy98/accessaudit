# Audit Ally

Audit Ally is an authenticated Next.js app for tracking and reporting WCAG accessibility audits across multiple websites and pages. It combines guided manual testing with Lighthouse accessibility checks, page discovery, contrast checking, and exportable reports.

## Features

- Create and manage accessibility audits for a website or digital product
- Discover pages from a sitemap, sitemap index, robots.txt, or homepage links
- Review discovered pages and add them individually or in bulk
- Add pages manually and track their status over time
- Review a WCAG checklist grouped by criterion and level
- Mark criteria as pass, fail, N/A, or untested with severity and notes
- Use keyboard shortcuts while working through the checklist
- Run automated Lighthouse accessibility scans for individual pages
- View Lighthouse scores and related audit details for matching criteria
- Check foreground/background color contrast against WCAG thresholds
- Generate a report summary and download a PDF report
- Copy a public report link protected by a random share token
- Sign in with GitHub or Google

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Prisma ORM
- PostgreSQL
- Google PageSpeed Insights Lighthouse accessibility checks
- Vitest

## Project Structure

- `app/` — App routes and pages
- `components/` — UI for dashboards, checklists, reports, and contrast tools
- `lib/` — shared logic and WCAG criteria data
- `prisma/` — Prisma schema and migrations
- `public/` — static assets

## Requirements

- Node.js 20+
- npm
- PostgreSQL database

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env.local` file in the project root. Add your PostgreSQL connection string and authentication settings:

```bash
PRISMA_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/audit_ally?schema=public"
NEXTAUTH_SECRET="replace-with-a-long-random-secret"
NEXTAUTH_URL="http://localhost:3000"
GITHUB_ID="your-github-oauth-client-id"
GITHUB_SECRET="your-github-oauth-client-secret"
GOOGLE_CLIENT_ID="your-google-oauth-client-id"
GOOGLE_CLIENT_SECRET="your-google-oauth-client-secret"
```

Replace the example values with your own credentials. Configure the GitHub and Google OAuth callback URLs for your local and deployed environments. Environment files are ignored by Git and should never be committed.

For Lighthouse scans, optionally add a server-only PageSpeed API key:

```bash
PAGESPEED_API_KEY="your-pagespeed-api-key"
```

3. Generate Prisma Client and apply migrations:

```bash
npm run db:generate
npm run db:migrate
```

4. Start the app:

```bash
npm run dev
```

5. Open http://localhost:3000 in your browser.

## Available Scripts

```bash
npm run dev        # Start the Next.js dev server
npm run build      # Build production assets
npm run start      # Start the production server
npm run lint       # Run ESLint
npm test           # Run the Vitest test suite
npm run db:migrate # Apply Prisma migrations
npm run db:generate # Generate Prisma Client
npm run db:studio  # Open Prisma Studio
npm run db:reset   # Reset the database and rerun migrations
```

## Typical Workflow

1. Sign in with GitHub or Google.
2. Create a new audit with its name and base website URL.
3. Use automatic page discovery. Audit Ally checks sitemap sources first and falls back to same-origin homepage links when no sitemap is available.
4. Review the discovered candidates and select individual pages or all candidates to add. You can also add a page manually.
5. Open a page to evaluate WCAG criteria one by one, using the guided instructions and optional keyboard shortcuts.
6. Run a Lighthouse scan for a page when the target is publicly accessible.
7. Record findings, severity, notes, and status for each criterion.
8. Review the report, download a PDF, or copy a tokenized public share link.

## Database Notes

This project uses Prisma with PostgreSQL. The schema is defined in `prisma/schema.prisma` and the connection string is loaded from `PRISMA_DATABASE_URL`.

Use `npm run db:migrate` during development and `npx prisma migrate deploy` in production. The project includes migrations for authentication, public share tokens, and persistent page ordering.

## Notes

The app is designed for accessibility review workflows rather than a fully automated scan-only solution. Lighthouse scans supplement, but do not replace, manual testing. Automatic page discovery is intentionally limited to same-origin URLs and up to 100 candidates per discovery request.
