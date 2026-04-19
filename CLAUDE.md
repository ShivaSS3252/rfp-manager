# RFP Manager — Project Brain (CLAUDE.md)

> This file is the single source of truth for the entire project.
> Every prompt you write should reference this file first.
> When requirements change, update this file first, then re-prompt.

---

## Project Overview

An AI-powered RFP (Request for Proposal) Management System for a single procurement manager.
Streamlines: RFP creation → vendor selection → email sending → vendor response parsing → AI comparison.

---

## Tech Stack

| Layer       | Choice                        | Why                                      |
|-------------|-------------------------------|------------------------------------------|
| Frontend    | React 18 + Vite + TailwindCSS | Fast dev, modern, component-driven       |
| Backend     | Node.js + Express             | Simple REST API, good ecosystem          |
| Database    | MongoDB + Mongoose            | Flexible schema for unstructured RFP data|
| AI          | Anthropic Claude (claude-sonnet-4-6) | Best for structured extraction   |
| Email Send  | Nodemailer + Gmail SMTP       | Simple, free, reliable                   |
| Email Recv  | IMAP (imap-simple)            | Poll vendor reply inbox                  |

---

## Folder Structure

```
rfp-manager/
├── CLAUDE.md                  ← You are here (project brain)
├── specs/
│   ├── 00-data-models.md      ← All DB schemas
│   ├── 01-rfp-creation.md     ← Feature: create RFPs
│   ├── 02-vendor-management.md← Feature: manage vendors
│   ├── 03-email-sending.md    ← Feature: send RFPs
│   ├── 04-email-receiving.md  ← Feature: receive + parse responses
│   ├── 05-comparison.md       ← Feature: compare proposals
│   └── 06-ui-ux.md            ← UI layout, pages, components
├── prompts/
│   ├── p1-foundation.md       ← Prompt to scaffold project
│   ├── p2-rfp-feature.md      ← Prompt for RFP creation
│   ├── p3-vendor-feature.md   ← Prompt for vendor management
│   ├── p4-email-send.md       ← Prompt for email sending
│   ├── p5-email-recv.md       ← Prompt for email receiving
│   └── p6-comparison.md       ← Prompt for comparison view
├── frontend/                  ← React app (Vite)
└── backend/                   ← Express API
```

---

## Environment Variables (.env)

```env
# MongoDB
MONGO_URI=mongodb://localhost:27017/rfp-manager

# Anthropic AI
ANTHROPIC_API_KEY=

# Email (Gmail SMTP for sending)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=
EMAIL_PASS=          # Gmail App Password

# Email (IMAP for receiving)
IMAP_HOST=imap.gmail.com
IMAP_USER=
IMAP_PASS=
IMAP_PORT=993

# App
PORT=5000
CLIENT_URL=http://localhost:5173
```

---

## Golden Rules (Claude must follow these always)

1. **Never hardcode secrets** — always use process.env.*
2. **All AI calls go through `/backend/services/aiService.js`** — never call Anthropic directly from routes
3. **All email logic goes through `/backend/services/emailService.js`**
4. **Frontend never talks to MongoDB** — only through backend REST API
5. **Every route must have try/catch with proper error response**
6. **API responses always follow this shape:**
   ```json
   { "success": true, "data": {}, "message": "..." }
   { "success": false, "error": "...", "message": "..." }
   ```
7. **React components live in `/frontend/src/components/`**
8. **React pages live in `/frontend/src/pages/`**

---

## How to Use This System

### Making changes:
1. Update the relevant `specs/*.md` file with new requirements
2. Open the matching `prompts/p*.md` file
3. Run: `Read CLAUDE.md and specs/[filename].md, then implement the changes described`

### Adding a new feature:
1. Create `specs/0N-feature-name.md`
2. Create `prompts/pN-feature-name.md`
3. Reference both in this CLAUDE.md

---

## Current Status

- [x] Foundation scaffolded
- [x] Data models created
- [ ] RFP creation feature
- [ ] Vendor management feature
- [ ] Email sending feature
- [ ] Email receiving + parsing feature
- [ ] Comparison dashboard feature
- [ ] README written
