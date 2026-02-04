# German Mastery

A high-fidelity blended learning platform that syncs classroom instruction with
gamified practice. This repository contains the Phase 0–2.5 foundation:
data contract, design system, and a content seeding pipeline.

## Tech Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS + Framer Motion
- Supabase (PostgreSQL)
- Storybook for UI development

## Setup

```bash
npm install
```

Environment variables (local):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_URL` (or reuse `NEXT_PUBLIC_SUPABASE_URL`)
- `SUPABASE_SERVICE_ROLE_KEY`

## Scripts

```bash
npm run dev
npm run lint
npm run type-check
npm run storybook
npm run seed -- --file content/lessons.csv --unit <unit-uuid>
npm run seed:dry -- --file content/lessons.csv
```

## Content Pipeline

See `content/README.md` for the CSV template and rules.
