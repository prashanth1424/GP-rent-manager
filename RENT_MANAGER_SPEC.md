# DOMINION — Rent Manager
## Complete Technical Specification for Agent Build

---

## 1. Project Overview

**App Name:** DOMINION — Rent Manager
**Type:** React Single-Page Application (SPA)
**Storage:** localStorage (JSON only — no PDF blobs stored)
**Purpose:** A personal rent management tool for a landlord to manage fixed rooms with rotating tenants, track monthly bills with utility splitting, and generate downloadable paperwork (receipts, agreements, deposit settlements).

### Core Philosophy
- Rooms are **permanent** entities — they are never deleted, only their occupants change.
- Tenants are **independent** profiles that get assigned to rooms via Tenancy Records.
- All financial data (rent agreed, deposit, payments) is **locked to the Tenancy Record** at the time of signing — never pulled from the current room's default rent, to preserve historical accuracy.
- PDFs are **generated on-demand** and never persisted in storage.

---

## 2. Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 18 with hooks |
| State Management | `useReducer` + `React Context` (global) |
| Styling | CSS Modules or plain CSS with CSS Variables |
| PDF Generation | `jsPDF` + `html2canvas` |
| Storage | `localStorage` (JSON structured data only) |
| Icons | `lucide-react` |
| Fonts | Cormorant Garamond (display/headings) + DM Sans (body/UI) |
| Color Theme | Dark background (#0A0A0A), Gold accent (#C9A84C), Off-white text (#F0EDE6) |

---

## 3. Visual Design System

### Colors (CSS Variables)
```css
--bg-primary: #0A0A0A;
--bg-surface: #111111;
--bg-elevated: #1A1A1A;
--border: #2A2A2A;
--gold: #C9A84C;
--gold-muted: #8A6F2E;
--text-primary: #F0EDE6;
--text-secondary: #888888;
--status-paid: #4CAF50;
--status-pending: #C9A84C;
--status-overdue: #E05252;
--status-vacant: #555555;
```

### Typography
- **Display/Headings:** Cormorant Garamond, serif — use for module titles, room names, large numbers
- **Body/UI:** DM Sans, sans-serif — use for labels, inputs, buttons, data

### Component Aesthetic
- Cards with subtle `#1A1A1A` background, `1px solid #2A2A2A` border, `8px` border-radius
- Gold accent line (`2px solid #C9A84C`) on left side of active/selected cards
- No colored backgrounds on buttons — prefer outlined or ghost buttons with gold border
- Status badges: small pill-shaped with appropriate status color
- Tables: minimal, no heavy borders, alternating row tint `rgba(255,255,255,0.02)`

---

## 4. App Navigation Structure

**Bottom Tab Bar** (mobile-first, fixed at bottom):

```
[ Rooms ] [ Tenants ] [ Bills ] [ Paperwork ] [ Settings ]
```

Each tab is a top-level module. No nested routing required.

---

## 5. Full Data Schema

All data lives in `localStorage` under the key `dominion_rent`.

```js
{
  rooms: Room[],
  tenants: Tenant[],
  tenancies: TenancyRecord[],
  bills: MonthlyBill[],
  settings: AppSettings
}
```

### 5.1 Room
```js
{
  id: string,               // "room_01", "room_02", etc. (generated once, never changed)
  name: string,             // "Room 1", "Room 2A", etc.
  type: "single" | "double",
  floor: number,            // 1, 2, 3...
  defaultRent: number,      // Suggested rent — only used as a prefill default when creating tenancy
  vacancyPolicy: "tenant_pays_full" | "landlord_absorbs"
                            // For double rooms: if one bed vacant, does remaining tenant pay full room rent?
}
```

> **Note:** `defaultRent` on Room is ONLY a prefill suggestion. The actual rent used for calculations is always `TenancyRecord.agreedRent`.

### 5.2 Tenant
```js
{
  id: string,               // UUID or timestamp-based ID
  name: string,
  phone: string,
  idProof: string,          // e.g. "Aadhar - 1234", "PAN - ABCDE1234F"
  emergencyContact: string,
  createdAt: string         // ISO date string
}
```

### 5.3 TenancyRecord
```js
{
  id: string,
  roomId: string,           // References Room.id
  tenantId: string,         // References Tenant.id
  startDate: string,        // ISO date — "2025-01-01"
  endDate: string | null,   // null = currently active
  agreedRent: number,       // LOCKED at time of assignment — historical accuracy
  depositPaid: number,
  depositRefunded: number | null,   // null until move-out
  depositDeductions: [
    { reason: string, amount: number }
  ],
  advanceMonths: number,    // How many months paid in advance (default: 0)
  agreementStatus: "draft" | "printed" | "filed",
  status: "active" | "vacated"
}
```

> **Critical Rule:** When a co-tenant in a double room leaves and the remaining tenant's rent share changes, do NOT mutate the existing active TenancyRecord. Instead:
> 1. Set `endDate` on the current record.
> 2. Create a NEW TenancyRecord for the same tenant with `startDate = today` and the new `agreedRent`.
> This preserves full audit history.

### 5.4 MonthlyBill
```js
{
  id: string,
  month: string,            // "2026-05" (YYYY-MM format)
  roomId: string,
  utilities: {
    electricity: number,
    water: number,
    other: number           // maintenance, internet, etc.
  },
  charges: [                // Auto-calculated breakdown per tenant
    {
      tenantId: string,
      daysOccupied: number, // For proration
      baseRent: number,     // Prorated rent (from TenancyRecord.agreedRent)
      utilityShare: number, // Their share of utilities
      total: number         // baseRent + utilityShare
    }
  ],
  payments: [
    {
      tenantId: string,
      amount: number,
      date: string,         // ISO date
      note: string          // Optional
    }
  ]
}
```

### 5.5 AppSettings
```js
{
  propertyName: string,
  landlordName: string,
  landlordPhone: string,
  address: string,
  vacantRoomUtilityPolicy: "redistribute" | "absorb"
  // redistribute = vacant room's utility share is split among occupied rooms
  // absorb = landlord absorbs the vacant room's utility share
}
```

---

## 6. Module Specifications

---

### 6.1 MODULE: Rooms

**Purpose:** Define and view the fixed set of rooms. Rooms are configured once (admin setup) and rarely changed.

**Screens:**
- **Room List View** — Grid of room cards showing: room name, type (Single/Double), current occupants (or "Vacant"), current rent
- **Add/Edit Room Form** — Fields: name, type, floor, defaultRent, vacancyPolicy
- **Room Detail View** — Full tenancy history for that room (all past + current tenancies shown as a timeline)

**Business Rules:**
- Rooms cannot be deleted if they have any tenancy records (active or historical)
- A single room can have at most 1 active tenancy at any time
- A double room can have at most 2 active tenancies at any time
- When viewing a room, show current occupants pulled from tenancies where `status === "active"` AND `endDate === null`

**Room Card Display:**
```
┌─────────────────────────────┐
│ Room 3           [DOUBLE]   │
│ Floor 2                     │
│                             │
│ Arjun Sharma   ₹6,000/mo   │
│ Kiran Rao      ₹6,000/mo   │
│                             │
│ Total: ₹12,000/mo          │
└─────────────────────────────┘
```

---

### 6.2 MODULE: Tenants

**Purpose:** Manage independent tenant profiles. Tenants exist separately from room assignments.

**Screens:**
- **Tenant List** — Cards showing: name, phone, current room assignment (or "Unassigned"), status
- **Add/Edit Tenant Form** — Fields: name, phone, idProof, emergencyContact
- **Tenant Detail View** — Full tenancy history for that person (which rooms, which dates, what rent)
- **Assign to Room** — Dropdown of available rooms (respects room type limits), prefills agreedRent from room's defaultRent, sets depositPaid, advanceMonths, agreementStatus

**Assign to Room Flow:**
1. Select room (only shows rooms with capacity — single rooms with 0 tenants, double rooms with 0 or 1 tenant)
2. Enter: startDate, agreedRent (prefilled from defaultRent), depositPaid, advanceMonths
3. If double room already has 1 tenant: show a prompt "This will split the room. Do you want to adjust the existing tenant's rent share?" If yes → close existing active record, open new one for existing tenant with new agreedRent
4. Creates TenancyRecord with `status: "active"`, `endDate: null`

**Vacate Tenant Flow:**
1. Select tenant to vacate
2. Enter: endDate, depositRefunded, depositDeductions[]
3. Sets `endDate` and `status: "vacated"` on their TenancyRecord
4. If they were in a double room with another tenant AND vacancyPolicy is "tenant_pays_full": prompt to update remaining tenant's agreedRent (close old record, open new one)

---

### 6.3 MODULE: Bills

**Purpose:** Track monthly utility bills per room, auto-calculate per-tenant charges with proration, and record payments.

**Screens:**
- **Bill Dashboard** — Month selector (← Month →), list of all rooms with their monthly summary
- **Room Bill Entry** — Enter utilities for a specific room in a specific month
- **Payment Recording** — Mark payment received from a specific tenant with amount, date, note
- **Payment History** — Filter by room or tenant, shows all months

**Core Calculation Logic (must implement exactly):**

**Step 1 — Find active tenancies for a room in a given month:**
```
For month "2026-05" (May 2026):
  Find all TenancyRecords where:
    - roomId matches
    - startDate <= 2026-05-31
    - endDate is null OR endDate >= 2026-05-01
```

**Step 2 — Calculate days occupied per tenant in that month:**
```
daysInMonth = 31 (for May)
tenantStart = max(tenancy.startDate, first day of month)
tenantEnd = min(tenancy.endDate ?? last day of month, last day of month)
daysOccupied = tenantEnd - tenantStart + 1
```

**Step 3 — Prorated base rent:**
```
proratedRent = (agreedRent / daysInMonth) * daysOccupied
```

**Step 4 — Utility share:**
```
totalUtility = electricity + water + other
Each active tenant gets: utilityShare = totalUtility / numberOfActiveTenants
(If a room is vacant and vacantRoomUtilityPolicy = "redistribute", 
 that room's utility share is split among all other rooms' tenants)
```

**Step 5 — Total per tenant:**
```
total = proratedRent + utilityShare
```

**Advance Rent Handling:**
- When a tenant has `advanceMonths > 0`, auto-mark the first N months' payments as paid from deposit.
- Display these months with a badge "Advance" instead of "Paid".

**Bill Card Display (per room per month):**
```
Room 3 — May 2026
────────────────────────────────
Electricity  ₹1,200
Water        ₹300
Other        ₹200
Total Utils  ₹1,700
────────────────────────────────
Arjun Sharma
  Base Rent   ₹6,000   (31/31 days)
  Utilities   ₹850
  TOTAL       ₹6,850   [PAID ✓]

Kiran Rao
  Base Rent   ₹3,097   (15/31 days — moved in May 15)
  Utilities   ₹850
  TOTAL       ₹3,947   [PENDING]
────────────────────────────────
Room Total    ₹10,797
```

**Overall Dashboard Stats (top of Bills page):**
- Total expected this month
- Total collected this month
- Total pending
- Rooms with overdue payments (any unpaid from previous months)

---

### 6.4 MODULE: Paperwork

**Purpose:** Generate downloadable PDFs for rent receipts, tenancy agreements, and deposit settlement statements.

**Documents:**

#### A. Rent Receipt
**Trigger:** User selects tenant + month
**Content:**
- Property name, landlord name, address
- Tenant name, room name
- Month/year
- Itemized breakdown: base rent, utility share, total
- Payment date and amount received
- Receipt number (auto-generated: `REC-{roomId}-{month}-{tenantId}`)
- Landlord signature line

#### B. Tenancy Agreement
**Trigger:** User selects an active TenancyRecord
**Content:**
- Landlord details
- Tenant details (name, phone, ID proof)
- Room details (room name, type, floor)
- Lease start date
- Monthly rent (agreedRent from TenancyRecord)
- Deposit amount
- Advance months paid
- Standard clauses (hardcoded template):
  - Rent due date (1st of every month)
  - Notice period (30 days)
  - No subletting
  - Maintenance responsibility
  - Termination conditions
- Agreement status toggle: draft → printed → filed (saved back to TenancyRecord.agreementStatus)

#### C. Deposit Settlement Statement
**Trigger:** User selects a vacated TenancyRecord (status = "vacated")
**Content:**
- Tenant name, room, lease period (startDate to endDate)
- Deposit paid
- Deductions (itemized from depositDeductions[])
- Amount refunded
- Balance confirmation

**PDF Generation Approach:**
1. Render the document as a styled HTML `<div>` (hidden, off-screen)
2. Use `html2canvas` to capture it as an image
3. Use `jsPDF` to embed the image into a PDF
4. Trigger browser download — never store in localStorage

---

### 6.5 MODULE: Settings

**Purpose:** Configure property-level settings and manage data backup/restore.

**Sections:**
- **Property Info:** propertyName, landlordName, landlordPhone, address
- **Vacancy Policy:** vacantRoomUtilityPolicy (redistribute / absorb)
- **Data Management:**
  - **Export JSON** — Downloads full `dominion_rent` localStorage object as a `.json` file
  - **Import JSON** — Upload a previously exported `.json` file to restore all data
  - **Clear All Data** — Destructive action, requires typed confirmation ("DELETE ALL")

---

## 7. State Management Architecture

### Context Structure
```js
// RentContext.js
const RentContext = createContext();

// State shape
const initialState = {
  rooms: [],
  tenants: [],
  tenancies: [],
  bills: [],
  settings: {
    propertyName: "",
    landlordName: "",
    landlordPhone: "",
    address: "",
    vacantRoomUtilityPolicy: "absorb"
  }
};

// Persist to localStorage on every state change via useEffect
```

### Reducer Actions
```
ADD_ROOM / UPDATE_ROOM
ADD_TENANT / UPDATE_TENANT
CREATE_TENANCY / CLOSE_TENANCY / UPDATE_TENANCY
UPSERT_BILL / ADD_PAYMENT
UPDATE_SETTINGS
IMPORT_DATA / CLEAR_DATA
```

---

## 8. Utility Functions (implement these exactly)

```js
// Get active tenancies for a room
getActiveTenantsForRoom(tenancies, roomId)
  → filters tenancies where roomId matches, status = "active", endDate = null

// Get active tenancies for a room in a specific month
getTenantsForRoomInMonth(tenancies, roomId, month)
  → month is "YYYY-MM" string
  → returns tenancies that overlap with that calendar month

// Calculate days occupied in a month
daysOccupiedInMonth(startDate, endDate, month)
  → returns integer days

// Prorated rent
prorateRent(agreedRent, daysOccupied, daysInMonth)
  → returns number (round to 2 decimal places)

// Generate bill charges for a room+month
generateCharges(tenancies, roomId, month, utilities)
  → returns charges[] array matching MonthlyBill.charges schema

// Check room capacity
isRoomAvailable(tenancies, roomId, roomType)
  → single: returns true if 0 active tenants
  → double: returns true if < 2 active tenants

// Get payment status for a tenant in a month
getPaymentStatus(bill, tenantId)
  → "paid" | "partial" | "pending" | "overdue" | "advance"

// Export data
exportToJSON(state) → triggers file download of JSON

// Import data  
importFromJSON(file, dispatch) → reads file, validates schema, dispatches IMPORT_DATA
```

---

## 9. Component File Structure

```
/src
  /context
    RentContext.jsx          ← Global state, reducer, provider
    
  /hooks
    useRooms.js              ← Room-specific selectors
    useTenants.js
    useTenancies.js
    useBills.js
    
  /utils
    calculations.js          ← All math: proration, splits, totals
    dateHelpers.js           ← Month parsing, day counting
    pdfExport.js             ← html2canvas + jsPDF wrappers
    storage.js               ← localStorage read/write, export/import
    idGenerator.js           ← UUID or timestamp IDs
    
  /components
    /layout
      BottomTabBar.jsx
      PageHeader.jsx
      Modal.jsx
      ConfirmDialog.jsx
      
    /ui
      Card.jsx
      Badge.jsx              ← status pills: Paid, Pending, Overdue, Vacant
      Button.jsx
      Input.jsx
      Select.jsx
      MonthSelector.jsx
      EmptyState.jsx
      
  /modules
    /rooms
      RoomList.jsx
      RoomCard.jsx
      RoomForm.jsx
      RoomDetail.jsx
      
    /tenants
      TenantList.jsx
      TenantCard.jsx
      TenantForm.jsx
      TenantDetail.jsx
      AssignRoomModal.jsx
      VacateTenantModal.jsx
      
    /bills
      BillDashboard.jsx
      BillSummaryCard.jsx    ← Per room per month summary
      BillEntryForm.jsx      ← Enter utilities for a room/month
      PaymentForm.jsx
      PaymentHistory.jsx
      
    /paperwork
      PaperworkList.jsx
      ReceiptGenerator.jsx
      AgreementBuilder.jsx
      DepositStatement.jsx
      PDFPreview.jsx         ← Hidden div used for html2canvas capture
      
    /settings
      SettingsPage.jsx
      DataManagement.jsx
      
  App.jsx                    ← Tab routing, RentContext provider wrapper
  index.js
```

---

## 10. Build Order (Recommended for Agent)

Build in this exact sequence to ensure dependencies are available:

```
Step 1  → Set up RentContext, reducer, localStorage persistence, utility functions
Step 2  → Build UI primitives: Card, Badge, Button, Input, Select, Modal, BottomTabBar
Step 3  → Rooms module: RoomList, RoomCard, RoomForm
Step 4  → Tenants module: TenantList, TenantCard, TenantForm
Step 5  → Tenancy flows: AssignRoomModal, VacateTenantModal (with double room co-tenant logic)
Step 6  → Bills module: BillDashboard, BillEntryForm with all calculation logic
Step 7  → Payment recording and status tracking
Step 8  → Paperwork: ReceiptGenerator, AgreementBuilder, DepositStatement + PDF export
Step 9  → Settings: property info, vacancy policy, JSON export/import
Step 10 → Polish: empty states, loading states, validation, confirmation dialogs
```

---

## 11. Edge Cases the Agent Must Handle

| Scenario | Expected Behaviour |
|---|---|
| Tenant moves in on the 15th | Prorate rent for only 15–31 days |
| Tenant moves out on the 10th | Prorate rent for only 1–10 days |
| Double room, one tenant leaves mid-month | Both prorated charges appear on that month's bill |
| Double room goes from 2→1 tenant | Close old TenancyRecord, create new one with updated agreedRent — never mutate live record |
| Room fully vacant for a month | No charges generated; utility share handled per vacantRoomUtilityPolicy |
| Advance months paid | Auto-mark those months as "Advance" paid — do not show as pending |
| Generating receipt for advance-paid month | Receipt shows amount as "Advance Payment" |
| Import JSON with missing fields | Validate and reject with clear error message — do not partially import |
| Double room, second tenant assigned | Prompt: update first tenant's rent share? (yes = close+reopen record) |

---

## 12. Sample Seed Data (for testing)

```js
rooms: [
  { id: "room_01", name: "Room 1", type: "single", floor: 1, defaultRent: 8000, vacancyPolicy: "landlord_absorbs" },
  { id: "room_02", name: "Room 2", type: "single", floor: 1, defaultRent: 8000, vacancyPolicy: "landlord_absorbs" },
  { id: "room_03", name: "Room 3", type: "double", floor: 2, defaultRent: 12000, vacancyPolicy: "tenant_pays_full" },
  { id: "room_04", name: "Room 4", type: "double", floor: 2, defaultRent: 12000, vacancyPolicy: "tenant_pays_full" },
]
```

---

*Spec version 1.0 — reviewed and corrected for historical accuracy, proration, double room edge cases, deposit tracking, and storage limits.*
