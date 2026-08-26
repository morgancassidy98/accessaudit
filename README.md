# Audit Ally

Audit Ally is a Next.js app for tracking and reporting WCAG accessibility audits across multiple pages and audits. It helps teams capture findings for each WCAG criterion, run Lighthouse-based accessibility checks, review contrast issues, and export a shareable audit report.

## Features

- Create and manage accessibility audits for a website or digital product
- Add pages to each audit and track their status over time
- Review a WCAG checklist grouped by criterion and level
- Mark criteria as pass, fail, N/A, or untested with notes
- Run automated Lighthouse accessibility scans for individual pages
- View Lighthouse scores and related audit details for matching criteria
- Check foreground/background color contrast against WCAG thresholds
- Generate a report summary and exportable report output
- Share completed audits via a public report page

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Prisma ORM
- PostgreSQL
- Lighthouse PageSpeed accessibility checks

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

2. Create a `.env` file in the project root and add your database URL:

```bash
PRISMA_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/audit_ally?schema=public"
```

> Replace the example value with your own PostgreSQL connection string.

3. Generate Prisma Client and apply the schema:

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
npm run db:migrate # Apply Prisma migrations
npm run db:generate # Generate Prisma Client
npm run db:studio  # Open Prisma Studio
npm run db:reset   # Reset the database and rerun migrations
```

## Typical Workflow

1. Create a new audit from the dashboard.
2. Add the base website URL and pages to review.
3. Open an audit page to evaluate WCAG criteria one by one.
4. Use Lighthouse scans when available to supplement manual review.
5. Record findings, notes, and status for each criterion.
6. Review the report page to summarize compliance and export results.

## Database Notes

This project uses Prisma with PostgreSQL. The schema is defined in `prisma/schema.prisma` and the connection string is loaded from `PRISMA_DATABASE_URL`.

## Notes

The app is designed for accessibility review workflows rather than a fully automated scan-only solution. It is best used as a guided audit tracker for manual testing, automated checks, and summary reporting.
