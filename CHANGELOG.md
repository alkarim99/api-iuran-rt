# Backend Release Notes & Changelog

## [v2.2.0] - Table Standardization

_Release Date: March 2026_

The update focuses on standardizing filter and sorting parameters across all transactional and master data endpoints.

### Features & Fixes (Updates)

- **Month Picker Parameter**: Modified the query structure for `GET /api/other-incomes` and `GET /api/expenses` endpoints by injecting the `payAt` parameter (YYYY-MM format) to replace obsolete filter parameters.
- **Total Iuran Calculation**: Overhauled the `GET /api/payments/total` API to use a single `payAt` date operator instead of a _start_ & _end_ range, simplifying monthly aggregation computation.
- **Joi Validation Fixes**: Fixed a _type-casting_ bug in the Warga Data `filterSchema` (DTO) validation, ensuring the `order` input is processed as a valid directional number (1/-1) for MongoDB Sort.

---

## [v2.1.0] - UX Polish

_Release Date: March 2026_

This minor version focuses on the stability of the existing system from the application's UI response cycle.

### Features & Fixes (Updates)

- No structural database schema changes or _breaking changes_ to the main API router.
- Aligned response codes to be consistent with frontend _sweetalert_ requirements for _UX shortcut redirections_.

---

## [v2.0.0] - Iuran RT API V2

Version 2 is a massive architectural update that introduces financial analytics modules, an audit system, and scalability for recording payment periods.

### New Features

- **Complete Financial Module**:
  - Added _Expense_ API (`/api/expenses`).
  - Added _Other Incomes_ API (`/api/other-incomes`).
- **Reporting & Analytics (Report API)**:
  - `Report Pricing Tier` endpoint for classifying Warga payment metrics (Type 75k, 110k, etc.).
  - `RT Cash Balance` endpoint calculating the difference between _Incomes_ and _Expenses_ with decimal precision (.toFixed).
  - Payment Method Report endpoint (Cash/Bu Agus & Transfer/Bu Harris).
- **Master Audit Log (Activity Tracker)**:
  - Automatic tracking system running asynchronously in the _background_ to track `CREATE`, `UPDATE`, and `DELETE` activities.
  - Segregated into respective collections (`activity_logs_payment`, `activity_logs_user`, `activity_logs_warga`).
  - Recording of historical _JSON Payload_ comparisons (`old_data` vs `new_data`).
- **Iuran Extraction Details**: Monthly dues now detail fund distribution (RT, PKK, Social, Death).
- **Background Worker**: `syncWargaToPayments` to automatically repair _denormalized_ data in the payment _collection_ if a warga's name/address is modified.

### Fixes

- Fixed the _Natural Sorting Algorithm_ in the Warga repository so address blocks (e.g., K2-6 vs K2-12) are sorted numerically correctly.
- Fixed 401/403 responses with JWT Token filter protection and Admin Role _Authorization_ middleware locked more strictly (`/api` prefixing).

---

## [v1.0.0] - Legacy Initial Release

### Main Features

- **Authentication**: Login and route protection using JSON Web Tokens (JWT).
- **Warga Management**: Single CRUD API to record names and addresses of Warga in 1 housing/RT area.
- **Iuran Recording**: Basic CRUD API to record warga deposits along with payment periods (month/year) and basic recording methods.
- **Database**: Separation of collection connection logic structurally into a Multi-Database architecture (`dbUser`, `dbWarga`, and `dbPayment`) on the MongoDB system.
