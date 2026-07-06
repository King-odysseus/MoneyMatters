from django.db import models


class RecurringExpense(models.Model):
    """A recurring monthly expense. Active every month unless explicitly skipped."""

    household = models.ForeignKey(
        "core.Household", on_delete=models.CASCADE, related_name="recurring_expenses"
    )
    name = models.CharField(max_length=255)
    projected_amount = models.DecimalField(max_digits=12, decimal_places=2)
    owner = models.ForeignKey(
        "core.User", on_delete=models.SET_NULL, null=True, blank=True, related_name="expenses"
    )
    main_category = models.CharField(max_length=255, blank=True)

    class Meta:
        db_table = "recurring_expenses"
        ordering = ["name"]

    def __str__(self):
        return self.name


class RecurringExpenseSkip(models.Model):
    """Exception record: months where a recurring expense is NOT active."""

    expense = models.ForeignKey(
        RecurringExpense, on_delete=models.CASCADE, related_name="skips"
    )
    month_year = models.DateField(help_text="First day of the skipped month")

    class Meta:
        db_table = "recurring_expense_skips"
        unique_together = ["expense", "month_year"]

    def __str__(self):
        return f"{self.expense.name} skipped {self.month_year}"
