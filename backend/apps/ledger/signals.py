from django.db.models.signals import post_save
from django.dispatch import receiver

from apps.config_app.models import Year, SavingsPot
from .models import MonthlyLedger, LedgerPotValue


@receiver(post_save, sender=Year)
def create_ledger_rows_for_year(sender, instance, created, **kwargs):
    """When a new Year is created, generate 12 empty MonthlyLedger rows."""
    if not created:
        return

    pots = SavingsPot.objects.filter(household=instance.household)

    for month in range(1, 13):
        ledger_row = MonthlyLedger.objects.create(
            year=instance,
            month=month,
            joint_income=0,
            savings=0,
            monthly_expenses=0,
        )
        for pot in pots:
            LedgerPotValue.objects.create(
                ledger=ledger_row,
                pot=pot,
                amount=0,
            )
