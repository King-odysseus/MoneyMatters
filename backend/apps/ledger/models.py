from django.db import models


class MonthlyLedger(models.Model):
    """Central table: one row per month with income, expenses, and savings."""

    year = models.ForeignKey(
        "config_app.Year", on_delete=models.CASCADE, related_name="ledger_rows"
    )
    month = models.PositiveSmallIntegerField()  # 1-12
    joint_income = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    savings = models.DecimalField(max_digits=12, decimal_places=2, default=0)  # calc
    monthly_expenses = models.DecimalField(max_digits=12, decimal_places=2, default=0)  # calc
    created_by = models.ForeignKey(
        "core.User", on_delete=models.SET_NULL, null=True, blank=True
    )

    class Meta:
        db_table = "monthly_ledger"
        unique_together = ["year", "month"]
        ordering = ["year", "month"]

    def __str__(self):
        return f"{self.year.year} - Month {self.month}"


class LedgerPotValue(models.Model):
    """Amount allocated to a specific savings pot for a given ledger row."""

    ledger = models.ForeignKey(
        MonthlyLedger, on_delete=models.CASCADE, related_name="pot_values"
    )
    pot = models.ForeignKey(
        "config_app.SavingsPot", on_delete=models.CASCADE, related_name="ledger_values"
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    class Meta:
        db_table = "ledger_pot_values"
        unique_together = ["ledger", "pot"]

    def __str__(self):
        return f"{self.ledger} - {self.pot.name}: {self.amount}"
