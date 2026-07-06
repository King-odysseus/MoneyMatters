# Money Matters — Product Requirements Document

Version: 2.0 | Date: 6 July 2026 | Status: Draft
Multi-user household finance application
**Stack: Django (backend) + React (frontend) + PostgreSQL**

---

## 1. OVERVIEW

### 1.1 Problem Statement

Households managing finances across joint income, monthly expenses, savings pots, mortgage, international investments, property projects, and micro-savings challenges often rely on complex spreadsheets. These are powerful but fragile: formulas can break, data entry is error-prone, and they do not support mobile access, notifications, or real-time multi-user collaboration.

A household spreadsheet is both a trap and a comfort. The person who built it understands every cell, formula, and colour-coded tab. The problem is not that spreadsheets are bad — it is that they do not travel, do not collaborate, do not notify, and one wrong keystroke can silently break a SUM that cascades through six tabs.

### 1.2 Vision

Money Matters is the spreadsheet's grown-up sibling, not its replacement. It preserves spreadsheet-level flexibility — users define their own categories, pots, expense names — while replacing fragility with automation, collaboration, and clarity.

The app should feel like calm competence. When you open it, you see your money clearly. The layout is dense but not cluttered. Charts are restrained: they inform, not decorate. Interactions are predictable. Nothing flashes gratuitously. The dashboard answers "how are we doing?" in under five seconds not because the data is shallow, but because the design makes the signal obvious and buries the noise.

Nothing is hardcoded. Every dropdown, every column name, every savings pot is user-defined through the Admin module. That flexibility — the sense of "I built this" — is the killer feature.

### 1.3 Target Users

Multiple users per household, each with a permission-based role:

| Role     | Capabilities                                              |
|----------|-----------------------------------------------------------|
| Admin    | Full access: user management, configuration, data deletion |
| Member   | Full read/write on all financial data, no admin settings  |
| Viewer   | Read-only access to Dashboard and reports (future)        |

Financial-labelled user profiles (Primary User, Secondary User, Joint) are descriptive labels for display and transaction attribution — they do not govern access control. Permission roles govern what users can do.

---

## 2. SCOPE AND MODULES

| # | App Module                     | Description                                              | Priority |
|---|-------------------------------|----------------------------------------------------------|----------|
| 1 | Authentication & Household     | Sign-up, login, household creation, member invites        | P0       |
| 2 | Dashboard                      | KPI cards, allocation chart, monthly trend, liquidity     | P0       |
| 3 | Income & Savings Ledger        | Month-by-month income allocation into savings pots        | P0       |
| 4 | Recurring Expense Manager      | Toggle recurring expenses on/off per month                | P0       |
| 5 | Extra/Refund Transaction Log   | Ad-hoc expenses, refunds, pot transfers, interest         | P0       |
| 6 | Mortgage Tracker               | Amortisation schedule with what-if analysis               | P0       |
| 7 | Admin / Configuration          | Categories, types, FX rates, years, pots, user management | P0       |
| 8 | Treasury Bill Portfolio        | Multi-currency T-Bill tracking with FX conversion         | P1       |
| 9 | Savings Challenge Tracker      | Weekly micro-savings challenge per user                   | P1       |
|10 | Business Accounts              | Multi-currency company expense and account tracking       | P1       |
|11 | Property Projects              | Instalment schedules and project payment logs             | P1       |
|12 | Fees Tracker                   | Multi-person, multi-currency fee payment tracking         | P2       |
|13 | Returns Log                    | Monthly savings account returns (e.g. NS&I)              | P2       |
|14 | Investment Roadmap             | Planned and completed investments with status tags        | P2       |
|15 | Crypto Holdings                | Basic crypto portfolio tracker (deferred until needed)    | P3       |

**Module notes:**

- **Liquidity Overview** is merged into the Dashboard as a collapsible "Liquid Cash Snapshot" section rather than a standalone module. A separate page adds navigation weight for what is fundamentally a summary view.
- **Investment Pipeline** is folded into Investment Roadmap. A separate module for a list of future opportunities with no calculations does not earn its own navigation item. The Roadmap module gains a "Pipeline" tab.
- **Crypto Holdings** stays at P3 and is deferred until the household actually holds crypto. It is a fundamentally different kind of asset tracker (live prices, wallet addresses, token metadata) and should not add complexity until there is a real use case.
- **Authentication & Household** is promoted to its own P0 module row. It is the first thing built and the foundation everything else sits on.

---

## 3. DETAILED MODULE REQUIREMENTS

### 3.1 Authentication & Household (P0)

**Purpose:** User sign-up, login, household creation, member invitations, and session management.

**Implementation:** Django's built-in authentication system (`django.contrib.auth`) with session-based auth. Since the React SPA is served by the same Django instance, session cookies work natively — no JWT complexity needed. A `Household` model with a foreign key on the user profile provides multi-tenancy.

**Requirements:**

AUTH-01: Email/password sign-up with email verification
AUTH-02: Session-based login; no public access — every view requires authentication
AUTH-03: First user creates a Household during onboarding; subsequent users join via invite
AUTH-04: Invite flow: Admin generates an invite link; new user registers and is auto-joined to the household
AUTH-05: Permission roles (Admin, Member, Viewer) enforced at the API level via Django permissions
AUTH-06: All API queries filtered by `household_id` — middleware stamps the household on every request; viewsets scope querysets accordingly
AUTH-07: Password reset via email
AUTH-08: Profile page: name, email, descriptive label (Primary User, Secondary User, Joint), avatar (optional)

### 3.2 Dashboard (P0)

**Purpose:** Single-screen financial health overview for the current year. Should answer "how are we doing?" in under five seconds.

**Key Metrics Cards:** Total Income (YTD), Total Expenses (YTD), Total Savings (YTD), Net Cashflow (YTD), Joint Account Balance, Investment Cash (YTD)

**Category Allocation:** Configurable categories drawn from Admin (e.g. Monthly Expenses, Rainy Day, Career Dev, Holiday Savings, Car Savings, Child Savings, Emergency Funds, Fees, Returns, Investment Cash, New Project/Mortgage)

**Liquidity Snapshot:** Collapsible section showing liquid cash across personal accounts per user (Account name, Amount, Purpose, Balance). This replaces the standalone Liquidity Overview module.

**Requirements:**

DASH-01: KPI cards at top, auto-calculated from Income & Savings Ledger
DASH-02: Donut/pie chart for Category Allocation — each slice is a household-defined category
DASH-03: Bar + line combo chart for monthly Income vs Expenses vs Net Cashflow
DASH-04: All values update in real time when underlying data changes (React Query cache invalidation)
DASH-05: Year filter (dropdown, defaults to current year)
DASH-06: Responsive layout: cards stack vertically on mobile, 3-across on desktop
DASH-07: Liquidity Snapshot section with configurable per-user account tables

### 3.3 Income & Savings Ledger (P0)

**Purpose:** Month-by-month record of joint income allocation into savings pots and expenses. This is the central data table of the application — every other module feeds into it or reads from it.

**Fields:** Month, Year, Joint Income, Savings (calc), Monthly Expenses (calc), plus one column per savings pot (configurable via Admin). Pots are dynamic: users define their own via Admin, not hardcoded columns.

**Requirements:**

MAIN-01: Editable table with one row per month; unique constraint on (year, month) prevents duplicates
MAIN-02: Auto-calculate Savings = Joint Income - Monthly Expenses
MAIN-03: Auto-calculate YTD cumulative savings balance
MAIN-04: Auto-calculate Joint Account Balance = prior year carry-forward balance + YTD savings + investment cash
MAIN-05: Pot values can go negative (withdrawals exceed contributions); display negative values in red
MAIN-06: Monthly Expenses auto-sums from Recurring Expense Manager + Extra/Refund Log
MAIN-07: Pot Breakdown drill-down per pot per month: Checklist adds, Expense from Pot, Refund to Pot, Net Movement
MAIN-08: "Add New Year" button creates 12 ledger rows, extends recurring expense months, resets challenges (via Django signal)
MAIN-09: Year tabs for navigation between fiscal years
MAIN-10: Export current year to Excel

### 3.4 Recurring Expense Manager (P0)

**Purpose:** Define recurring monthly expenses, toggle them on/off per month, auto-sum into the Ledger.

**Fields:** Expense name, Projected amount, Owner (user), Main Category, and per-month toggle state.

**Design decision — exception-based toggles:** A recurring expense is assumed active every month unless explicitly skipped. Instead of storing one row per expense per month (30 expenses x 5 years = 1,800 rows), we store only the *exceptions* in a `recurring_expense_skips` table (expense_id, month_year). This keeps the data lean and makes "add new year" trivial — no rows to create.

**Requirements:**

EXP-01: Editable table; add/remove expense rows dynamically
EXP-02: Toggle switches per month — OFF means the month is recorded as a skip; all other months are active
EXP-03: Auto-calculate monthly total: SUM of Projected for all active expenses that month
EXP-04: Category-level subtotals grouping expenses by Main Category
EXP-05: Owner filter: view by user or all
EXP-06: When a new year starts, no action needed — all months default to active
EXP-07: Changes instantly propagate to Monthly Expenses in Ledger and Dashboard via API cache invalidation

### 3.5 Extra/Refund Transaction Log (P0)

**Purpose:** Log ad-hoc transactions: extra expenses, refunds, pot transfers, interest earned.

**Fields:** Date, Category (from Admin dropdown), Type (from Admin dropdown), Amount (always positive), Notes, SignedAmount (calc), month_year (derived from date for efficient querying)

**Transaction Type Logic:**

| Type                         | Effect                                          |
|------------------------------|-------------------------------------------------|
| Expense                      | +Amount to Monthly Expenses                      |
| Refund                       | -Amount from Monthly Expenses                    |
| Expense from Pot             | -Amount from selected pot in Ledger              |
| Refund to Pot                | +Amount to selected pot in Ledger                |
| Interest earned to Pot       | +Amount to selected pot in Ledger                |
| Interest earned main account | +Amount to Joint Income                          |

**Requirements:**

LOG-01: Scrollable list view grouped by month (expandable accordion sections)
LOG-02: Category and Type fields are dropdowns populated from Admin configuration
LOG-03: SignedAmount auto-calculated based on Type (server-side, returned in API response)
LOG-04: Monthly subtotals per Type at the bottom of each month section
LOG-05: Data feeds into Ledger calculations automatically
LOG-06: Quick-add button at the top of each month group
LOG-07: Search/filter by category, type, date range, or notes keyword

### 3.6 Mortgage Tracker (P0)

**Purpose:** Full amortisation schedule with variable rates, payment changes, and what-if analysis. Supports a single mortgage per household in v1.

**Inputs:** Loan Amount, Start Date, Term (years), Initial Annual Rate, Fixed Rate Period, New Rate After Fixed, Extra Monthly Payment, Deposit Paid

**Rate Change Table:** Effective Date + Annual Rate (user-editable, supports multiple rate changes over the loan lifetime)

**Payment Change Table:** Effective Date + Monthly Payment (user-editable, supports overrides)

**Summary Metrics:** Monthly Payment, Payoff Date, Total Interest, Total Paid, Current Balance, Interest Paid to Date

**Schedule Fields:** Month number, Payment Date, Annual Rate, Payment amount, Interest portion, Principal portion, Remaining Balance, Notes

**Requirements:**

MTG-01: Input form for loan parameters with instant schedule recalculation on any input change
MTG-02: Editable rate-change table: add/remove rate changes at any date
MTG-03: Editable payment-change table: override monthly payment at any date
MTG-04: Auto-generate full amortisation schedule (up to 360 rows)
MTG-05: Summary panel with key metrics, always visible above the schedule
MTG-06: What-if mode: sliders for rate adjustment and extra payment; see impact on payoff date and total interest in real time (all calculation remains server-side; debounced API calls on slider drag)
MTG-07: Chart: balance-over-time line with principal vs interest stacked bar per payment
MTG-08: Highlight the current month row in the schedule table
MTG-09: Optionally save what-if scenarios as named comparisons (stretch goal)

### 3.7 Admin / Configuration (P0)

**Purpose:** Household-level configuration for all dynamic lists and settings. This is the module that makes the app feel like the user's own spreadsheet.

Django's built-in admin (`/admin/`) handles raw CRUD for configuration tables. The custom React admin pages focus on user-friendly configuration workflows: inviting members, reordering pots, managing the household profile.

**Configurable Entities:**

- **Savings Pots:** Name and display order (drag-to-reorder). These become columns in the Ledger and slices in the Dashboard donut chart.
- **Expense Categories:** Name. Used by Recurring Expense Manager and Extra/Refund Log dropdowns.
- **Transaction Types:** Name and effect logic (which calculation to trigger). Defaults: Expense, Refund, Expense from Pot, Refund to Pot, Interest earned to Pot, Interest earned main account.
- **FX Rates:** Currency pair (from_currency, to_currency) and rate. Shared across all multi-currency modules.
- **Years:** Create/archive fiscal years. Creating a new year triggers the signal cascade.
- **Household Profile:** Name, base currency (default GBP), fiscal year start month.

**Requirements:**

CFG-01: Savings Pots management with drag-to-reorder for display order
CFG-02: Category management: add/edit/delete; changes propagate to all dropdowns
CFG-03: Transaction Type management: add/edit/delete
CFG-04: FX Rate management: multiple currency pairs, single source of truth
CFG-05: Year management: add new year (triggers signal cascade), archive old years
CFG-06: User management: invite new members, change roles, remove members
CFG-07: Household profile: name, base currency, fiscal start month

### 3.8 Treasury Bill Portfolio (P1)

**Purpose:** Track treasury bill investments across multiple countries/portfolios with FX conversion to base currency.

**Fields per T-Bill:** Portfolio name, Month, Face Value (local currency), Discount Value, Maturity Date, Tenor (days), Discount Rate (%), Profit (local), Value in base currency, Profit in base currency

**Embedded Calculator Inputs:** Face Value, Amount Invested (optional), Discount Rate, Tenor, Investment Date, FX Rate
**Calculator Outputs:** Purchase Price, Interest/Profit, Total at Maturity, Maturity Date, base currency equivalents

**Requirements:**

TBILL-01: Separate portfolio views per country/account (configurable portfolio names)
TBILL-02: Add new T-Bill entry with auto-calculation from calculator inputs
TBILL-03: Embedded calculator: fill inputs, see results instantly (client-side math for responsiveness, server-verified on save)
TBILL-04: FX rate pulled from Admin config; option to fetch live rates in future
TBILL-05: Yearly totals row per portfolio
TBILL-06: Maturity calendar view showing upcoming maturities

### 3.9 Savings Challenge Tracker (P1)

**Purpose:** Weekly micro-savings challenge per household member. Default: 52-week incrementing challenge (week 1 = GBP 1, week 2 = GBP 2, ..., week 52 = GBP 52; total target = GBP 1,378).

**Requirements:**

CHAL-01: Side-by-side trackers per user (or toggle between users)
CHAL-02: Tap-to-complete toggle per week
CHAL-03: Progress ring showing % of target reached
CHAL-04: Summary cards: Total Saved, Weeks Completed, Remaining
CHAL-05: Configurable increment amount and starting value per challenge
CHAL-06: "Reset for new year" action (triggered automatically when new year is added via Admin)
CHAL-07: Reminder notification when a week is not marked complete (future, P3)

### 3.10 Business Accounts (P1)

**Purpose:** Track company expenses and multi-currency business accounts.

**Sections:**
- Company Expenses: Item, Amount in base currency, Status (paid/pending/owed), Notes
- Business Accounts: Account name, Description, Amount in local currency, Amount in base currency, Currency, Notes

**Requirements:**

BIZ-01: Configurable number of account tables per business entity
BIZ-02: Shared FX rate from Admin config; changing the rate recalculates all conversions
BIZ-03: Status field with colour-coded indicators (green = paid, amber = pending, red = owed)
BIZ-04: Totals row per section with base currency sum
BIZ-05: Add/remove expense items and account entries dynamically

### 3.11 Property Projects (P1)

**Purpose:** Track property/building project payments and instalment schedules.

**Sections:**
- General Project Log: Date, Amount, Currency, Purpose — running total
- Instalment Schedules per property: Instalment number, Amount, Due Date, Paid status (toggle), Remaining Balance (calc)

**Requirements:**

PROP-01: Editable project log with auto-calculated running total
PROP-02: Instalment schedule view with paid/unpaid toggle per instalment
PROP-03: Auto-calculate remaining balance = total instalments - sum of paid
PROP-04: Highlight the next due (unpaid) instalment
PROP-05: Timeline/Gantt view showing payment milestones (nice-to-have, stretch)

### 3.12 Fees Tracker (P2)

**Purpose:** Track fee payments for multiple people in multiple currencies. Feeds into the Ledger Fees column.

**Requirements:**

FEES-01: Configurable sub-tables per person: Notes, Amount (local currency), Amount (base currency), Currency
FEES-02: Auto-convert to base currency using shared FX rates from Admin
FEES-03: Remaining Fees summary metric
FEES-04: Data feeds into Ledger Fees column for the relevant month

### 3.13 Returns Log (P2)

**Purpose:** Track monthly savings account returns (e.g. NS&I interest, premium bond prizes).

**Requirements:**

NSI-01: Simple month-by-amount grid: one row per month, columns for each return source
NSI-02: Auto-sum annual total per source and combined
NSI-03: Data feeds into Ledger Returns column

### 3.14 Investment Roadmap (P2)

**Purpose:** Track planned and completed investments. The former Investment Pipeline module is merged into this one as a "Pipeline" tab.

**Sections:**
- Expenses (property/setup costs related to investments)
- Investments Done (target allocations with status tracking)
- Pipeline (future investment opportunities — merged from standalone module)

**Requirements:**

INV-01: Three tabs: Expenses, Done, Pipeline
INV-02: Status tags per investment: Done (green), In Progress (amber), Default (red)
INV-03: Total calculations per table
INV-04: Pipeline tab: a simple list of opportunities with estimated amount, notes, and priority

### 3.15 Crypto Holdings (P3 — Deferred)

**Purpose:** Basic crypto portfolio tracker. **Deferred until there is a real use case.** This is a fundamentally different kind of asset tracker requiring live price feeds, wallet address tracking, and token metadata — complexity that should not be added speculatively.

**Placeholder requirements:**

CRY-01: Table: Owner, Month, Amount, Token/Coin symbol
CRY-02: Manual price entry with optional live price lookup (future API integration)

---

## 4. CROSS-CUTTING REQUIREMENTS

### 4.1 Data Flow

All financial calculations live server-side in Django service functions. The frontend never performs financial math — it displays what the API returns.

```
Recurring Expense Manager --+
Extra/Refund Log -----------+
                            +--> Income & Savings Ledger --> Dashboard
Returns Log ----------------+
Fees Tracker ---------------+

Admin Config --------------> Dropdowns everywhere
Admin Config --------------> FX rates (all multi-currency modules)
Admin Config --------------> Savings pots (Ledger columns + Dashboard slices)
```

When a transaction is logged or modified, the server recalculates the affected ledger row and any downstream aggregates. React Query invalidates the affected cache keys, and the frontend refetches. This eliminates the "my phone shows a different number than my laptop" problem.

### 4.2 API Design Principles

- **Django REST Framework** with ViewSets and ModelSerializers
- Each module gets its own API namespace: `/api/ledger/`, `/api/expenses/`, `/api/transactions/`, etc.
- Every viewset scopes its queryset by `request.household` — middleware stamps the household on the request object
- Endpoints return exactly what the component needs; no under-fetching requiring multiple round trips, no over-fetching that bloats responses
- Write operations are transactional: logging a transaction and recalculating the ledger happen in a single database transaction
- All amounts stored as `DecimalField(max_digits=12, decimal_places=2)` — no floating-point in financial data

### 4.3 Frontend State Management

- **React Query (TanStack Query)** for all server data: automatic caching, background refetch, cache invalidation, optimistic mutations
- **React Context** for lightweight UI state: which year is selected, which pot is expanded, filter values
- No Redux. The complexity-to-value ratio is not justified here.

### 4.4 Authentication & Multi-User

AUTH-01: Django session authentication — the React SPA is served by the same Django instance, so session cookies work natively
AUTH-02: All users within a household see all household data; actions are attributed to the acting user
AUTH-03: Middleware stamps `request.household` on every authenticated request
AUTH-04: Permission roles (Admin, Member, Viewer) enforced via Django's permission system
AUTH-05: Strict household data isolation: no query ever returns data from another household

### 4.5 Currency & Localisation

CUR-01: Configurable base currency per household (default GBP)
CUR-02: Support unlimited secondary currencies (e.g. NGN, KES, USD, EUR)
CUR-03: FX rates manually set in Admin; future optional API integration for live rates
CUR-04: All amounts display with appropriate currency symbol and 2 decimal places
CUR-05: FX rates are a single source of truth in Admin config — changing a rate recalculates all dependent values

### 4.6 Data Persistence

DATA-01: PostgreSQL database with Django ORM (migrations, querysets, transactions)
DATA-02: Audit trail on financial fields using `django-simple-history` (tracks old/new values, user, timestamp per changed record)
DATA-03: Nightly automated database backup (PostgreSQL `pg_dump`, 30-day retention)
DATA-04: Excel import via Django management command (`python manage.py import_excel workbook.xlsx`) — run once during migration, not a user-facing feature
DATA-05: Excel export available from the UI: full workbook or single module

### 4.7 Notifications (Future, P3)

NOTIF-01: Monthly reminder: "Enter this month's income and expenses"
NOTIF-02: Savings challenge weekly reminder
NOTIF-03: Mortgage payment due reminder
NOTIF-04: Property instalment due date alert
NOTIF-05: T-Bill maturity alert

---

## 5. TECHNICAL ARCHITECTURE

### 5.1 Technology Stack

| Layer           | Technology                                           |
|-----------------|------------------------------------------------------|
| Frontend        | React 18+ with TypeScript                            |
| Styling         | Tailwind CSS                                         |
| UI Components   | shadcn/ui                                            |
| Charts          | Recharts                                             |
| State           | TanStack Query (server state) + React Context (UI)   |
| Backend         | Django 5.x with Django REST Framework                |
| Database        | PostgreSQL 16+                                       |
| Auth            | Django session authentication                        |
| Admin           | Django admin (raw CRUD) + custom React pages (config) |
| Audit           | django-simple-history                                |
| Task Queue      | Django Q or Celery (for backups, future notifications) |
| Hosting         | Vercel (frontend) + Railway or Hetzner (backend + DB) |

### 5.2 Database Schema (High-Level)

```
households
  id, name, base_currency, fiscal_year_start_month, created_at

users (extends Django User model)
  id, household_id (FK), display_name, descriptive_role, avatar_url

years
  id, household_id (FK), year, is_archived

savings_pots
  id, household_id (FK), name, display_order

monthly_ledger
  id, year_id (FK), month (1-12), joint_income, savings, monthly_expenses
  UNIQUE(year_id, month)

ledger_pot_values
  id, ledger_id (FK), pot_id (FK), amount

recurring_expenses
  id, household_id (FK), name, projected_amount, owner_id (FK to users), main_category

recurring_expense_skips
  id, expense_id (FK), month_year (date, first of month)
  UNIQUE(expense_id, month_year)

extra_transactions
  id, household_id (FK), date, category, type, amount, notes,
  signed_amount, month_year (derived from date), pot_id (FK, nullable)

mortgage_config
  id, household_id (FK), loan_amount, start_date, term_years,
  initial_rate, fixed_period, new_rate, extra_payment, deposit

rate_changes
  id, mortgage_id (FK), effective_date, annual_rate

payment_changes
  id, mortgage_id (FK), effective_date, monthly_payment

treasury_bills
  id, household_id (FK), portfolio, month, face_value, discount_value,
  maturity_date, tenor, discount_rate, profit, base_value, base_profit, currency

savings_challenge_config
  id, user_id (FK), year, increment, start_amount

savings_challenge_weeks
  id, config_id (FK), week_number, amount, completed

company_expenses
  id, household_id (FK), item, amount_base, status, notes

business_accounts
  id, household_id (FK), account_name, description, amount_local,
  amount_base, currency, notes

property_projects
  id, household_id (FK), project_name, date, amount, currency, purpose

property_instalments
  id, project_id (FK), instalment_number, amount, due_date, paid

fees
  id, household_id (FK), person_name, notes, amount_local, amount_base, currency

returns_log
  id, household_id (FK), year, month, source, earnings

fx_rates
  id, household_id (FK), from_currency, to_currency, rate, updated_at
  UNIQUE(household_id, from_currency, to_currency)

categories
  id, household_id (FK), name, display_order

transaction_types
  id, household_id (FK), name, effect_logic
```

### 5.3 Key Architectural Decisions

1. **Multi-tenant by household.** Each household is an isolated data silo. Middleware stamps `household_id` on every request. Every viewset scopes its queryset by it. No cross-household data leakage possible.

2. **Calculation engine is server-side.** All financial math lives in Django service modules. Derived values are computed on write and cached in the database (not computed on read). The frontend displays, never calculates.

3. **Event-driven updates via Django signals.** Logging a transaction triggers recalculation of the affected ledger row and downstream aggregates. Adding a new year triggers creation of 12 ledger rows and challenge reset. Everything happens in a single database transaction per write.

4. **Year as a first-class entity.** `Year` is an explicit model with a `post_save` signal that creates ledger rows and resets challenges. This keeps the "add new year" workflow as a single operation.

5. **Exception-based recurring expense toggles.** Expenses are active by default. Only skipped months are stored, keeping the `recurring_expense_skips` table lean.

6. **Immutable audit trail.** `django-simple-history` records every change to financial fields with old value, new value, user, and timestamp. No hand-rolled trigger logic.

7. **Savings pots are dynamic.** Users define pot names and order via Admin. Pots become Ledger columns and Dashboard chart slices at runtime — no schema migration needed to add a pot.

8. **Derived `month_year` on transactions.** Stored alongside `date` for efficient month-grouped queries without date truncation in SQL. Set automatically on save, not exposed for manual editing.

9. **FX rates as single source of truth.** One `fx_rates` table in Admin. All multi-currency modules read from it. Changing a rate recalculates all dependent values.

---

## 6. USER FLOWS

### 6.1 Onboarding a New Household

1. First user signs up with email and password
2. Creates a Household: name, base currency (default GBP), fiscal year start month
3. Configures savings pots: names and display order
4. Sets up expense categories and transaction types (defaults provided)
5. Optionally runs `manage.py import_excel` to migrate existing spreadsheet data
6. Invites other household members via email
7. Each invited member registers and is auto-joined to the household

### 6.2 Monthly Data Entry (Primary Flow)

1. User logs in, lands on Dashboard showing current year KPIs
2. Navigates to Income & Savings Ledger, enters Joint Income for the month
3. Visits Recurring Expense Manager, toggles any expenses that changed this month
4. Visits Extra/Refund Log, adds any ad-hoc transactions
5. Returns to Dashboard — all KPIs and charts reflect the new data

### 6.3 Adding a New Recurring Expense

1. Navigate to Recurring Expense Manager
2. Click "Add Expense"
3. Enter name, projected amount, owner, main category
4. The expense is active for all months by default — toggle off any months where it does not apply
5. Save; monthly totals recalculate; Ledger and Dashboard update

### 6.4 Mortgage What-If Analysis

1. Navigate to Mortgage Tracker
2. Toggle "What If" mode
3. Drag the rate slider or adjust extra payment amount
4. Payoff date and total interest update in real time (debounced API calls)
5. Optionally save the scenario as a named comparison (stretch goal)

### 6.5 Logging a T-Bill Purchase

1. Navigate to Treasury Bill Portfolio
2. Select portfolio (country/account)
3. Click "New T-Bill"
4. Use the embedded calculator: enter Face Value, Discount Rate, Tenor, Investment Date
5. Calculator shows Purchase Price, Profit, and base currency equivalents
6. Save — entry appears in the portfolio table

---

## 7. NON-FUNCTIONAL REQUIREMENTS

| Requirement      | Target                                                                           |
|------------------|----------------------------------------------------------------------------------|
| Performance      | Dashboard loads under 2 seconds; all calculations under 500ms                    |
| Availability     | 99.5% uptime minimum                                                             |
| Security         | HTTPS, hashed passwords (Django default: PBKDF2), session cookies HttpOnly+Secure, no financial data in client logs |
| Responsiveness   | Fully usable on mobile (375px+), tablet, and desktop                             |
| Accessibility    | WCAG 2.1 AA: proper contrast ratios, keyboard navigation, screen reader labels   |
| Data Integrity   | All writes transactional; no partial updates; financial fields use Decimal, never float |
| Backup           | Daily automated pg_dump with 30-day retention                                    |
| Multi-tenancy    | Strict household data isolation; middleware-enforced at the queryset level        |
| Browser Support  | Modern evergreen browsers: Chrome, Firefox, Safari, Edge                         |

---

## 8. TESTING STRATEGY

### 8.1 Backend (Django)

- **Unit tests** for all calculation service functions: amortisation schedule, ledger aggregation, FX conversion, savings challenge math
- **Model tests** for constraints (unique together, Decimal precision, required fields)
- **API tests** for every endpoint: correct status codes, correct data shapes, household isolation, permission enforcement
- **Signal tests:** adding a year creates the right ledger rows; logging a transaction updates the right aggregates

### 8.2 Frontend (React)

- **Component tests** (React Testing Library) for critical user interactions: can the user log an expense, toggle a recurring expense, see the dashboard update?
- **Hook tests** for React Query configurations: correct cache keys, correct invalidation on mutation success

### 8.3 End-to-End

- **Playwright** smoke tests for the three primary flows: onboarding, monthly data entry, mortgage what-if
- Not aiming for 100% coverage — aiming for "no financial calculation bug survives contact with production"

---

## 9. MIGRATION PLAN

### Phase 1: Data Import
Build the Django management command `import_excel` that parses `.xlsx` and maps sheets to database tables. Validate row counts and totals match the original spreadsheet before committing.

### Phase 2: Parallel Running (1-2 months)
Users enter data in the app while continuing the spreadsheet. Cross-check monthly totals between app and Excel. Fix any calculation discrepancies.

### Phase 3: Cutover
Stop using the spreadsheet. Enable notifications. Archive the Excel file as a historical backup.

---

## 10. SUCCESS METRICS

- Data entry time per month: under 15 minutes (vs ~30 minutes in spreadsheet)
- Errors in monthly totals: 0 (automated calculations eliminate formula breaks)
- Mobile usage: users access from phone at least once per week
- Dashboard answers "How much have we saved?": under 5 seconds
- Household adoption: multiple members actively logging transactions

---

## 11. OPEN QUESTIONS

1. Should the app support simultaneous real-time editing by multiple household members? (Optimistic locking vs last-write-wins)
2. Should FX rates auto-update via an external API, or is manual entry sufficient for the foreseeable future?
3. What is the budget/target for hosting costs per household?
4. Should savings challenges support fully custom increment schedules beyond the default linear increment?
5. Which secondary currencies are needed at launch beyond the base currency?
6. Should the app support multiple mortgages per household? (v1 assumes one)
7. Should there be a shared documents/receipts upload feature?
8. Which hosting provider: Railway, Hetzner, or a simple VPS with Dokku?

---

## 12. APPENDIX

### A. Default Category List (configurable per household)
Monthly Expenses, Rainy Day, Career Dev, Returns, Holiday Savings, Car Savings, Child Savings, Emergency Funds, Investment Cash, Fees, New Project/Mortgage, Dates, Holiday, Food, Home, Uncategorised

### B. Default Transaction Types (configurable per household)
Expense, Refund, Expense from Pot, Refund to Pot, Interest earned to Pot, Interest earned main account

### C. Default User Roles (permission-based)
- **Admin:** Full access including user management, configuration, and data deletion
- **Member:** Full read/write on all financial data; no access to admin settings
- **Viewer:** Read-only access to Dashboard and reports (future)

### D. Default Savings Pots (configurable per household)
Rainy Day, Career Dev, Holiday Savings, Car Savings, Child Savings, Emergency Funds, Investment Cash, New Project/Mortgage

---

End of PRD
