from django.contrib import admin
from .models import RecurringExpense, RecurringExpenseSkip

@admin.register(RecurringExpense)
class RecurringExpenseAdmin(admin.ModelAdmin):
    list_display = ("name", "projected_amount", "owner", "main_category", "household")
    list_filter = ("household",)

@admin.register(RecurringExpenseSkip)
class RecurringExpenseSkipAdmin(admin.ModelAdmin):
    list_display = ("expense", "month_year")
