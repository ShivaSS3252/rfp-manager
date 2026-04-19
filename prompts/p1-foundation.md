# Prompt 1 — Foundation

> Paste this into Claude Code to scaffold the entire project.

---

Read `CLAUDE.md` and `specs/00-data-models.md` and `specs/06-ui-ux.md` carefully before writing any code.

Set up the complete rfp-manager project with this structure:

## Backend (Node.js + Express + MongoDB)

1. Initialize `/backend` with package.json. Install:
   - express, mongoose, cors, dotenv, nodemailer, imap-simple, node-cron

2. Create `/backend/.env.example` from the variables in CLAUDE.md

3. Create `/backend/server.js`:
   - Express app on PORT from env
   - Connect to MongoDB via MONGO_URI
   - CORS enabled for CLIENT_URL
   - Mount routes (placeholder 200 responses for now)
   - Health check: GET /health → { status: "ok" }

4. Create Mongoose models from specs/00-data-models.md:
   - `/backend/models/RFP.js`
   - `/backend/models/Vendor.js`
   - `/backend/models/Proposal.js`

5. Create empty service files:
   - `/backend/services/aiService.js` → export placeholder functions
   - `/backend/services/emailService.js` → export placeholder functions

6. Create route files with placeholder responses:
   - `/backend/routes/rfps.js`
   - `/backend/routes/vendors.js`
   - `/backend/routes/proposals.js`

7. Create `/backend/seed/vendors.js` with the 3 seed vendors from specs/02-vendor-management.md
   and a script to run it: `npm run seed`

## Frontend (React + Vite + TailwindCSS)

1. Initialize `/frontend` with Vite React template. Install:
   - tailwindcss, react-router-dom, axios

2. Set up Tailwind config

3. Create the app shell from specs/06-ui-ux.md:
   - `/frontend/src/App.jsx` with react-router Routes
   - `/frontend/src/components/Sidebar.jsx` (dark sidebar, navigation links)
   - `/frontend/src/components/Layout.jsx` (sidebar + content wrapper)

4. Create placeholder pages (just a title and "coming soon" text for now):
   - `src/pages/Dashboard.jsx`
   - `src/pages/RFPList.jsx`
   - `src/pages/RFPCreate.jsx`
   - `src/pages/RFPDetail.jsx`
   - `src/pages/ComparisonView.jsx`
   - `src/pages/VendorList.jsx`
   - `src/pages/VendorDetail.jsx`

5. Create shared components:
   - `src/components/StatusBadge.jsx`
   - `src/components/LoadingSpinner.jsx`
   - `src/components/PageHeader.jsx`
   - `src/components/EmptyState.jsx`

6. Create `/frontend/src/api/index.js` — axios instance pointing to http://localhost:5000

## After scaffolding:
- Run both apps and confirm no errors
- The sidebar should render with all nav links
- /health endpoint should return 200
- All placeholder pages should be accessible via routes
