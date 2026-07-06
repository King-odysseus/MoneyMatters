from django.conf import settings
from django.db import models


class Year(models.Model):
    """Fiscal years. Creating a year triggers ledger row creation via signal."""

    household = models.ForeignKey(
        "core.Household", on_delete=models.CASCADE, related_name="years"
    )
    year = models.PositiveSmallIntegerField()
    is_archived = models.BooleanField(default=False)

    class Meta:
        db_table = "years"
        unique_together = ["household", "year"]
        ordering = ["-year"]

    def __str__(self):
        return str(self.year)


class SavingsPot(models.Model):
    """User-defined savings pots that become Ledger columns."""

    household = models.ForeignKey(
        "core.Household", on_delete=models.CASCADE, related_name="savings_pots"
    )
    name = models.CharField(max_length=255)
    display_order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        db_table = "savings_pots"
        unique_together = ["household", "name"]
        ordering = ["display_order"]

    def __str__(self):
        return self.name


class Category(models.Model):
    """User-defined expense/savings categories used in dropdowns."""

    household = models.ForeignKey(
        "core.Household", on_delete=models.CASCADE, related_name="categories"
    )
    name = models.CharField(max_length=255)
    display_order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        db_table = "categories"
        verbose_name_plural = "categories"
        unique_together = ["household", "name"]
        ordering = ["display_order"]

    def __str__(self):
        return self.name


class TransactionType(models.Model):
    """User-defined transaction types with effect logic."""

    class EffectLogic(models.TextChoices):
        EXPENSE = "expense", "Expense"
        REFUND = "refund", "Refund"
        EXPENSE_FROM_POT = "expense_from_pot", "Expense from Pot"
        REFUND_TO_POT = "refund_to_pot", "Refund to Pot"
        INTEREST_TO_POT = "interest_to_pot", "Interest earned to Pot"
        INTEREST_MAIN = "interest_main", "Interest earned main account"

    household = models.ForeignKey(
        "core.Household", on_delete=models.CASCADE, related_name="transaction_types"
    )
    name = models.CharField(max_length=255)
    effect_logic = models.CharField(max_length=50, choices=EffectLogic.choices)

    class Meta:
        db_table = "transaction_types"
        unique_together = ["household", "name"]

    def __str__(self):
        return self.name


class FXRate(models.Model):
    """Currency exchange rates. Single source of truth for all modules."""

    household = models.ForeignKey(
        "core.Household", on_delete=models.CASCADE, related_name="fx_rates"
    )
    from_currency = models.CharField(max_length=3)
    to_currency = models.CharField(max_length=3)
    rate = models.DecimalField(max_digits=12, decimal_places=6)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "fx_rates"
        unique_together = ["household", "from_currency", "to_currency"]

    def __str__(self):
        return f"{self.from_currency} -> {self.to_currency}: {self.rate}"
