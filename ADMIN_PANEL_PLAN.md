# 🛡️ Admin Panel — Implementation Plan (Pasmand / Tejen)

> **Target Framework:** Metronic Admin Dashboard  
> **API Base URL:** `https://sapi.sofaweb-meta.ir/api`  
> **Auth Model:** JWT — Header: `token: Bearer <TOKEN>`  
> **Language:** Persian (RTL) — Header: `lang: fa`  
> **Document Date:** 2026-02-24

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Dashboard](#2-dashboard)
3. [Users Management](#3-users-management)
4. [Orders Management](#4-orders-management)
5. [Waste Categories](#5-waste-categories)
6. [Wastes (Products)](#6-wastes-products)
7. [Withdrawals](#7-withdrawals)
8. [Time Slots](#8-time-slots)
9. [Tickets (Support)](#9-tickets-support)
10. [Banners](#10-banners)
11. [Locations (State & City)](#11-locations-state--city)
12. [File Manager](#12-file-manager)
13. [Invitations (Referral)](#13-invitations-referral)
14. [Implementation Priority](#14-implementation-priority)

---

## 1. Authentication

### Login Page (`/admin/login`)

Admin uses **username/password** authentication (not OTP).

| Action | Method | Endpoint |
|--------|--------|----------|
| Login | `POST` | `/users/auth/driver/login` |
| Change Password | `POST` | `/users/auth/changePass` |

**Login Payload:**
```json
{
  "username": "admin",
  "password": "123"
}
```

**Login Response:** Returns a JWT token. Store it and send as `token: Bearer <JWT>` header on all subsequent requests.

**Change Password Payload:**
```json
{
  "username": "admin",
  "oldPassword": "123",
  "newPassword": "456"
}
```

### Auth Guard
- Store token in localStorage / cookie
- On 401 response → clear session → redirect to `/admin/login`
- Check user role after login to ensure admin access

---

## 2. Dashboard

### Page: `/admin/dashboard`

Dashboard shows KPI summary cards and recent activity. **No dedicated dashboard API** — use existing list endpoints with `perpage=1` to get counts.

| KPI Card | How to Get |
|----------|------------|
| **Total Users** | `GET /users?perpage=1&page=1` → read `CountOfData` from response |
| **Pending Orders** | `GET /Order/admin/?status=pending&perpage=1` → read `CountOfData` |
| **Collected Orders** | `GET /Order/admin/?status=collected&perpage=1` → read `CountOfData` |
| **Pending Withdrawals** | `GET /withdrawal/?status=pending` → count results |
| **Open Tickets** | `GET /Tickets` → filter by status client-side |

**Additional elements:**
- Recent 5 orders table: `GET /Order/admin/?page=1&perpage=5`
- Recent 5 pending withdrawals: `GET /withdrawal/?status=pending`
- Quick links to key modules

---

## 3. Users Management

### Pages: `/admin/users` (list) · `/admin/users/:id` (detail/edit)

| Action | Method | Endpoint | Auth |
|--------|--------|----------|------|
| List users (paginated) | `GET` | `/users?perpage=20&page=1` | ✅ |
| Find user by ID | `GET` | `/users/find/?id={id}` | ✅ |
| Get user info (self) | `GET` | `/users/userInfo` | ✅ |
| Update user (by admin) | `POST` | `/users/UpdateByadmin?id={id}` | ✅ |
| Change user role | `POST` | `/users/updateRole/{id}` | ✅ |
| Upload profile image | `POST` | `/users/updateProfile/` | ✅ |
| Delete user | `DELETE` | `/users/{id}` | ✅ |

### Users List Page Features
- Data table with columns: Name, Phone, Role, Balance, Score, Date
- Pagination controls
- Search by user ID
- Row click → navigate to detail
- Delete action with confirmation modal

### User Detail Page Features
- View/edit: name, lastName, nationalId, email, shaba, referralCode
- Edit finance (balance): `{ "finance": "15000" }`
- Change role dropdown: `{ "role": "blogger" }` — roles: `user`, `driver`, `blogger`, `admin`
- Upload profile image (FormData with key `image`)
- View user's orders (link to orders filtered by user)
- View user's invitations (link to invitations filtered by user)

**Update By Admin Payload (any combination of fields):**
```json
{
  "name": "Hossein",
  "lastName": "bazei",
  "nationalId": "2120...",
  "email": "h@g.com",
  "shaba": "5859...",
  "finance": "15000",
  "referralCode": "6292412"
}
```

**Set Role Payload:**
```json
{
  "role": "blogger"
}
```

---

## 4. Orders Management

### Pages: `/admin/orders` (list) · `/admin/orders/:id` (detail)

| Action | Method | Endpoint | Query Params |
|--------|--------|----------|--------------|
| List orders (admin) | `GET` | `/Order/admin/?page=1` | `status`, `user`, `page`, `perpage` |
| Find order | `GET` | `/Order/find?id={id}` | — |
| Accept order (admin) | `POST` | `/order/admin/Accept/{id}` | — |
| Update order (admin) | `POST` | `/order/admin/update/{id}` | — |
| Delete order | `DELETE` | `/Order/{id}` | — |

### Order Statuses
| Status | Persian | Color |
|--------|---------|-------|
| `pending` | در انتظار | 🟡 Yellow |
| `collected` | جمع‌آوری شده | 🟢 Green |
| `cancelled` | لغو شده | 🔴 Red |

### Orders List Page Features
- Data table: Order ID, User Name, Status, Address, Date, Total Price
- **Filter tabs** by status: All / Pending / Collected / Cancelled
- Filter by user ID
- Pagination
- Row click → navigate to detail

### Order Detail Page Features
- Full order info: user, address, time slot, wastes, status, description
- **Accept Order** button (for pending orders):
```json
{
  "wastes": [
    { "item": "WASTE_ITEM_ID", "count": 2 },
    { "item": "WASTE_ITEM_ID", "count": 1 }
  ],
  "desc": "دریافت شد"
}
```
- **Update Order** — change status + add description:
```json
{
  "status": "collected",
  "desc": "جمع‌آوری انجام شد"
}
```
- **Delete Order** — with confirmation modal

---

## 5. Waste Categories

### Page: `/admin/waste-categories`

| Action | Method | Endpoint |
|--------|--------|----------|
| List categories | `GET` | `/WasteCategory/?page=1&perpage=100` |
| Find by ID | `GET` | `/WasteCategory/find?id={id}` |
| Create | `POST` | `/WasteCategory` |
| Update | `POST` | `/WasteCategory/update` |
| Soft delete | `DELETE` | `/WasteCategory/{id}` |
| Hard delete (DB) | `DELETE` | `/WasteCategory/db/{id}` |

### Page Features
- Table: Title (FA), Title (EN), Description, Status
- Inline create/edit modal
- Two delete options: soft delete (deactivate) / hard delete (permanent)

**Create / Update Payload:**
```json
{
  "title": { "fa": "الکترونیکی", "en": "electronic" },
  "desc": { "fa": "توضیحات مورد نظر", "en": "Description" }
}
```

> **Note:** Update payload should also include `_id` of the category being updated.

---

## 6. Wastes (Products)

### Pages: `/admin/wastes` (list) · `/admin/wastes/:id` (create/edit)

| Action | Method | Endpoint |
|--------|--------|----------|
| List wastes | `GET` | `/Waste/?page=1&perpage=100` |
| Find by ID | `GET` | `/waste/find?id={id}` |
| Create | `POST` | `/Waste` |
| Update | `POST` | `/Waste/update/{id}` |
| Soft delete | `DELETE` | `/waste/{id}` |
| Hard delete (DB) | `DELETE` | `/waste/db/{id}` |

### Page Features
- Table: Title, Price (per kg), Category, Image, Status
- Create/Edit form with:
  - Title (text)
  - Price (number)
  - Category (dropdown from WasteCategory list)
  - Main image (upload via FileManager → get file ID)
  - Gallery images (multi-upload → get file IDs)
  - Info/description (textarea)

**Create / Update Payload:**
```json
{
  "title": "مخلوط 2",
  "price": 10.23,
  "img": "FILE_ID",
  "info": "شامل : تمامی پسماندهای خشک...",
  "category": "CATEGORY_ID",
  "otherImg": ["FILE_ID_1", "FILE_ID_2"]
}
```

> **Image Workflow:** First upload via FileManager API → get `_id` → pass as `img` / `otherImg` values.

---

## 7. Withdrawals

### Page: `/admin/withdrawals`

| Action | Method | Endpoint |
|--------|--------|----------|
| List all withdrawals | `GET` | `/withdrawal/?status=pending` |
| Approve withdrawal | `POST` | `/withdrawal/Accept/{id}` |
| Reject / Update | `POST` | `/withdrawal/update/{id}` |

### Withdrawal Statuses
| Status | Persian | Color |
|--------|---------|-------|
| `pending` | در انتظار | 🟡 Yellow |
| `approved` | تایید شده | 🟢 Green |
| `rejected` | رد شده | 🔴 Red |

### Page Features
- Table: User Name, Amount, Method (wallet/cash), Status, Date, Description
- **Filter tabs:** Pending / Approved / Rejected
- **Approve** button:
```json
{
  "status": "approved",
  "adminDescription": "واریز شد"
}
```
- **Reject** button:
```json
{
  "status": "rejected",
  "adminDescription": "دلیل رد درخواست"
}
```

---

## 8. Time Slots

### Page: `/admin/time-slots`

| Action | Method | Endpoint |
|--------|--------|----------|
| List slots | `GET` | `/TimeSlots/?page=1&perpage=100` |
| Get valid times | `GET` | `/TimeSlots/validTimes` |
| Find by ID | `GET` | `/TimeSlots/find?id={id}` |
| Create | `POST` | `/TimeSlots` |
| Update | `POST` | `/TimeSlots/update/{id}` |
| Delete | `DELETE` | `/TimeSlots/{id}` |

### Page Features
- Calendar or table view showing days and their slots
- **Create form:** pick a date + add multiple time ranges with capacity
- Toggle active/inactive
- Delete slot

**Create Payload:**
```json
{
  "day": "2026-01-07",
  "slots": [
    { "startTime": "16:00", "endTime": "18:00", "capacity": 10 },
    { "startTime": "18:00", "endTime": "20:00", "capacity": 10 }
  ]
}
```

**Update Payload (toggle active):**
```json
{
  "active": false
}
```

---

## 9. Tickets (Support)

### Pages: `/admin/tickets` (list) · `/admin/tickets/:id` (detail/chat)

| Action | Method | Endpoint |
|--------|--------|----------|
| List all tickets | `GET` | `/Tickets` |
| Find ticket (admin) | `GET` | `/Tickets/admin/find?id={id}` |
| Edit ticket status | `POST` | `/Tickets/edit/{id}` |
| Admin response | `POST` | `/Tickets/Message/AdminResponse/{id}` |

### Ticket Statuses
| Status | Persian | Color |
|--------|---------|-------|
| `open` | باز | 🔵 Blue |
| `pending` | در انتظار | 🟡 Yellow |
| `closed` | بسته | ⚪ Gray |

### Tickets List Page Features
- Table: Title, User, Type, Status, Date
- Filter by status

### Ticket Detail Page Features
- **Chat-like interface** showing message thread (user messages + admin responses)
- **Reply box** (admin response):
```json
{
  "text": "متن پاسخ ادمین"
}
```
- **Change status** dropdown:
```json
{
  "status": "closed"
}
```

> **Note:** Creating a ticket uses FormData (key `files` for attachments, `title`, `desc`, `typeTicket`). Admin typically only responds, not creates.

---

## 10. Banners

### Page: `/admin/banners`

| Action | Method | Endpoint |
|--------|--------|----------|
| List banners | `GET` | `/Banners/` |
| Find banner | `GET` | `/Banner/find?id={id}` |
| Create banner | `POST` | `/Banners/` |
| Delete banner | `DELETE` | `/Banners/{id}` |

### Page Features
- Grid/list view with banner previews
- **Create form:** title, description, upload image → get file ID
- Delete with confirmation

**Create Payload:**
```json
{
  "title": "عنوان بنر",
  "desc": "توضیحات بنر",
  "imgBanner": "FILE_ID"
}
```

> **Image URL pattern:** `https://sapi.sofaweb-meta.ir/download/files/{filename}`

---

## 11. Locations (State & City)

### Page: `/admin/locations`

#### States

| Action | Method | Endpoint |
|--------|--------|----------|
| List all states | `GET` | `/State/all` |
| Create state | `POST` | `/state/create` |
| Create many states | `POST` | `/State/createMany` |

**Create State Payload:**
```json
{
  "name": { "fa": "خراسان رضوی", "en": "Khorasan Razavi" }
}
```

#### Cities

| Action | Method | Endpoint |
|--------|--------|----------|
| List cities by state | `GET` | `/city/all?stateId={id}` |
| Find city | `GET` | `/city/?id={id}` |
| Create city | `POST` | `/City/create` |
| Create many cities | `POST` | `/City/createMany` |
| Delete city | `DELETE` | `/city/{id}` |

**Create City Payload:**
```json
{
  "name": { "fa": "کیش", "en": "Kish" },
  "state": "STATE_ID",
  "lat": 26.5,
  "lng": 54.0
}
```

### Page Features
- **Master-detail layout:** state list on left → city list on right
- Select a state → see its cities
- Inline create/edit modals for both states and cities
- Delete cities (states may not have a delete endpoint)

---

## 12. File Manager

### Page: `/admin/files`

| Action | Method | Endpoint | Content-Type |
|--------|--------|----------|-------------|
| List files | `GET` | `/FileManager` | — |
| Upload single file | `POST` | `/FileManager/uploadFile` | `multipart/form-data` |
| Upload multiple files | `POST` | `/FileManager/uploadFiles` | `multipart/form-data` |

### Single Upload FormData Keys
| Key | Type | Example |
|-----|------|---------|
| `file` | File | image.jpg |
| `fileSection` | string | `"waste"`, `"caseDocs"` |
| `title` | string | `"وی اسناد"` |

### Multiple Upload FormData Keys
| Key | Type | Example |
|-----|------|---------|
| `files` | File[] | [img1.jpg, img2.jpg] |
| `fileSection` | string | `"caseDocs"` |
| `title` | string | `"اسناد"` |

### Page Features
- Grid/list view of all uploaded files (with preview for images)
- Upload button (single / multi)
- File section filter
- File preview / download link: `https://sapi.sofaweb-meta.ir/download/files/{filename}`

---

## 13. Invitations (Referral)

### Page: `/admin/invitations`

| Action | Method | Endpoint |
|--------|--------|----------|
| Check invitation code | `POST` | `/invatation/check` |
| List user's invitations (admin) | `GET` | `/invatation/admin/all?id={user_id}` |
| Delete invitation | `DELETE` | `/invatation/{id}` |

### Page Features
- Accessed from User detail page (show invitations by user)
- Table: Invited User, Code, Date
- Delete invitation with confirmation

**Check Code Payload:**
```json
{
  "invitedCode": "0819664"
}
```

---

## 14. Implementation Priority

### Recommended Build Order

| Phase | Modules | Complexity | Depends On |
|-------|---------|------------|------------|
| **1** | Auth (Login) | Low | — |
| **2** | Dashboard | Medium | Auth |
| **3** | Users Management | High | Auth |
| **4** | Orders Management | High | Auth, Users |
| **5** | Withdrawals | Medium | Auth, Users |
| **6** | Waste Categories + Wastes | Medium | Auth, FileManager |
| **7** | Time Slots | Medium | Auth |
| **8** | Tickets (Support) | Medium | Auth |
| **9** | File Manager | Medium | Auth |
| **10** | Banners | Low | Auth, FileManager |
| **11** | Locations (State/City) | Low | Auth |
| **12** | Invitations | Low | Auth, Users |

### Metronic Integration Notes

- **Layout:** Use Metronic's sidebar layout. Add navigation items for each module listed above.
- **Data Tables:** Use Metronic's built-in DataTable component for all list pages.
- **Forms:** Use Metronic's form components (inputs, selects, file upload).
- **Modals:** Use Metronic's modal component for confirmations and inline create/edit.
- **Cards:** Use Metronic's stat cards for the dashboard KPIs.
- **Toast/Alerts:** Use Metronic's notification system for success/error feedback.
- **RTL:** Enable Metronic's RTL mode for Persian language support.
- **HTTP Client:** Configure axios with base URL and token interceptor.

### Sidebar Navigation Structure

```
📊 داشبورد          → /admin/dashboard
👥 کاربران          → /admin/users
📦 سفارشات          → /admin/orders
🗂️ دسته‌بندی پسماند  → /admin/waste-categories
♻️ پسماندها         → /admin/wastes
💳 برداشت وجه       → /admin/withdrawals
🕒 بازه‌های زمانی    → /admin/time-slots
🎫 تیکت‌ها          → /admin/tickets
🖼️ بنرها           → /admin/banners
📍 مکان‌ها          → /admin/locations
📂 مدیریت فایل     → /admin/files
🤝 دعوت‌نامه‌ها      → /admin/invitations
```
