# Spec 04 — Email Receiving + AI Parsing Feature

---

## What This Feature Does

The system polls the Gmail inbox via IMAP, finds vendor reply emails, uses Claude AI
to extract structured proposal data, and saves it as a Proposal in MongoDB.

---

## How Email Matching Works

1. Vendor replies to the RFP email
2. The reply subject contains the original subject (standard email reply threading)
3. System matches reply to RFP by looking for RFP title in subject line
4. System matches to vendor by sender email address

---

## Polling Strategy

- Poll IMAP inbox every 5 minutes (use `setInterval` on server start)
- Only look at UNSEEN emails
- Mark emails as SEEN after processing
- If no matching RFP/vendor found → log and skip (don't mark as seen, retry later)

---

## Backend

### Service: emailService.js (add these functions)

```js
// pollInbox() → checks Gmail IMAP for new emails
// parseIncomingEmail(email) → returns { rfpId, vendorId, rawEmail }
// matchEmailToRFP(subject) → finds RFP by title match in subject
// matchEmailToVendor(fromEmail) → finds vendor by email
```

### POST /api/proposals/parse-manual
Manual trigger to parse inbox immediately (useful for demo/testing).

**Response:**
```json
{
  "success": true,
  "data": {
    "found": 2,
    "parsed": 2,
    "proposals": [{ "_id": "...", "vendorId": "...", "rfpId": "..." }]
  }
}
```

### GET /api/proposals?rfpId=:rfpId
Get all proposals for a specific RFP.

### GET /api/proposals/:id
Get single proposal with full parsed data.

---

## AI Parsing Prompt (in aiService.js)

```
You are a procurement proposal parser.
Extract structured data from this vendor email response to an RFP.

Return ONLY valid JSON with this exact shape:
{
  "totalPrice": number or null,
  "unitPrices": [
    { "item": "item name", "price": number }
  ],
  "deliveryDays": number or null,
  "paymentTerms": "string or null",
  "warranty": "string or null",
  "additionalTerms": "any other terms or conditions",
  "confidence": 0.0 to 1.0
}

If a value is not mentioned, use null.
confidence = how complete and clear the response is (1.0 = very clear, 0.0 = vague).

Vendor email:
---
{email.body}
---
```

---

## Frontend

### Component: `src/components/ProposalInbox.jsx`
- Shows on RFP detail page
- Lists received proposals with vendor name + received time
- Each row shows: vendor name, total price, delivery days, status badge
- Click to expand full parsed details

### Component: `src/components/ManualRefreshButton.jsx`
- Button: "Check for New Proposals"
- Calls POST /api/proposals/parse-manual
- Shows loading spinner, then "Found N new proposals"

---

## Proposal Status Flow

```
pending → (AI parses email) → parsed → (user reviews) → reviewed
```

---

## Error Cases

| Error | Handling |
|-------|----------|
| IMAP connection fails | Log error, retry on next poll cycle |
| AI returns invalid JSON | Save raw email, set status "parse_failed", notify in UI |
| No matching RFP for email | Log as "unmatched", skip |
| Duplicate email (already parsed) | Check by message-id, skip duplicates |

---

## Change Log

| Date | Change | Who |
|------|--------|-----|
| -    | Initial spec | - |
