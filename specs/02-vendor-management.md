# Spec 02 — Vendor Management Feature

---

## What This Feature Does

Maintain a list of vendors (companies + contacts). Allow the procurement manager to
add, edit, view, and delete vendors. When sending an RFP, pick vendors from this list.

---

## User Flow

1. User visits `/vendors`
2. Sees a table/card list of all vendors
3. Can click **"Add Vendor"** → opens a form (modal or new page)
4. Fills in: Company Name, Contact Email, Contact Person, Phone, Categories
5. Saves → vendor appears in list
6. Can edit or delete any vendor

---

## Backend API

### GET /api/vendors
Returns all vendors.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "name": "TechSupplies Co.",
      "email": "sales@techsupplies.com",
      "contactPerson": "John Doe",
      "phone": "+1-555-0100",
      "category": ["electronics", "laptops"],
      "createdAt": "2024-01-10T..."
    }
  ]
}
```

### POST /api/vendors
Create a new vendor.

**Request:**
```json
{
  "name": "TechSupplies Co.",
  "email": "sales@techsupplies.com",
  "contactPerson": "John Doe",
  "phone": "+1-555-0100",
  "category": ["electronics"]
}
```

### GET /api/vendors/:id
Single vendor with full past performance data.

### PATCH /api/vendors/:id
Update vendor fields.

### DELETE /api/vendors/:id
Soft delete (set `deleted: true`) — do not hard delete, proposals reference vendors.

---

## Frontend Components

- **Page:** `src/pages/VendorList.jsx`
- **Page:** `src/pages/VendorDetail.jsx`
- **Component:** `src/components/VendorForm.jsx` (add/edit form)
- **Component:** `src/components/VendorCard.jsx` (card in list)

---

## Seed Data

Include 3 seed vendors so the app works immediately on first run.

```js
// backend/seed/vendors.js
[
  { name: "TechSupplies Co.", email: "vendor1@example.com", contactPerson: "Alice", category: ["electronics","laptops"] },
  { name: "OfficeGear Ltd.", email: "vendor2@example.com", contactPerson: "Bob", category: ["furniture","monitors"] },
  { name: "ProSolutions Inc.", email: "vendor3@example.com", contactPerson: "Carol", category: ["electronics","networking"] }
]
```

---

## Validation Rules

| Field | Rule |
|-------|------|
| name | Required, min 2 chars |
| email | Required, valid email format |
| contactPerson | Optional |
| category | Optional array of strings |

---

## Change Log

| Date | Change | Who |
|------|--------|-----|
| -    | Initial spec | - |
