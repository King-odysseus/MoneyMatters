from django.db import models


class MonthlyChecklist(models.Model):
    """One checklist per household per month."""

    household = models.ForeignKey(
        "core.Household", on_delete=models.CASCADE, related_name="checklists"
    )
    month_year = models.DateField(help_text="First day of the month")

    class Meta:
        db_table = "monthly_checklists"
        unique_together = ["household", "month_year"]
        ordering = ["-month_year"]

    def __str__(self):
        return f"Checklist {self.month_year.strftime('%B %Y')}"


class ChecklistItem(models.Model):
    """An individual bill/expense item within a monthly checklist."""

    checklist = models.ForeignKey(
        MonthlyChecklist, on_delete=models.CASCADE, related_name="items"
    )
    name = models.CharField(max_length=255)
    projected_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    actual_amount = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True,
        help_text="Actual amount paid (may differ from projected)"
    )
    is_paid = models.BooleanField(default=False)
    paid_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    display_order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        db_table = "checklist_items"
        ordering = ["display_order", "id"]

    def __str__(self):
        return f"{self.name} ({self.checklist})"
