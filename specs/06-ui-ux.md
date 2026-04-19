# Spec 06 — UI/UX Layout

---

## Design Direction

**Aesthetic:** Clean enterprise dashboard — professional, not flashy.
**Colors:** Dark sidebar (#1a1d23), white content area, blue accent (#3b82f6)
**Font:** Inter for body, monospace for data values
**Tone:** Calm, trustworthy, data-focused

---

## App Shell

```
┌─────────────────────────────────────────────────────┐
│  SIDEBAR (240px, dark)    │  CONTENT AREA (flex-1)  │
│                           │                          │
│  🏠 Dashboard             │  [Page content here]     │
│  📋 RFPs                  │                          │
│  👥 Vendors               │                          │
│  📬 Proposals             │                          │
│                           │                          │
│  ── bottom ──             │                          │
│  ⚙️  Settings             │                          │
└─────────────────────────────────────────────────────┘
```

---

## Pages

### / (Dashboard)
- Stats row: Total RFPs | Active RFPs | Vendors | Proposals received
- Recent RFPs table (last 5)
- Recent proposals received (last 5)
- Quick action button: "+ New RFP"

### /rfps
- Page title: "Requests for Proposal"
- Button: "+ New RFP" (top right)
- Table: Title | Status badge | Vendors sent | Created | Actions

### /rfps/new
- Page title: "Create New RFP"
- Large textarea: "Describe what you want to procure..."
- "Generate RFP" button
- Below: structured preview card (appears after AI processes)
- Editable fields in the preview
- "Save RFP" button

### /rfps/:id
- RFP title + status badge
- Requirements section (read-only cards)
- "Send to Vendors" section with vendor picker
- "Proposals Received" section (proposal inbox)
- "View Comparison" button (shows when 2+ proposals received)
- "Check for New Proposals" button

### /rfps/:id/compare
- Page title: "Compare Proposals — {RFP title}"
- Comparison table (sticky header, color-coded)
- AI Recommendation card
- Award button

### /vendors
- Page title: "Vendor Directory"
- "+ Add Vendor" button
- Vendor cards grid (name, email, category tags, proposal count)

### /vendors/:id
- Vendor profile
- Past performance (list of RFPs they responded to + scores)
- Edit vendor button

---

## Shared Components

| Component | Purpose |
|-----------|---------|
| `StatusBadge.jsx` | Colored pill for RFP/proposal status |
| `LoadingSpinner.jsx` | Centered spinner |
| `Toast.jsx` | Success/error notification (top-right) |
| `ConfirmDialog.jsx` | "Are you sure?" modal |
| `PageHeader.jsx` | Title + subtitle + action button slot |
| `EmptyState.jsx` | "No items yet" placeholder with CTA |

---

## Status Badge Colors

| Status | Color |
|--------|-------|
| draft | gray |
| sent | blue |
| receiving | yellow |
| closed | green |
| pending | gray |
| parsed | blue |
| reviewed | green |

---

## Responsive Behavior

- Sidebar collapses to icon-only on screens < 1024px
- Tables scroll horizontally on mobile
- Minimum supported width: 768px (tablet)

---

## Change Log

| Date | Change | Who |
|------|--------|-----|
| -    | Initial spec | - |
