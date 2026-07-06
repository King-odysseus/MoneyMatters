from django.contrib import admin
from .models import MonthlyLedger, LedgerPotValue

@admin.register(MonthlyLedger)
class MonthlyLedgerAdmin(admin.ModelAdmin):
    list_display = ("year", "month", "joint_income", "monthly_expenses", "savings")
    list_filter = ("year",)

@admin.register(LedgerPotValue)
class LedgerPotValueAdmin(admin.ModelAdmin):
    list_display = ("ledger", "pot", "amount")
