# API Endpoints

**Base URL (local):** `http://127.0.0.1:8000`

**Base URL (demo):** Coming soon - will be deployed with seed data.

> All endpoints return **JSON** (except PDF endpoints, which return `application/pdf`).

---

## Table of Contents

- [Root](#root)
- [Employees](#employees)
- [Boats](#boats)
- [Attendance](#attendance)
- [Payroll](#payroll)
- [Expenses](#expenses)
- [Materials](#materials)
- [Material Usages](#material-usages)
- [Suppliers](#suppliers)
- [Invoices](#invoices)
- [Settings (Named Items)](#settings-named-items)
- [Dashboard](#dashboard)
- [Reports and PDFs](#reports-and-pdfs)
- [Swagger UI](#swagger-ui)
- [Errors](#errors)
- [Authentication](#authentication)

---

## Root

| Method | Path | Description |
|---|---|---|
| `GET` | `/` | Health check - returns `{"message": "API works fine"}` |

---

## Employees

| Method | Path | Description |
|---|---|---|
| `GET` | `/employees/` | List all employees |
| `POST` | `/employees/` | Create a new employee |
| `PUT` | `/employees/{id}` | Update an employee |
| `DELETE` | `/employees/{id}` | Delete (blocked if attendance records exist) |

**POST/PUT body:**

```json
{
  "name": "George Papadopoulos",
  "daily_wage": 60.0,
  "overtime_rate": 8.5,
  "bank_daily_amount": 45.0
}
```

---

## Boats

| Method | Path | Description |
|---|---|---|
| `GET` | `/boats/` | List all boats |
| `POST` | `/boats/` | Create a new boat |
| `PUT` | `/boats/{id}` | Update a boat |
| `DELETE` | `/boats/{id}` | Delete a boat |
| `GET` | `/boats/{id}/analysis?start=&end=` | Cost analysis for a date range |
| `GET` | `/boats/{id}/analysis/pdf?start=&end=` | PDF detailed analysis |
| `GET` | `/boats/{id}/short-analysis/pdf?start=&end=&is_captain=` | PDF short analysis (per employee) |
| `GET` | `/boats/{id}/full-report/pdf?start=&end=` | PDF full report (personnel + materials + invoices) |

**Query params:**
- `start` - YYYY-MM-DD
- `end` - YYYY-MM-DD
- `is_captain` - true / false (default: false)

---

## Attendance

| Method | Path | Description |
|---|---|---|
| `POST` | `/attendance/` | Create or update attendance (upsert on date + employee_id) |
| `GET` | `/attendance/{date}` | Attendance for a specific day |
| `GET` | `/attendance/last-before/{date}` | Last day with attendance before the given date |

**POST body:**

```json
{
  "date": "2026-10-05",
  "employee_id": 1,
  "boat_id": 2,
  "overtime_boat_id": 3,
  "present": true,
  "is_half_day": false,
  "overtime_hours": 2.0,
  "extra_amount": 0,
  "extra_reason": ""
}
```

> **Important:** When a new record is created, the backend snapshots `daily_wage`, `overtime_rate`, `bank_daily_amount`, and `employee_name`. This ensures historical data stays correct even if the employee's wage is updated later.

---

## Payroll

| Method | Path | Description |
|---|---|---|
| `GET` | `/payroll/?start=&end=` | Calculate payroll (JSON) |
| `GET` | `/payroll/pdf?start=&end=` | PDF payroll report |

**Response (JSON):**

```json
{
  "start_date": "2026-10-01",
  "end_date": "2026-10-31",
  "payments": [
    {
      "employee_id": 1,
      "employee_name": "George Papadopoulos",
      "days_worked": 22.0,
      "total_wage": 1320.0,
      "total_overtime_hours": 8.0,
      "total_overtime": 68.0,
      "total_extra": 0,
      "extra_reasons": "",
      "grand_total": 1388.0,
      "bank_pay": 1170.0,
      "cash_pay": 218.0
    }
  ]
}
```

**Business logic highlights:**
- Bank days cap: 26 days for periods longer than 16 days, otherwise 13 days
- Cash remainder is rounded to 50 EUR increments

---

## Expenses

| Method | Path | Description |
|---|---|---|
| `GET` | `/expenses/?start=&end=&boat_id=&emp_id=` | Detailed expense records |

**Query params (all optional except start/end):**
- `start`, `end` - required
- `boat_id` - filter by boat
- `emp_id` - filter by employee

---

## Materials

| Method | Path | Description |
|---|---|---|
| `GET` | `/materials/` | List all materials (price list) |
| `POST` | `/materials/` | Create a new material |
| `PUT` | `/materials/{id}` | Update a material |
| `DELETE` | `/materials/{id}` | Delete a material |

**Body:**

```json
{
  "name": "Primer Antifouling",
  "category": "Paints",
  "unit": "5L",
  "price": 58.0
}
```

---

## Material Usages

| Method | Path | Description |
|---|---|---|
| `GET` | `/material-usages/` | List all material usages |
| `POST` | `/material-usages/` | Create new usage (auto-aggregates if same date + material + boat exists) |
| `PUT` | `/material-usages/{id}` | Update a usage |
| `DELETE` | `/material-usages/{id}` | Delete a usage |
| `GET` | `/material-usages/pdf?start=&end=&material_id=&category=&boat_id=` | PDF consumption analysis |

**Body:**

```json
{
  "date": "2026-10-05",
  "material_id": 5,
  "boat_id": 2,
  "quantity": 2.0,
  "unit_price": 58.0,
  "total_price": 116.0
}
```

---

## Suppliers

| Method | Path | Description |
|---|---|---|
| `GET` | `/suppliers/` | List all suppliers (alphabetically) |
| `POST` | `/suppliers/` | Create a new supplier |
| `PUT` | `/suppliers/{id}` | Update a supplier |
| `DELETE` | `/suppliers/{id}` | Delete a supplier |

**Body:**

```json
{
  "name": "Marine Paints SA",
  "afm": "123456789",
  "phone": "2101234567",
  "email": "info@marinepaints.gr",
  "notes": "Delivery Mon-Fri"
}
```

---

## Invoices

| Method | Path | Description |
|---|---|---|
| `GET` | `/invoices/` | List all invoices |
| `POST` | `/invoices/` | Create a new invoice |
| `PUT` | `/invoices/{id}` | Update an invoice |
| `DELETE` | `/invoices/{id}` | Delete an invoice |
| `GET` | `/invoices/pdf?start=&end=&supplier_id=&boat_id=` | PDF invoice analysis |

**Body:**

```json
{
  "date": "2026-10-05",
  "amount": 550.0,
  "supplier_id": 1,
  "boat_id": 2
}
```

---

## Settings (Named Items)

Same pattern for 3 categories:

| Category | Endpoint Base |
|---|---|
| Invoice Categories | `/invoice-categories/` |
| Material Units | `/material-units/` |
| Material Categories | `/material-categories/` |

**Endpoints per category:**
- `GET /{category}/`
- `POST /{category}/`
- `PUT /{category}/{id}`
- `DELETE /{category}/{id}`

**Body:**

```json
{ "name": "Paints" }
```

---

## Dashboard

| Method | Path | Description |
|---|---|---|
| `GET` | `/dashboard/?target_month=YYYY-MM` | Dashboard data for a month (defaults to current month) |

**Response:**

```json
{
  "month": "2026-10",
  "total": 12450.50,
  "prev_month_total": 11200.00,
  "breakdown": {
    "employees": 5200.00,
    "materials": 3500.50,
    "invoices": 3750.00
  },
  "daily_trend": [
    { "date": "2026-10-01", "payroll": 350.0, "materials": 0, "invoices": 0 }
  ],
  "today_status": {
    "date": "2026-10-05",
    "attendance_recorded": true
  },
  "boats_ranking": [
    { "boat_id": 1, "boat_name": "Artizan", "total": 4500.00 },
    { "boat_id": 2, "boat_name": "Aegean Star", "total": 3200.00 }
  ]
}
```

**Includes:**
- Current month totals + previous month comparison
- Daily breakdown (payroll, materials, invoices) for charting
- Today's attendance status
- Top 5 boats by YTD spending

---

## Reports and PDFs

Summary of all PDF endpoints:

| Endpoint | Report |
|---|---|
| `GET /payroll/pdf` | Payroll for a period |
| `GET /boats/{id}/analysis/pdf` | Detailed cost breakdown for a boat |
| `GET /boats/{id}/short-analysis/pdf` | Short analysis (per employee) |
| `GET /boats/{id}/full-report/pdf` | Full report (personnel + materials + invoices) |
| `GET /material-usages/pdf` | Material consumption analysis |
| `GET /invoices/pdf` | Invoice analysis |

**Common characteristics:**
- Format: A4 (portrait) or A4 landscape for payroll
- Header: Navy `#05407a` with white text
- Logo: Client PNG logo in the header (on full reports)
- Font: Arial (for full Greek character support)

---

## Swagger UI

All endpoints are interactive at:

**http://localhost:8000/docs**

Note: The base URL is currently hardcoded - works locally. It will be configurable via environment variable after deployment.

From there you can:
- Browse the schema of each endpoint
- Send test requests directly from the browser
- Download the OpenAPI spec (`/openapi.json`)

---

## Errors

The API uses standard HTTP status codes:

| Code | Meaning |
|---|---|
| `200` | Success |
| `400` | Bad request (validation error) |
| `404` | Resource not found |
| `500` | Server error |

**Error response format:**

```json
{ "detail": "Employee not found" }
```

---

## Authentication

There is currently no authentication. The API is open for local development and demo purposes.

JWT authentication can be added in a future iteration.