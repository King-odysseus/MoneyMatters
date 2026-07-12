# Money Matters — Product Requirements Document

Version: 3.0

Date: 12 July 2026

Status: Draft for validation

Product: Personal and shared household finance management application

Planned stack: Django, Django REST Framework, React, TypeScript, PostgreSQL

Companion document: `docs/UX_SPEC.md`

---

## 1. Product overview

### 1.1 Product vision

Money Matters is a financial operating system for an individual or shared
household. It combines day-to-day money management, savings pots, long-term goals, mortgages,
multi-currency investments, property projects, fees, savings challenges, business
finances, and crypto holdings in one understandable application.

It preserves the flexibility of the household's existing workbook without
reproducing its fragile formulas or sheet-heavy interface. Users can create their
own accounts, pots, categories, recurring commitments, portfolios, projects, and
other records. Workbook examples are starter data, never hardcoded limits.

The product should feel calm, clear, and trustworthy. A user should understand the
household's position within five seconds, enter common data in a few taps, and open
an explanation for every calculated figure.

### 1.2 Problem statement

The current workbook successfully tracks complex household finances but has
important limitations:

- formulas can be overwritten or silently broken;
- spreadsheet transaction types and signed amounts are difficult to understand;
- mobile entry is awkward;
- multiple users can overwrite one another's changes;
- data is split across many sheets;
- savings allocations can be confused with genuine spending;
- current FX rates can accidentally rewrite the meaning of historical values;
- reminders, reconciliation, audit history, and forecasting are limited;
- adding years, categories, or pots requires structural spreadsheet changes.

### 1.3 Product principles

1. **Record financial actions in plain language.** Users record income, expenses,
   refunds, transfers, interest, and adjustments. The system handles signs and
   accounting effects.
2. **Separate spending from saving.** A pot contribution reduces freely available
   money but remains household wealth and is not an expense.
3. **Separate location, purpose, and goal.** Accounts show where money exists;
   pots show what money is reserved for; goals show what the household wants to
   achieve.
4. **Make configuration user-owned.** Authorised users can add new selectable
   items without leaving the current task.
5. **Keep history truthful.** Historical amounts, recurring rates, FX rates, and
   changes must remain reproducible.
6. **Explain every result.** Derived totals provide a human-readable calculation
   breakdown.
7. **Work equally well alone or together.** A workspace may have one or multiple
   members. Collaboration appears when relevant, and every material change is
   attributed.
8. **Deliver in phases, retain the full vision.** Every module in this document is
   in product scope, even when scheduled for a later delivery phase.

### 1.4 Target users and workspace modes

During onboarding, the user chooses one of two modes:

- **Manage my own finances:** creates a personal workspace with one member;
- **Manage finances with others:** creates a shared household workspace and offers
  member invitations.

Both modes use the same financial model and provide every product module. A solo
user is not required to configure joint ownership, invitations, or multi-person
approval. They can invite another person later without moving or recreating data.
A shared workspace can also return to one active member without losing history.

Roles apply to workspace membership:

| Role | Capabilities |
|---|---|
| Household Admin | Full financial access plus household settings, invitations, roles, configuration, exports, and archival/deletion controls |
| Member | Create, view, and edit household financial data and participate in monthly review |
| Viewer | Read dashboards and reports without changing financial records |

Profiles may also have descriptive labels such as Primary User, Secondary User,
or Joint. These labels describe ownership and attribution; permission roles govern
access.

---

## 2. Financial model and terminology

### 2.1 Monthly money flow

```text
Individual income entries
          |
          v
Total household income
          |
          +-- actual expenses (money no longer owned)
          |
          +-- committed savings allocations (money moved to pots)
          |
          v
Unallocated money remaining
```

The application must not use one ambiguous `Savings` number for all of these
concepts. It reports:

- **Total income:** all qualifying individual income entries;
- **Actual expenses:** money spent outside the household;
- **Committed savings:** money moved into designated pots or savings accounts;
- **Monthly surplus:** income minus actual expenses;
- **Unallocated money:** income minus actual expenses and committed allocations;
- **Available cash:** liquid money not reserved by excluded/committed pots;
- **Total pot balance:** accumulated balance across included pots;
- **Net worth:** included assets minus included liabilities.

### 2.2 Accounts, pots, and goals

- An **account** is where money physically exists, such as a Monzo Joint Account,
  NS&I account, cash wallet, mortgage, or investment account.
- A **pot** is a real or virtual allocation for a purpose, such as Emergency Fund
  or Holiday. A Monzo pot may be represented as a real pot linked to its provider
  account.
- A **goal** defines a desired amount and optional target date. A pot can exist
  without a goal.

### 2.3 Pot balance

A pot value is its actual accumulated balance including the selected month:

```text
opening balance
+ contributions and transfers in
+ interest and refunds
- withdrawals and transfers out
= current balance
```

Every pot view must show both its current balance and movement during the selected
month.

### 2.4 Controlled financial actions

Core transaction behaviours are controlled by the system:

| Action | Effect |
|---|---|
| Income | Increases an account and household income |
| Expense | Decreases an account and counts as actual spending |
| Refund | Increases an account and offsets spending in the associated category |
| Transfer | Decreases one account/pot and increases another; does not change net worth |
| Interest/return | Increases an account or pot and records financial income |
| Balance adjustment | Corrects a balance with a reason and audit entry |

Users can create categories, labels, and tags, but cannot create arbitrary effect
logic that could corrupt calculations.

### 2.5 Recurring commitments

Recurring commitments have two primary kinds:

- **Recurring expense:** money leaves the household, such as council tax or a
  subscription.
- **Recurring savings allocation:** money remains owned but is committed to a pot.

Both reduce unallocated money. Only recurring expenses count as spending.

Amounts are effective-dated. When editing an occurrence, the interface offers:

- change this occurrence only;
- change from this date onward;
- correct the entire history.

### 2.6 Currency history

Every foreign-currency transaction preserves the original amount, original
currency, conversion rate used, converted amount, rate date, and rate source.
Changing a current FX rate must never rewrite completed historical transactions.
Investments may show historical cost and current valuation using different rates.

---

## 3. Information architecture

### 3.1 Desktop navigation

- Home
- Activity
- Monthly Review
- Accounts
- Pots & Goals
- Mortgage
- Investments
- Property
- Fees
- Challenges
- Business
- Reports
- Settings

The sidebar is collapsible. Users may hide unused specialist modules without
deleting their data or removing the feature from the product.

### 3.2 Top bar

- household/workspace selector;
- global month and year selector;
- global search;
- notification centre;
- persistent universal Add button;
- user profile and theme controls.

### 3.3 Mobile navigation

- Home
- Activity
- Add
- Pots
- More

All specialist modules remain available under More. Desktop tables become focused
cards or lists on narrow screens.

### 3.4 Universal Add

The Add button is available throughout the product and supports:

- income;
- expense;
- refund;
- transfer;
- interest or return;
- account or pot;
- recurring commitment;
- mortgage change or overpayment;
- investment or treasury bill;
- property or fee payment;
- account balance update;
- receipt/document upload.

Forms progressively reveal only relevant fields and preview the financial effect
before saving. Common forms support recent selections, templates, duplicate,
Save and add another, and Undo.

### 3.5 Create items in context

If an authorised user can select a configurable item, they can create one inline
without abandoning the form. This applies to accounts, pots, categories,
subcategories, income sources, tags, beneficiaries, portfolios, projects,
businesses, return sources, and challenges.

Items referenced by history are normally archived rather than deleted. Duplicate
categories may be merged through an explicit migration workflow.

---

## 4. Full module scope and requirements

### 4.1 Authentication, households, and collaboration

**Purpose:** Secure solo or multi-user access and strict isolation between
workspaces and businesses.

Requirements:

- email/password registration, verification, login, logout, and password reset;
- onboarding offers personal or shared use and creates the appropriate workspace;
- invitations are optional and a personal workspace can become shared later;
- Admin, Member, and Viewer permissions enforced by the backend;
- one or multiple members can enter and review data according to role;
- every change records actor, time, old value, and new value;
- recent household activity is visible from Home;
- concurrent edits must not silently overwrite newer changes;
- no authenticated user can access another household's data;
- optional avatars and descriptive ownership labels.

### 4.2 Home dashboard

**Purpose:** Answer `How are we doing?` and `What needs attention?` within five
seconds.

Primary cards:

- available money;
- income this month;
- actual expenses;
- committed savings;
- unallocated money;
- total pot balances;
- net worth;
- upcoming commitments.

Dashboard sections:

- monthly cashflow breakdown;
- accounts and pot progress;
- items needing attention;
- recent activity by workspace members, hidden when it adds no value for solo use;
- income, spending, surplus, pot, and net-worth trends;
- collapsible liquidity snapshot;
- upcoming mortgage payments, maturities, fees, and property instalments.

Every figure links to its source detail and offers `How was this calculated?`.
Cards and sections are configurable and respond to the global time filter.

### 4.3 Activity and transaction journal

**Purpose:** Provide one reliable journal for all household financial actions.

Requirements:

- record income as individual entries and calculate workspace totals;
- record expenses, refunds, transfers, interest, and adjustments;
- transfers support account-to-account, account-to-pot, pot-to-account, and
  pot-to-pot movement;
- a transfer creates balanced source and destination effects and does not change
  household net worth;
- support date, amount, account, category, owner, description, notes, tags,
  currency, and attachments as appropriate;
- group by day, month, account, category, or action;
- search by text and filter by date, person, amount, account, pot, category,
  currency, type, tag, or attachment status;
- support duplicate detection and linked refund/original-expense relationships;
- show the understandable effect of every action;
- allow safe correction with audit history and Undo.

### 4.4 Monthly Review

**Purpose:** Replace the workbook's central ledger with a guided, auditable monthly
workflow.

Each month includes:

- individual income and total household income;
- actual expenses;
- recurring commitments;
- committed pot allocations;
- ad-hoc activity;
- account and pot closing balances;
- FX valuation checks;
- notes, reconciliation, and review status.

Statuses are In progress, Reviewed, Reopened, and Reviewed again. Review is
reversible rather than a permanent accounting lock. Reopening creates an audit
event. The interface shows who reviewed each section. A solo user reviews alone;
a shared workspace may optionally require approval from multiple members.

A monthly breakdown must reconcile opening balances, movements, and closing
balances. Adding a new fiscal year creates the required periods without hardcoded
pot columns or transaction tables.

### 4.5 Accounts and reconciliation

**Purpose:** Represent where money physically exists and verify calculated balances
against providers.

Supported account types include current, savings, cash, credit, mortgage,
investment, foreign currency, NS&I, business, and custom types.

Each account supports:

- individual or joint ownership;
- institution, name, currency, and optional masked reference;
- current, available, and reconciled balances;
- inclusion/exclusion from available cash and net worth;
- linked pots and recent activity;
- manual balance history and reconciliation;
- statement/document attachments;
- archival without losing transactions.

### 4.6 Pots and goals

**Purpose:** Track real or virtual money reserved for household purposes.

Users can create unlimited pots with name, linked account/provider, currency,
opening balance, purpose, owner, icon, colour, priority, regular contribution,
liquidity setting, and archive status.

Goals support target amount, target date, priority, progress, suggested monthly
contribution, and forecast completion date. Pot pages show opening balance,
contributions, transfers, interest, refunds, withdrawals, closing balance, goal
progress, and full history. Negative balances are allowed only when explicitly
configured and are clearly highlighted.

### 4.7 Recurring commitments

**Purpose:** Manage predictable expenses and savings allocations without a fragile
spreadsheet grid.

Each commitment supports:

- name, kind, amount, owner, category, source account, and optional destination
  pot;
- weekly, fortnightly, four-weekly, monthly, quarterly, six-monthly, annual, or
  custom frequency;
- start date, optional end date, due rule, reminders, notes, and active status;
- effective-dated amount history;
- skip, pause, or override for a single occurrence;
- list/calendar views and an optional desktop year grid;
- projected versus confirmed status;
- monthly totals split between spending and committed saving.

### 4.8 Mortgage

**Purpose:** Track one or more mortgages and model future repayment choices.

Each mortgage includes property, original loan, deposit, start date, term,
interest-rate periods, payment changes, overpayments, fees, and actual balance.

The module provides:

- amortisation schedule with payment, interest, principal, and balance;
- effective-dated rate and payment changes;
- current payment, balance, interest paid, principal repaid, total interest,
  payoff date, fixed-rate end, and loan-to-value;
- current-row highlighting and balance-over-time charts;
- rate-expiry and payment reminders;
- what-if comparisons for rates, payment changes, and overpayments;
- named scenarios that never alter real records unless explicitly applied.

### 4.9 Treasury bills

**Purpose:** Track multiple local and foreign-currency treasury bill portfolios.

Records include issuer/country, portfolio/account, currency, purchase date, face
value, purchase or discount value, discount rate, tenor, maturity date, expected
return, actual return, purchase FX rate, current valuation rate, and status.

The module provides a verified calculator, portfolio totals, maturity calendar,
currency exposure, alerts, annual performance, and flows for withdrawal or
reinvestment at maturity.

### 4.10 Investments, NS&I, and roadmap

**Purpose:** Bring household investments and returns together without losing
specialist detail.

Tabs include Holdings, Returns, NS&I, Roadmap, Proposed, and Pipeline. The module
distinguishes contributions, income/returns, capital growth, withdrawals, and
fees. Holdings record cost, current value, currency, owner, account, and valuation
date. NS&I supports monthly prizes/interest by source. Roadmap items support
target amount, priority, status, notes, and planned date.

### 4.11 Property projects

**Purpose:** Track property purchases, construction, renovation, and instalment
commitments.

Each property/project supports budget, currency, dates, suppliers, status,
payment log, instalment schedule, documents, and notes. Views show amount paid,
remaining budget, next payment, overdue instalments, running total, and timeline.
Historical and current FX values remain distinct.

### 4.12 Fees

**Purpose:** Track multi-person, multi-purpose, and multi-currency fee obligations.

Each fee supports beneficiary, type, description, original currency, expected
amount, due date, instalments, paid amount, remaining amount, funding account/pot,
documents, and status. Payments can feed the household journal and monthly review.
Supported examples include school, legal, visa, professional, and property fees;
users can add their own types.

### 4.13 Savings challenges

**Purpose:** Make structured micro-saving visible and connected to real money.

Supported templates include 1p, 52-week, fixed weekly, round-up, and custom
schedules. Each challenge has participant(s), funding account, destination pot,
target, dates, schedule, reminders, and progress. Completing a contribution can
create or link to a real transfer; the challenge must not become an unbacked set of
decorative checkboxes.

### 4.14 Business workspace

**Purpose:** Include business finance without distorting household reporting.

Users can create multiple businesses. Each is an isolated workspace with its own
dashboard, members/permissions, accounts, transactions, income, expenses,
categories, currencies, projects, documents, and reports.

Money moving between household and business is recorded as an explicit boundary
transaction. Business values are excluded from household spending and net worth
unless an explicit investment, loan, distribution, or owner's-equity relationship
connects them.

### 4.15 Crypto

**Purpose:** Track crypto holdings as a specialist asset class.

The module supports wallets and exchanges, tokens, purchases, sales, transfers,
network/trading fees, manual or optional live prices, historical cost, current
valuation, realised and unrealised gains, owner, and currency conversion. Manual
entry remains fully usable without third-party integrations.

### 4.16 Reports and forecasting

Reports cover:

- monthly cashflow and surplus;
- income by source and person;
- spending by category and merchant;
- recurring versus ad-hoc spending;
- committed saving and savings rate;
- pot contributions, withdrawals, balances, and goal progress;
- account balances and reconciliation;
- household net worth;
- mortgage performance;
- investment and treasury bill performance;
- maturity and obligation calendars;
- property commitments and remaining fees;
- multi-currency valuation and exposure;
- separate business reporting.

Users can filter, save report views, and export permitted data to Excel, CSV, or
PDF. Forecasts show end-of-month balance, future cashflow, goal completion,
upcoming obligations, and scenario comparisons. Forecast values are always
visually labelled as estimates.

### 4.17 Calendar, alerts, and notifications

A combined calendar contains recurring commitments, mortgage events, treasury
bill maturities, property instalments, fees, challenge contributions, and custom
reminders.

Configurable alerts include missing income, low projected balance, unusual
expense, recurring amount change, possible duplicate, unreconciled account,
overdue monthly review, goal falling behind, mortgage rate expiry, bill/payment
due, maturity, stale FX rate, and overdue fee/instalment.

Notifications may be in-app and, when configured, email or push. Users control
channels, timing, and quiet periods.

### 4.18 Settings and administration

Settings are grouped into Household, Money Setup, Modules, Notifications, and
Data. Admins can manage:

- household profile, base currency, locale, and fiscal year;
- members, invitations, roles, and descriptive ownership labels;
- accounts, pots, categories, subcategories, income sources, tags, and colours;
- recurring commitments and reusable transaction templates;
- currencies, current FX rates, and rate sources;
- module visibility and dashboard layout;
- notification rules;
- imports, exports, backups, audit history, and archived items.

---

## 5. Shared interaction and usability requirements

- Common data entry must work comfortably at 375 px mobile width.
- Searchable selectors replace long dropdowns and show recent items first.
- Forms use plain language and progressively disclose advanced fields.
- Monetary actions preview their account, spending, pot, and net-worth effects.
- The application provides Undo when technically and financially safe.
- Empty states explain the purpose of a page and offer the correct first action.
- Tables support keyboard navigation on desktop and focused card/list views on
  mobile.
- Filters and selected month/year persist during a session.
- Light and dark themes are supported.
- Midnight navy is the primary structural brand colour; bronze is an accent, not
  a replacement for semantic status colours.
- Green indicates positive/complete, amber indicates attention, and red indicates
  genuine risk or negative state. Meaning is never conveyed by colour alone.
- Every calculated figure can expose its inputs and calculation.
- Destructive actions require clear confirmation; archival is preferred.
- Loading, success, validation, conflict, offline, and failure states are explicit.
- WCAG 2.1 AA keyboard, screen-reader, focus, contrast, and touch-target standards
  are required.

---

## 6. Data integrity, security, and technical constraints

- PostgreSQL is the persistent source of truth.
- Financial amounts use decimal arithmetic, never binary floating point.
- All financial writes and their downstream calculations are transactional.
- Household and business-workspace isolation is enforced on every backend query.
- Derived values are calculated by tested backend domain services. The frontend
  may preview calculations but cannot become the financial source of truth.
- Transfers are balanced and cannot be partially saved.
- Financial history records actor, time, reason where applicable, old value, and
  new value.
- Historical transactions snapshot their relevant FX rate and recurring amount.
- Sensitive values are excluded from client and server logs.
- Authentication cookies are Secure, HttpOnly, and appropriately protected from
  CSRF; all production traffic uses HTTPS.
- Backups are automatic, encrypted where supported, monitored, and restore-tested.
- Receipt and document access follows the same household/workspace permissions as
  its parent record.
- Calculation and aggregate changes require automated regression tests against
  known workbook examples.

Target service levels:

| Area | Target |
|---|---|
| Dashboard | useful content within 2 seconds under normal household data volumes |
| Financial recalculation | affected-month result within 500 ms for normal operations |
| Availability | 99.5% minimum after production launch |
| Responsive support | mobile 375 px+, tablet, and modern desktop browsers |
| Accessibility | WCAG 2.1 AA |
| Backup retention | daily backups retained for at least 30 days |

---

## 7. Import, export, and migration

### 7.1 Existing workbook migration

The original workbook is imported through a repeatable migration tool. The import
must map accounts, pots, individual income where available, recurring commitments,
extra/refund entries, mortgage configuration, treasury bills, challenges, fees,
returns, property records, business data, and other supported modules.

Before commit, an import preview reports row counts, warnings, unmapped categories,
duplicates, and calculated totals. Imported totals are reconciled against the
workbook for representative months and annual summaries.

Hand-typed monthly arithmetic is not copied as opaque totals when its underlying
entries can be reconstructed. Unreconstructable historical totals are imported as
clearly labelled opening balances or adjustments with notes.

### 7.2 Ongoing import/export

- bank CSV import with mapping, preview, and duplicate detection;
- Excel, CSV, and PDF export according to module and permissions;
- full household data export for portability;
- optional future open-banking connections, introduced only after provider,
  security, cost, and regulatory review.

### 7.3 Cutover

Run the application and workbook in parallel for one or two complete monthly
cycles. Compare account balances, expense totals, pot movements, mortgage figures,
and FX results before making the application the primary system.

---

## 8. Delivery plan

All modules are in scope. Phases define build order, not whether a feature will be
built.

### Phase 1 — Shared financial foundation

- authentication, households, roles, and invitations;
- accounts, pots, categories, goals, and dynamic inline creation;
- income, expenses, refunds, transfers, interest, and audit history;
- core responsive navigation and universal Add.

### Phase 2 — Monthly operating workflow

- recurring expenses and savings allocations;
- effective-dated amount changes;
- Monthly Review, reconciliation, and reversible review status;
- Home dashboard, explanations, search, and core reports.

### Phase 3 — Mortgage and data portability

- mortgages, amortisation, overpayments, rate/payment history, and what-if;
- workbook import, bank CSV import, Excel/CSV/PDF export;
- notifications, calendar, backup operations, and regression reconciliation.

### Phase 4 — Investments and international money

- treasury bills;
- investments, NS&I, roadmap, proposed investments, and pipeline;
- historical/current FX handling and multi-currency reporting.

### Phase 5 — Household commitments

- property projects and instalments;
- fees;
- savings challenges;
- expanded forecasting and obligation calendar.

### Phase 6 — Business workspace

- isolated multi-business workspaces;
- business accounts, transactions, projects, documents, and reports;
- explicit household/business boundary transactions.

### Phase 7 — Crypto and optional integrations

- crypto portfolios, wallets, activity, cost, and valuation;
- optional live market data and approved external integrations;
- advanced automation and forecasting refinements.

Each phase requires user-flow acceptance, accessibility checks, financial
calculation tests, household isolation tests, and updated documentation before the
next phase begins.

---

## 9. Success measures

- A normal transaction can be entered on mobile in under 20 seconds.
- Monthly household review can be completed in under 15 minutes.
- Dashboard users can identify available money, spending, committed saving, and
  net worth within five seconds.
- No pot transfer is reported as actual spending.
- Account and pot movements reconcile to closing balances.
- Historical recurring and FX calculations remain reproducible after later rate
  changes.
- Solo users complete their own reviews, while shared workspaces show active
  participation from their members.
- Users can add a new pot, category, recurring item, account, or specialist record
  without developer intervention.
- No financial calculation discrepancy survives the parallel-run cutover.
- No cross-household or cross-business unauthorised data access occurs.

---

## 10. Acceptance scenarios

1. A member records salary into the Joint Account; household income and the
   account balance increase.
2. A member pays council tax; actual expenses increase and the source account
   decreases.
3. A member moves money into Emergency Fund; committed savings and that pot
   increase, available/unallocated money decreases, and actual expenses do not
   increase.
4. A member transfers Holiday money to Car; total household wealth is unchanged
   and both pot histories show the movement.
5. Council tax rises from a chosen month; earlier monthly reviews retain the old
   amount.
6. A foreign-currency bill retains its transaction-time conversion after the
   current FX rate changes.
7. A solo user can review and reopen a month; in a shared workspace, another
   member's later correction also reopens it and preserves the complete history.
8. An Admin creates a new pot or category inline while entering a transaction and
   immediately selects it.
9. A treasury bill matures; the user records withdrawal or reinvestment without
   duplicating its return.
10. Business spending remains excluded from household expense reports unless an
    explicit boundary transaction links the workspaces.

---

## 11. Decisions confirmed during discovery

- A pot value is the accumulated amount saved, including the selected month's
  movement.
- Recurring expenses are genuine spending; recurring pot contributions are
  separate committed savings allocations.
- Pots/accounts correspond to real financial locations such as Monzo pots, while
  virtual allocations remain supported.
- Workspace income is calculated from individual income entries.
- Direct pot-to-pot transfers are supported.
- Recurring amounts can change over time without rewriting history.
- Historical FX rates are preserved.
- Business finances are isolated from household reporting.
- The application supports one or multiple workspace members; solo users can
  invite others later without migrating data.
- Monthly review is reversible and audited.
- Every workbook-derived module is included in the full product.
- Users can create new categories, recurring commitments, pots, and other
  configurable items without code changes.

---

## 12. Remaining product questions

These questions do not block the full vision but must be resolved before their
relevant implementation phase:

1. Which account providers and opening balances will be included in the initial
   import?
2. For shared workspaces, should multi-person review be enabled by default or only
   when an Admin turns it on?
3. Which events require receipt/document retention, and for how long?
4. Which currencies are required for the first migration?
5. Which live FX, market-price, or open-banking providers are acceptable, if any?
6. How should property market values be sourced for net-worth reporting?
7. Which business ownership relationships should count toward household net worth?
8. What deployment budget, region, retention policy, and recovery target are
   required for production?

---

End of PRD
