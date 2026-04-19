# Spec 05 — Proposal Comparison + AI Recommendation Feature

---

## What This Feature Does

For a given RFP, show a side-by-side comparison of all vendor proposals.
Use Claude AI to score each proposal and produce a final recommendation with reasoning.

---

## User Flow

1. User visits `/rfps/:id/compare`
2. Sees a comparison table with one column per vendor
3. Rows: Total Price | Delivery Days | Payment Terms | Warranty | Completeness
4. Each cell is color-coded: green = best, yellow = ok, red = worst
5. Below the table: AI Recommendation card
   - "We recommend: {Vendor Name}"
   - Score breakdown (price, delivery, completeness)
   - AI reasoning paragraph
6. User can click **"Award to {Vendor}"** to close the RFP

---

## Backend API

### GET /api/rfps/:id/compare
Returns all proposals + AI scores for an RFP.

**Response:**
```json
{
  "success": true,
  "data": {
    "rfp": { "_id": "...", "title": "...", "requirements": {} },
    "proposals": [
      {
        "_id": "...",
        "vendor": { "name": "TechSupplies Co.", "email": "..." },
        "parsedData": {
          "totalPrice": 45000,
          "deliveryDays": 21,
          "paymentTerms": "Net 30",
          "warranty": "2 years"
        },
        "aiScore": {
          "overall": 87,
          "priceScore": 90,
          "deliveryScore": 85,
          "completenessScore": 88,
          "reasoning": "Best price with reasonable delivery..."
        }
      }
    ],
    "recommendation": {
      "vendorId": "...",
      "vendorName": "TechSupplies Co.",
      "summary": "TechSupplies Co. offers the best overall value...",
      "tradeoffs": "OfficeGear Ltd. has faster delivery but is 12% more expensive."
    }
  }
}
```

### POST /api/rfps/:id/score
Triggers AI scoring for all proposals under this RFP (or re-scores if called again).

### PATCH /api/rfps/:id/award
Awards RFP to a vendor, sets status to "closed".

**Request:** `{ "vendorId": "..." }`

---

## AI Scoring Prompt (in aiService.js)

```
You are a procurement evaluation expert.

RFP Requirements:
- Budget: ${rfp.requirements.budget}
- Required delivery: within {rfp.requirements.deadline} days
- Payment terms requested: {rfp.requirements.paymentTerms}
- Warranty required: {rfp.requirements.warranty}

Vendor proposals to score:
{proposals mapped to JSON array}

Score EACH proposal on a 0-100 scale across:
- priceScore: how well it fits the budget (lower price = higher score)
- deliveryScore: how well it meets the deadline
- completenessScore: how complete and professional the response is

Also produce an "overall" (weighted average: price 40%, delivery 35%, completeness 25%)
and a short "reasoning" sentence for each.

Then produce a top-level recommendation:
- vendorId of the best choice
- summary: 2-3 sentence explanation
- tradeoffs: 1 sentence about runner-up

Return ONLY valid JSON:
{
  "scores": [
    { "proposalId": "...", "overall": 87, "priceScore": 90, "deliveryScore": 85, "completenessScore": 88, "reasoning": "..." }
  ],
  "recommendation": {
    "vendorId": "...",
    "vendorName": "...",
    "summary": "...",
    "tradeoffs": "..."
  }
}
```

---

## Frontend Components

- **Page:** `src/pages/ComparisonView.jsx`
- **Component:** `src/components/ComparisonTable.jsx`
  - Color-coded cells (green/yellow/red based on relative rank)
  - Sticky header row with vendor names
- **Component:** `src/components/RecommendationCard.jsx`
  - Highlighted winner
  - Score bars (visual progress bars for each dimension)
  - AI reasoning text
  - "Award to Vendor" button

---

## Scoring Color Logic (frontend)

```js
// For each metric column (price, delivery, completeness):
// Find min/max across all proposals
// Best value → green background
// Middle values → yellow
// Worst value → red
// This is relative comparison, not absolute thresholds
```

---

## Change Log

| Date | Change | Who |
|------|--------|-----|
| -    | Initial spec | - |
