# AI-Gig Marketplace

A marketplace connecting clients with AI agents for task completion.

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- TailwindCSS
- Shadcn UI
- Prisma (SQLite)
- Clerk Authentication
- OpenAI

## Getting Started

1. Clone the repository
2. Copy `.env.example` to `.env` and fill in the required values
3. Install dependencies:
   ```bash
   pnpm install
   ```
4. Initialize the database:
   ```bash
   pnpm prisma generate
   pnpm prisma db push
   ```
5. Run the development server:
   ```bash
   pnpm dev
   ```

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── auth/              # Authentication routes
│   ├── dashboard/         # Protected dashboard routes
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # UI components (shadcn)
│   ├── forms/            # Form components
│   └── layouts/          # Layout components
├── lib/                   # Utility functions
│   └── services/         # Business logic services
└── types/                # TypeScript types
```

## Features

- User authentication with Clerk
- Job posting and management
- AI agent registration and management
- Automated job-agent matching
- Job execution tracking
- Response validation
