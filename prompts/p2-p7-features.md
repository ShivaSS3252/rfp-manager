# Prompt 2 — RFP Creation Feature

> Run this after Prompt 1 is done and the app is running.

---

Read `CLAUDE.md` and `specs/01-rfp-creation.md` carefully.

Implement the complete RFP creation feature:

**Backend:**
1. In `/backend/services/aiService.js`, implement `parseRFPFromText(rawInput)`:
   - Call Anthropic API using the exact prompt in specs/01-rfp-creation.md
   - Parse the JSON response
   - Return structured RFP data
   - Handle JSON parse errors gracefully

2. In `/backend/routes/rfps.js`, implement:
   - POST /api/rfps/parse — call aiService.parseRFPFromText, return structured data (don't save yet)
   - POST /api/rfps — validate and save to MongoDB, return saved doc
   - GET /api/rfps — return all RFPs sorted by createdAt desc
   - GET /api/rfps/:id — return single RFP with vendorIds populated
   - PATCH /api/rfps/:id — update any field

All routes must follow the response format in CLAUDE.md and have try/catch.

**Frontend:**
1. Implement `src/pages/RFPCreate.jsx`:
   - Large textarea for natural language input
   - "Generate RFP" button that calls POST /api/rfps/parse
   - Show LoadingSpinner while waiting
   - On success, show RFPPreviewCard below

2. Create `src/components/RFPPreviewCard.jsx`:
   - Display all extracted fields as editable inputs
   - "Save RFP" button → calls POST /api/rfps → redirects to /rfps/:id

3. Implement `src/pages/RFPList.jsx`:
   - Fetch and display all RFPs in a table
   - StatusBadge for each
   - Link each row to /rfps/:id
   - "+ New RFP" button links to /rfps/new

4. Implement `src/pages/RFPDetail.jsx` (partial — just show RFP fields for now):
   - Fetch RFP by id
   - Display all requirements in a clean card layout

Handle all error cases from specs/01-rfp-creation.md.

---

# Prompt 3 — Vendor Management Feature

> Run after Prompt 2 is working.

---

Read `CLAUDE.md` and `specs/02-vendor-management.md` carefully.

Implement the complete vendor management feature:

**Backend:**
1. In `/backend/routes/vendors.js`, implement all routes from specs/02-vendor-management.md:
   - GET /api/vendors
   - POST /api/vendors (with validation)
   - GET /api/vendors/:id
   - PATCH /api/vendors/:id
   - DELETE /api/vendors/:id (soft delete, add `deleted: true` to schema)

2. Verify the seed script in `/backend/seed/vendors.js` works: `npm run seed`

**Frontend:**
1. Implement `src/pages/VendorList.jsx`:
   - Fetch and display all vendors as cards
   - Each card: company name, email, contact person, category tags
   - "+ Add Vendor" button opens VendorForm

2. Create `src/components/VendorForm.jsx`:
   - Fields: name (required), email (required), contactPerson, phone, category (comma-separated input)
   - Works for both create and edit
   - Submit calls POST or PATCH depending on mode

3. Implement `src/pages/VendorDetail.jsx`:
   - Vendor profile display
   - "Edit" button opens VendorForm pre-filled
   - "Delete" button with ConfirmDialog

4. Update `src/components/Sidebar.jsx` vendor count badge if time permits.

---

# Prompt 4 — Email Sending Feature

> Run after Prompt 3 is working.

---

Read `CLAUDE.md` and `specs/03-email-sending.md` carefully.

Implement the RFP email sending feature:

**Backend:**
1. In `/backend/services/emailService.js`, implement:
   - `createTransporter()` — Nodemailer with Gmail SMTP from env vars
   - `formatRFPEmail(rfp, vendor)` — returns { subject, html, text } using the template in spec 03
   - `sendRFPEmail(rfp, vendor)` — sends one email, returns { success, vendorEmail, error? }
   - `sendRFPToVendors(rfp, vendors)` — sends to all, returns array of results

2. In `/backend/routes/rfps.js`, add:
   - POST /api/rfps/:id/send — receives { vendorIds }, fetches vendor docs, calls emailService.sendRFPToVendors, updates rfp.status to "sent", updates rfp.vendorIds

**Frontend:**
1. Update `src/pages/RFPDetail.jsx` to add the "Send to Vendors" section:
   - Show only if rfp.status is "draft"
   - Load and display all vendors with checkboxes

2. Create `src/components/SendRFPPanel.jsx`:
   - Vendor checklist
   - Email preview (read-only, shows formatted email content)
   - "Send RFP" button with loading state
   - On success: show toast, update RFP status badge

Handle all error cases from specs/03-email-sending.md.

---

# Prompt 5 — Email Receiving + AI Parsing Feature

> Run after Prompt 4 is working.

---

Read `CLAUDE.md` and `specs/04-email-receiving.md` carefully.

Implement the email receiving and proposal parsing feature:

**Backend:**
1. In `/backend/services/emailService.js`, add:
   - `pollInbox()` — connects via imap-simple, fetches UNSEEN emails, marks as SEEN after processing
   - `matchEmailToRFP(subject)` — searches RFP titles in DB against email subject
   - `matchEmailToVendor(fromEmail)` — finds vendor by email field
   - `saveIncomingProposal(rfpId, vendorId, rawEmail)` — saves Proposal doc with status "pending"

2. In `/backend/services/aiService.js`, add:
   - `parseVendorProposal(emailBody)` — calls Anthropic using the prompt in specs/04-email-receiving.md
   - Returns parsedData object

3. In `/backend/server.js`, add:
   - Start polling on server startup using node-cron (every 5 minutes)
   - Call pollInbox → for each matched email → aiService.parseVendorProposal → update Proposal

4. In `/backend/routes/proposals.js`, implement:
   - GET /api/proposals?rfpId=:rfpId
   - GET /api/proposals/:id
   - POST /api/proposals/parse-manual — triggers pollInbox immediately (for demo)

**Frontend:**
1. Update `src/pages/RFPDetail.jsx` to add proposals section:
   - Fetch proposals for this RFP
   - Show ProposalInbox component

2. Create `src/components/ProposalInbox.jsx`:
   - List of proposals with vendor name, price, delivery days, status badge
   - Expandable row to show full parsedData
   - "Check for New Proposals" button → calls POST /api/proposals/parse-manual

Handle all error cases from specs/04-email-receiving.md.

---

# Prompt 6 — Comparison + AI Recommendation Feature

> Run after Prompt 5 is working.

---

Read `CLAUDE.md` and `specs/05-comparison.md` carefully.

Implement the proposal comparison and AI recommendation feature:

**Backend:**
1. In `/backend/services/aiService.js`, add:
   - `scoreProposals(rfp, proposals)` — calls Anthropic with the scoring prompt from spec 05
   - Returns scores array + recommendation object

2. In `/backend/routes/rfps.js`, add:
   - GET /api/rfps/:id/compare — fetches RFP + all parsed proposals + triggers scoring if not already scored, returns full comparison data
   - POST /api/rfps/:id/score — re-runs AI scoring for all proposals
   - PATCH /api/rfps/:id/award — sets rfp.status to "closed", logs awarded vendor

**Frontend:**
1. Implement `src/pages/ComparisonView.jsx`:
   - Fetch from GET /api/rfps/:id/compare
   - Show loading state while AI scores

2. Create `src/components/ComparisonTable.jsx`:
   - One column per vendor
   - Rows: Total Price | Delivery Days | Payment Terms | Warranty | AI Score
   - Color coding: best=green, middle=yellow, worst=red (relative, not absolute)

3. Create `src/components/RecommendationCard.jsx`:
   - Highlighted winner name
   - Score bars for price/delivery/completeness
   - AI summary paragraph
   - AI tradeoffs sentence
   - "Award to Vendor" button with ConfirmDialog

4. Update RFPDetail page:
   - Show "Compare Proposals →" button when 2+ parsed proposals exist
   - Links to /rfps/:id/compare

Handle all error cases from specs/05-comparison.md.

---

# Prompt 7 — README + Polish

> Run last, when all features are working.

---

Read `CLAUDE.md` and ALL specs files carefully.

1. Write a complete `/README.md` covering all sections from the assignment:
   - Project Setup (prerequisites, install steps, env config, how to run, seed data)
   - Tech Stack table
   - API Documentation (all endpoints with request/response examples)
   - Decisions & Assumptions (explain choices from specs)
   - AI Tools Usage section

2. Polish the Dashboard page (`src/pages/Dashboard.jsx`):
   - Fetch real stats from the API
   - Show: total RFPs, active RFPs, total vendors, proposals received
   - Recent RFPs table (5 rows)
   - "+ New RFP" quick action

3. Create `src/components/Toast.jsx` if not already done and wire it up globally

4. Add proper 404 page for unknown routes

5. Test all flows end-to-end and fix any broken imports or routes
