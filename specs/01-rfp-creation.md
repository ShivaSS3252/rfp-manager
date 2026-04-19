# Spec 01 — RFP Creation Feature

---

## What This Feature Does

User types a natural language description of what they want to procure.
The system uses Claude AI to convert it into a structured RFP object and saves it to MongoDB.

---

## User Flow

1. User lands on `/rfps/new`
2. Sees a chat-style input box: *"Describe what you want to procure..."*
3. Types e.g. *"I need 20 laptops with 16GB RAM, 15 monitors 27-inch, budget $50k, delivery in 30 days, net 30 payment, 1 year warranty"*
4. Hits **"Generate RFP"**
5. Page shows a structured RFP preview card with all extracted fields
6. User can edit any field inline before saving
7. User clicks **"Save RFP"** → saved to DB, redirected to `/rfps/:id`

---

## Backend API

### POST /api/rfps/parse
Accepts raw text, returns structured RFP (does NOT save yet).

**Request:**
```json
{ "rawInput": "I need 20 laptops..." }
```

**Response:**
```json
{
  "success": true,
  "data": {
    "title": "Office Laptop & Monitor Procurement",
    "requirements": {
      "items": ["20 laptops 16GB RAM", "15 monitors 27-inch"],
      "budget": 50000,
      "deadline": "2024-02-15",
      "paymentTerms": "Net 30",
      "warranty": "1 year minimum",
      "additionalNotes": ""
    }
  }
}
```

### POST /api/rfps
Saves a complete RFP to MongoDB.

**Request:** Full RFP object (from above)
**Response:** Saved RFP with `_id`

### GET /api/rfps
Returns all RFPs (list view).

### GET /api/rfps/:id
Returns single RFP with vendor details populated.

### PATCH /api/rfps/:id
Update any field on an RFP.

---

## AI Prompt (in aiService.js)

```
You are an RFP data extractor. 
Given a natural language procurement request, extract structured data.

Return ONLY valid JSON with this exact shape:
{
  "title": "short descriptive title",
  "requirements": {
    "items": ["array of items needed"],
    "budget": number_in_usd_or_null,
    "deadline": "ISO date string or null",
    "paymentTerms": "string or null",
    "warranty": "string or null",
    "quantity": number_or_null,
    "additionalNotes": "anything else mentioned"
  }
}

User input: {rawInput}
```

---

## Frontend Component

- **Page:** `src/pages/RFPCreate.jsx`
- **Component:** `src/components/RFPForm.jsx` (the chat input)
- **Component:** `src/components/RFPPreviewCard.jsx` (structured preview with editable fields)

---

## Error Cases to Handle

| Error | User Message |
|-------|-------------|
| AI returns malformed JSON | "Could not parse your request. Please be more specific." |
| Empty input submitted | "Please describe what you want to procure." |
| MongoDB save fails | "Failed to save RFP. Please try again." |

---

## Change Log

| Date | Change | Who |
|------|--------|-----|
| -    | Initial spec | - |
