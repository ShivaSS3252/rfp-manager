# RFP Manager

An AI-powered Request for Proposal (RFP) Management System for procurement managers. It automates the full RFP lifecycle: create → select vendors → email → receive and parse responses → AI-scored comparison → award.

---

## Tech Stack

| Layer        | Choice                              |
|--------------|-------------------------------------|
| Frontend     | React 18 + Vite + Tailwind CSS v4   |
| Backend      | Node.js + Express                   |
| Database     | MongoDB + Mongoose                  |
| AI           | Groq API (`llama-3.3-70b-versatile`)|
| Email Send   | Nodemailer + Gmail SMTP             |
| Email Recv   | imap-simple (IMAP polling)          |
| Scheduler    | node-cron (5-min inbox poll)        |

---

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Gmail account with an **App Password** (2FA required)
- Groq API key — free at [console.groq.com](https://console.groq.com)

---

## Project Setup

### 1. Clone and install

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure environment

Copy the example env file and fill in your values:

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
# MongoDB
MONGO_URI=mongodb://localhost:27017/rfp-manager

# Groq AI (free at console.groq.com)
GROQ_API_KEY=gsk_...

# Gmail SMTP (for sending RFPs)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=you@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx   # Gmail App Password

# Gmail IMAP (for receiving vendor replies)
IMAP_HOST=imap.gmail.com
IMAP_PORT=993
IMAP_USER=you@gmail.com
IMAP_PASS=xxxx xxxx xxxx xxxx   # Same App Password

# App
PORT=5000
CLIENT_URL=http://localhost:5173
```

> **Gmail App Password**: Go to Google Account → Security → 2-Step Verification → App Passwords. Generate one for "Mail".

### 3. Seed sample vendors

```bash
cd backend
npm run seed
```

### 4. Run the app

```bash
# Terminal 1 — backend
cd backend
npm run dev

# Terminal 2 — frontend
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## User Flow

1. **Create RFP** — describe procurement in plain English; AI extracts structured fields
2. **Save & Send** — pick vendors from your list, send RFP emails in one click
3. **Receive Proposals** — inbox is polled every 5 minutes; vendor replies are parsed by AI
4. **Compare & Award** — AI scores proposals on price / delivery / completeness; award to winner

---

## API Documentation

All responses follow this shape:
```json
{ "success": true,  "data": {}, "message": "..." }
{ "success": false, "error": "...", "message": "..." }
```

### RFPs

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/rfps/parse` | AI-parse raw text → structured RFP (does not save) |
| `GET`  | `/api/rfps` | List all RFPs |
| `POST` | `/api/rfps` | Save an RFP |
| `GET`  | `/api/rfps/:id` | Get single RFP |
| `PATCH`| `/api/rfps/:id` | Update RFP fields |
| `DELETE`| `/api/rfps/:id` | Delete RFP |
| `POST` | `/api/rfps/:id/send` | Send RFP emails to selected vendors |
| `GET`  | `/api/rfps/:id/compare` | Get comparison data (triggers AI scoring if needed) |
| `POST` | `/api/rfps/:id/score` | Re-run AI scoring |
| `PATCH`| `/api/rfps/:id/award` | Close RFP (mark awarded) |

**POST /api/rfps/parse** request:
```json
{ "rawInput": "I need 20 laptops 16GB RAM, budget $40k, delivery in 30 days, net 30 payment" }
```

**POST /api/rfps/:id/send** request:
```json
{ "vendorIds": ["64a...", "64b..."] }
```

### Vendors

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/api/vendors` | List all active vendors |
| `POST` | `/api/vendors` | Create vendor |
| `GET`  | `/api/vendors/:id` | Get vendor |
| `PATCH`| `/api/vendors/:id` | Update vendor |
| `DELETE`| `/api/vendors/:id` | Soft-delete vendor |

**POST /api/vendors** request:
```json
{
  "name": "Acme Corp",
  "email": "vendor@acme.com",
  "contactPerson": "Jane Smith",
  "phone": "555-1234",
  "category": ["laptops", "hardware"]
}
```

### Proposals

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/api/proposals?rfpId=:rfpId` | List proposals for an RFP |
| `GET`  | `/api/proposals/:id` | Get single proposal |
| `POST` | `/api/proposals/parse-manual` | Trigger inbox poll immediately |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/health` | Server status + Groq key check |
| `GET`  | `/api/test-ai` | Test Groq API connectivity |

---

## Decisions & Assumptions

**AI Provider — Groq instead of Anthropic**
The project spec referenced Anthropic Claude, but Groq's free tier (`llama-3.3-70b-versatile`) provides the same structured-extraction capability with no quota limits for development. All AI calls are isolated in `aiService.js` — swapping providers requires changing only that file.

**Soft-delete for vendors**
Vendors are never hard-deleted (`deleted: true` flag). This preserves historical proposal data that references vendor IDs. The GET /api/vendors endpoint filters them out automatically.

**IMAP polling vs webhooks**
Gmail doesn't support push webhooks without a verified domain. Polling every 5 minutes via node-cron is a practical workaround for a single-user procurement tool. The "Check for New Proposals" button in the UI triggers an immediate poll for demo purposes.

**No authentication**
This is a single-user internal tool. Adding auth (JWT/sessions) was out of scope. In production, basic HTTP auth or a session middleware should be added.

**Email matching strategy**
Incoming vendor emails are matched to RFPs by checking if the email subject contains the RFP title. This is intentional and simple — the outgoing email subject is `"Request for Proposal — {rfp.title}"`, so vendor reply subjects usually contain the RFP title.

---

## AI Tools Usage

The project uses Groq's `llama-3.3-70b-versatile` model for three tasks:

1. **RFP Parsing** (`parseRFPFromText`) — converts free-text procurement descriptions into structured JSON with title, items, budget, deadline, payment terms, and warranty.

2. **Proposal Parsing** (`parseVendorProposal`) — extracts pricing, delivery timeline, payment terms, and warranty from unstructured vendor reply emails. Returns a `confidence` score (0–1) reflecting how complete the response is.

3. **Proposal Scoring** (`scoreProposals`) — evaluates all proposals against the RFP requirements. Scores each on price (40%), delivery (35%), and completeness (25%). Returns per-proposal scores and a natural-language recommendation with tradeoff analysis.

All prompts instruct the model to return only valid JSON. Responses are stripped of markdown fences and parsed with a regex fallback before `JSON.parse`.
