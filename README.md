# ClientFlow

A focused, practical CRM workspace for freelancers, consultants, and small creative studios.

## Features

- **6-Stage Leads Pipeline**: Drag-and-drop Kanban board, weighted revenue forecasts, and one-click lead-to-client conversion.
- **360° Client Profiles**: Contact details, active projects, deliverables, notes, files, and communication timelines.
- **Follow-ups & Tasks**: Integrated scheduling and task tracking across leads, clients, and projects.
- **AI Drafting Assistant**: Generate tailored follow-up emails and proposal outlines via `/api/ai/draft`.
- **Multi-Currency Reporting**: Track revenue vs. targets across USD, GBP, EUR, and NGN with CSV export.

## Run Locally

**Prerequisites:** Node.js (v20+)

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and set `GEMINI_API_KEY` if you want to enable AI drafting:
   ```bash
   cp .env.example .env
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build
   npm start
   ```
