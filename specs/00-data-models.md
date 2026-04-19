# Spec 00 — Data Models

> Source of truth for all MongoDB schemas.
> If you change a field here, re-run the foundation prompt to regenerate models.

---

## RFP Model

```js
// File: backend/models/RFP.js
{
  title: String,                    // AI-generated short title
  rawInput: String,                 // Original natural language from user
  requirements: {
    items: [String],                // e.g. ["20 laptops 16GB RAM", "15 monitors 27-inch"]
    budget: Number,                 // in USD
    deadline: Date,                 // delivery deadline
    paymentTerms: String,           // e.g. "Net 30"
    warranty: String,               // e.g. "1 year minimum"
    quantity: Number,
    additionalNotes: String
  },
  status: {
    type: String,
    enum: ["draft", "sent", "receiving", "closed"],
    default: "draft"
  },
  vendorIds: [{ type: ObjectId, ref: "Vendor" }],
  createdAt: Date,
  updatedAt: Date
}
```

---

## Vendor Model

```js
// File: backend/models/Vendor.js
{
  name: String,                     // Company name
  email: String,                    // Contact email (used for sending RFPs)
  contactPerson: String,            // Name of contact
  phone: String,
  category: [String],               // e.g. ["electronics", "laptops"]
  pastPerformance: [{
    rfpId: ObjectId,
    score: Number,                  // 0-100
    notes: String
  }],
  createdAt: Date
}
```

---

## Proposal Model

```js
// File: backend/models/Proposal.js
{
  rfpId: { type: ObjectId, ref: "RFP", required: true },
  vendorId: { type: ObjectId, ref: "Vendor", required: true },
  rawEmail: {
    subject: String,
    body: String,                   // Full email text
    receivedAt: Date,
    attachments: [String]           // filenames if any
  },
  parsedData: {
    totalPrice: Number,
    unitPrices: [{ item: String, price: Number }],
    deliveryDays: Number,
    paymentTerms: String,
    warranty: String,
    additionalTerms: String,
    confidence: Number              // AI confidence 0-1
  },
  aiScore: {
    overall: Number,                // 0-100
    priceScore: Number,
    deliveryScore: Number,
    completenessScore: Number,
    reasoning: String               // AI explanation
  },
  status: {
    type: String,
    enum: ["pending", "parsed", "reviewed"],
    default: "pending"
  },
  createdAt: Date
}
```

---

## Change Log

| Date | Change | Affected Files |
|------|--------|----------------|
| -    | Initial schema | All models |
