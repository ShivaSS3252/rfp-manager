# Spec 03 — Email Sending Feature

---

## What This Feature Does

From an RFP detail page, the procurement manager selects which vendors to send the RFP to.
The system formats the RFP as a professional email and sends it via Gmail SMTP (Nodemailer).

---

## User Flow

1. User is on `/rfps/:id` (RFP detail page)
2. Sees a **"Send to Vendors"** button
3. A panel/modal opens showing the vendor list with checkboxes
4. User checks the vendors they want
5. User sees a preview of the email that will be sent
6. Clicks **"Send RFP"**
7. System sends emails, updates RFP status to `"sent"`, shows success toast
8. Sent vendors are listed on the RFP detail page with timestamp

---

## Backend API

### POST /api/rfps/:id/send
Sends RFP email to selected vendors.

**Request:**
```json
{ "vendorIds": ["vendorId1", "vendorId2"] }
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sent": ["vendor1@example.com", "vendor2@example.com"],
    "failed": []
  },
  "message": "RFP sent to 2 vendors"
}
```

**Side effects:**
- Updates `rfp.status` to `"sent"`
- Saves `rfp.vendorIds` array with the selected vendors

---

## Email Template

```
Subject: Request for Proposal — {rfp.title}

Dear {vendor.contactPerson or vendor.name},

We are seeking proposals for the following procurement:

PROJECT: {rfp.title}
DEADLINE: {rfp.requirements.deadline}
BUDGET: ${rfp.requirements.budget}

ITEMS REQUIRED:
{rfp.requirements.items listed as bullet points}

TERMS:
- Payment: {rfp.requirements.paymentTerms}
- Warranty: {rfp.requirements.warranty}

{rfp.requirements.additionalNotes if present}

Please reply to this email with your detailed proposal including:
- Itemized pricing
- Delivery timeline
- Payment terms
- Any applicable warranties or guarantees

Deadline for submissions: {rfp.requirements.deadline}

Best regards,
Procurement Team
```

---

## Email Service (emailService.js)

```js
// backend/services/emailService.js
// Uses nodemailer with Gmail SMTP
// Config from: EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS

// Functions to export:
// - sendRFPEmail(rfp, vendor) → sends one email, returns { success, error }
// - sendRFPToVendors(rfp, vendors) → sends to all, returns array of results
```

---

## Frontend Components

- **Component:** `src/components/SendRFPPanel.jsx`
  - Vendor checkbox list
  - Email preview section (read-only, shows formatted email)
  - "Send RFP" button with loading state
- **Component:** `src/components/VendorCheckbox.jsx`

---

## Error Cases

| Error | Handling |
|-------|----------|
| SMTP credentials wrong | Return 500, log error, show "Email configuration error" |
| Partial failure (some sent, some failed) | Return which succeeded and which failed |
| No vendors selected | Frontend validation: "Select at least one vendor" |
| RFP already sent to this vendor | Show warning but allow re-send |

---

## Change Log

| Date | Change | Who |
|------|--------|-----|
| -    | Initial spec | - |
