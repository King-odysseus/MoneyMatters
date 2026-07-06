"""Ledger calculation engine. All financial math lives here."""

from decimal import Decimal
from apps.expenses.models import RecurringExpense, RecurringExpenseSkip
from apps.transactions.models import ExtraTransaction


def recalculate_ledger_row(ledger_row):
    """Recalculate derived fields for a single ledger row and its pot values."""
    year = ledger_row.year
    household = year.household
    month = ledger_row.month

    from calendar import monthrange
    _, last_day = monthrange(year.year, month)
    month_start = f"{year.year}-{month:02d}-01"
    month_end = f"{year.year}-{month:02d}-{last_day}"

    # 1. Sum recurring expenses (active unless skipped)
    recurring_total = Decimal("0.00")
    expenses = RecurringExpense.objects.filter(household=household)
    for expense in expenses:
        is_skipped = RecurringExpenseSkip.objects.filter(
            expense=expense,
            month_year=month_start,
        ).exists()
        if not is_skipped:
            recurring_total += expense.projected_amount

    # 2. Sum extra transactions for this month
    transactions = ExtraTransaction.objects.filter(
        household=household,
        month_year=month_start,
    )
    extra_total = Decimal("0.00")
    for txn in transactions:
        extra_total += txn.signed_amount

    # 3. Update ledger row
    ledger_row.monthly_expenses = recurring_total + extra_total
    ledger_row.savings = ledger_row.joint_income - ledger_row.monthly_expenses
    ledger_row.save(update_fields=["monthly_expenses", "savings"])

    # 4. Recalculate pot values from transactions
    from apps.ledger.models import LedgerPotValue
    from apps.config_app.models import SavingsPot

    pots = SavingsPot.objects.filter(household=household)
    for pot in pots:
        pot_txns = ExtraTransaction.objects.filter(
            household=household,
            month_year=month_start,
            pot=pot,
        )
        pot_total = sum(t.signed_amount for t in pot_txns if t.pot_id == pot.id)
        LedgerPotValue.objects.update_or_create(
            ledger=ledger_row,
            pot=pot,
            defaults={"amount": pot_total},
        )
