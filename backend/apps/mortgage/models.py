from django.db import models


class MortgageConfig(models.Model):
    """Mortgage loan parameters. One per household in v1."""

    household = models.OneToOneField(
        "core.Household", on_delete=models.CASCADE, related_name="mortgage"
    )
    loan_amount = models.DecimalField(max_digits=12, decimal_places=2)
    start_date = models.DateField()
    term_years = models.PositiveSmallIntegerField()
    initial_rate = models.DecimalField(max_digits=6, decimal_places=4)
    fixed_period = models.PositiveSmallIntegerField(help_text="Fixed rate period in months")
    new_rate = models.DecimalField(max_digits=6, decimal_places=4)
    extra_payment = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    deposit = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    class Meta:
        db_table = "mortgage_config"

    def __str__(self):
        return f"Mortgage: {self.loan_amount}"


class RateChange(models.Model):
    """Scheduled or historical rate changes for a mortgage."""

    mortgage = models.ForeignKey(
        MortgageConfig, on_delete=models.CASCADE, related_name="rate_changes"
    )
    effective_date = models.DateField()
    annual_rate = models.DecimalField(max_digits=6, decimal_places=4)

    class Meta:
        db_table = "rate_changes"
        ordering = ["effective_date"]

    def __str__(self):
        return f"Rate {self.annual_rate}% from {self.effective_date}"


class PaymentChange(models.Model):
    """Overrides for monthly payment amounts at specific dates."""

    mortgage = models.ForeignKey(
        MortgageConfig, on_delete=models.CASCADE, related_name="payment_changes"
    )
    effective_date = models.DateField()
    monthly_payment = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        db_table = "payment_changes"
        ordering = ["effective_date"]

    def __str__(self):
        return f"Payment {self.monthly_payment} from {self.effective_date}"
