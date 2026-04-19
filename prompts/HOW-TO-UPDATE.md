# How to Update the Project Using Prompts

> This is your maintenance guide. Any change = update spec first, then prompt.

---

## The Golden Rule

**Never prompt Claude Code without pointing to a spec.**
Every prompt should start with: `"Read CLAUDE.md and specs/0N-filename.md, then..."`

---

## Update Patterns

### Pattern A — Change an existing feature

1. Open the relevant spec file (e.g. `specs/01-rfp-creation.md`)
2. Edit the section that describes what changed
3. Add a row to the Change Log table at the bottom
4. Run this prompt in Claude Code:

```
Read CLAUDE.md and specs/01-rfp-creation.md.

The spec has been updated. Specifically:
[describe what changed in 1-2 sentences]

Update the affected files to match the new spec.
Only change what's needed — don't rewrite unrelated code.
```

---

### Pattern B — Add a new field to a model

1. Update `specs/00-data-models.md` with the new field
2. Run this prompt:

```
Read CLAUDE.md and specs/00-data-models.md.

The data model has a new field: [field name] on [Model name].
Definition: [paste the field from spec]

1. Add the field to /backend/models/[Model].js
2. Update any routes that return this model to include the new field
3. If there's a form for this model in the frontend, add the field there too
```

---

### Pattern C — Change the AI prompt

1. Update the "AI Prompt" section in the relevant spec
2. Run this prompt:

```
Read CLAUDE.md and specs/[feature].md.

The AI prompt for [feature name] has been updated in the spec.
Update /backend/services/aiService.js function [functionName] 
to use the new prompt exactly as written in the spec.
```

---

### Pattern D — Add a completely new feature

1. Create `specs/0N-new-feature.md` using the template below
2. Update `CLAUDE.md` status checklist
3. Create `prompts/pN-new-feature.md`
4. Run the new prompt

---

## Spec Template for New Feature

```md
# Spec 0N — [Feature Name]

---

## What This Feature Does
[1-2 sentence summary]

---

## User Flow
1. ...
2. ...

---

## Backend API

### METHOD /api/route
[request/response]

---

## AI Prompt (if applicable)
[exact prompt text]

---

## Frontend Components
- **Page:** ...
- **Component:** ...

---

## Error Cases
| Error | Handling |
|-------|----------|

---

## Change Log
| Date | Change | Who |
|------|--------|-----|
| -    | Initial spec | - |
```

---

## Common Changes Reference

| What you want to change | Which spec to edit |
|-------------------------|--------------------|
| Add a new RFP field | specs/00-data-models.md + specs/01-rfp-creation.md |
| Change email template | specs/03-email-sending.md |
| Change AI scoring weights | specs/05-comparison.md |
| Add a new page/route | specs/06-ui-ux.md |
| Change polling frequency | specs/04-email-receiving.md |
| Add vendor fields | specs/00-data-models.md + specs/02-vendor-management.md |

---

## Debugging Prompt

When something breaks, use this:

```
Read CLAUDE.md.

I'm getting this error:
[paste error]

It happens when: [describe steps]

Check the relevant spec files and fix the issue.
Do not change any working code outside of what's needed to fix this.
```
