# Money Matters — UX and Interaction Specification

Version: 1.0

Date: 12 July 2026

Status: Initial design baseline

This document records the agreed navigation, dashboard, onboarding, and universal
data-entry experience. It complements `docs/PRD.md`; the PRD defines what the
product must do, while this specification defines how the primary workflows should
feel and behave.

---

## 1. Experience principles

- Support personal and shared workspaces equally.
- Make common financial entry possible from every screen.
- Use plain financial actions rather than spreadsheet-specific transaction types.
- Separate genuine spending from savings allocations and transfers.
- Show the effect of a transaction before it is saved.
- Allow users to create categories, accounts, pots, and other configurable items
  without leaving the current form.
- Display actionable information before decorative charts.
- Explain every calculated number.
- Prefer archive over destructive deletion.
- Provide responsive, accessible desktop and mobile experiences.

---

## 2. Application shell

### 2.1 Desktop sidebar

```text
MONEY MATTERS

Home
Activity
Monthly Review

MONEY
Accounts
Pots & Goals

PLANNING
Mortgage
Investments
Property
Fees
Challenges

MORE
Business
Crypto
Reports

Settings
Collapse
```

The sidebar is collapsible. When collapsed, icons remain and accessible tooltips
show each destination. Users may hide unused specialist modules from Settings;
hidden modules retain their data and can be restored later.

A new or solo workspace may initially show only Home, Activity, Monthly Review,
Accounts, Pots & Goals, Mortgage, Reports, and Settings.

### 2.2 Top bar

The desktop top bar contains:

- workspace name or selector;
- global month/year selector;
- global search;
- notifications;
- persistent bronze `+ Add` button;
- user profile and theme controls.

### 2.3 Mobile navigation

The bottom navigation contains Home, Activity, Add, Pots, and More. Add is the
central primary action. Specialist modules appear under More.

---

## 3. Dashboard

### 3.1 Information order

1. Greeting and selected period
2. Financial health cards
3. Monthly cashflow explanation
4. Needs attention
5. Pot progress and upcoming commitments
6. Trends
7. Recent member activity when useful

### 3.2 Primary cards

- Available Money
- Income
- Actual Expenses
- Saved This Month
- Unallocated Money
- Net Worth

Each card contains one primary amount, one short comparison or explanation, and a
link to its source detail. An information control opens `How was this calculated?`.

Example:

```text
AVAILABLE MONEY
£2,450
+£320 from June
View accounts
```

### 3.3 Cashflow card

```text
Income received                   £6,200
Actual spending                  -£3,150
Committed to pots                -£1,200
                                 -------
Unallocated money                 £1,850
```

Pot contributions are committed savings, not expenses. Pot-to-pot transfers are
reallocations and are not new saving.

### 3.4 Needs attention

This panel prioritises actionable items such as:

- monthly review ready or overdue;
- account not reconciled;
- low projected balance;
- pot behind target;
- mortgage rate period ending;
- treasury bill maturity;
- fee or property instalment due;
- stale FX rate;
- suspected duplicate transaction.

### 3.5 Responsive behaviour

Desktop uses a maximum of three primary cards per row. Mobile shows Available
Money full-width followed by paired smaller cards. Charts appear below actions and
summaries. Dense tables become focused lists or cards.

---

## 4. Onboarding

Onboarding is resumable and every financial setup step can be skipped.

### 4.1 Steps

1. Welcome and account registration
2. Choose workspace mode
3. Financial preferences
4. Add initial accounts
5. Add initial pots and optional goals
6. Choose the next task

### 4.2 Workspace mode

The user chooses:

- **Manage my own finances** — create a personal workspace with one member;
- **Manage finances with others** — create a shared workspace and offer optional
  invitations.

A personal workspace can invite members later without migrating data. Solo users
are not shown irrelevant joint ownership or multi-person approval controls.

### 4.3 Financial preferences

Collect base currency, fiscal year start, date format, locale, and theme. Secondary
currencies are added when needed rather than required during onboarding.

### 4.4 Initial accounts

Account creation asks for name, type, provider, ownership, currency, opening
balance, and whether it is included in available cash and net worth.

Opening balances are not income. For a real pot contained inside a provider
account, the model and calculations must avoid counting the same money twice.

### 4.5 Initial pots

Suggested pots from the workbook may be offered but are editable defaults, not
hardcoded records. A new pot can capture name, linked account, opening balance,
owner, currency, icon/colour, and optional goal amount, date, and contribution.

### 4.6 Completion choices

- Add this month's income
- Set up recurring commitments
- Import an existing workbook
- Explore the dashboard

---

## 5. Universal Add

The Add button is always available. It opens actions grouped by purpose.

### 5.1 Core actions

- Income
- Expense
- Transfer
- Refund
- Interest or return
- Balance adjustment
- Recurring commitment
- Account or pot
- Investment or treasury bill
- Property or fee payment
- Mortgage change

Frequently used actions appear first. The action picker is searchable.

### 5.2 Shared form behaviour

- Use positive amount entry; the system determines direction.
- Default to recent accounts, categories, and dates when safe.
- Reveal only fields relevant to the selected action.
- Allow inline creation of configurable selections.
- Provide Save, Save and add another, and safe Undo.
- Preserve a draft if the form closes accidentally.
- Warn about likely duplicates.
- Support notes, tags, ownership, and attachments when relevant.
- Show a clear effect preview before saving.

### 5.3 Income

Required information: amount, destination account, income source, received date,
and recipient/owner. Description, notes, currency details, and recurrence are
optional.

Example preview:

```text
Joint Current Account       +£3,200
July workspace income       +£3,200
July unallocated money      +£3,200
```

Individual income records roll up to the workspace total.

### 5.4 Expense

Required information: amount, source account, category, description/merchant, and
date. Owner, notes, tags, receipt, and recurrence are optional.

Example preview:

```text
Joint Current Account          -£68.40
July actual expenses           +£68.40
July unallocated money         -£68.40
Food & Groceries               +£68.40
```

### 5.5 Transfer

Required information: amount, source, destination, and date. Transfers support
account-to-account, account-to-pot, pot-to-account, and pot-to-pot movement.

Example account-to-pot preview:

```text
This is a transfer, not an expense.

Joint Current Account           -£400
Emergency Fund                  +£400
Committed savings this month    +£400
Workspace net worth             No change
```

Example pot-to-pot preview:

```text
Holiday Pot                     -£250
Car Pot                         +£250
Committed savings               No change
Workspace net worth             No change
```

### 5.6 Refund

Refunds should link to the original expense when possible and support partial
refunds. They increase the destination account and offset actual spending in the
associated category.

### 5.7 Interest or return

Required information: amount, destination account/pot, return type, source, and
date. Return types include savings interest, investment return, and prize/winnings.

### 5.8 Balance adjustment

The app first encourages recording the missing real transaction. If the cause
cannot be reconstructed, an adjustment requires an actual provider balance and a
reason. It always appears in reconciliation and audit history.

### 5.9 Recurring commitment

The user first chooses Expense or Savings allocation. The form captures name,
amount, frequency, source, category or destination pot, first date, optional end
date, and reminder settings.

Supported frequencies include weekly, fortnightly, four-weekly, monthly,
quarterly, six-monthly, annual, and custom.

---

## 6. Visual direction

- Midnight navy provides structure in the sidebar and header.
- Bronze highlights primary actions, selection, and brand detail.
- Light mode uses warm neutral backgrounds and high-contrast cards.
- Dark mode uses deep navy surfaces rather than pure black.
- Green, amber, and red are reserved for semantic financial status.
- Colour never communicates meaning without text or an icon.
- Amounts are prominent; labels and explanations remain concise.
- Charts are restrained and appear after actionable content.

---

## 7. Next UX areas

The next screens to define during implementation planning are:

1. Activity list, filters, detail, and correction
2. Recurring commitments list and calendar/year views
3. Monthly Review and reconciliation
4. Accounts and pot detail
5. Mortgage and specialist-module patterns

These screens must follow the shared shell, creation, explanation, audit, and
responsive behaviours established in this specification.

---

End of UX specification
