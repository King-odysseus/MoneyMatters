from django.db import models


class ExtraTransaction(models.Model):
    """Ad-hoc transaction: extra expense, refund, pot transfer, or interest."""

    household = models.ForeignKey(
        "core.Household", on_delete=models.CASCADE, related_name="transactions"
    )
    date = models.DateField()
    category = models.CharField(max_length=255)
    type = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    notes = models.TextField(blank=True)
    signed_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    month_year = models.DateField(editable=False, help_text="First day of transaction month")
    pot = models.ForeignKey(
        "config_app.SavingsPot", on_delete=models.SET_NULL, null=True, blank=True
    )
    created_by = models.ForeignKey(
        "core.User", on_delete=models.SET_NULL, null=True, blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "extra_transactions"
        ordering = ["-date"]

    def __str__(self):
        return f"{self.date} - {self.type}: {self.amount}"
