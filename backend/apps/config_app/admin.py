from django.contrib import admin
from .models import Year, SavingsPot, Category, TransactionType, FXRate

@admin.register(Year)
class YearAdmin(admin.ModelAdmin):
    list_display = ("year", "household", "is_archived")
    list_filter = ("household", "is_archived")

@admin.register(SavingsPot)
class SavingsPotAdmin(admin.ModelAdmin):
    list_display = ("name", "household", "display_order")
    list_filter = ("household",)

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "household", "display_order")
    list_filter = ("household",)

@admin.register(TransactionType)
class TransactionTypeAdmin(admin.ModelAdmin):
    list_display = ("name", "household", "effect_logic")
    list_filter = ("household",)

@admin.register(FXRate)
class FXRateAdmin(admin.ModelAdmin):
    list_display = ("from_currency", "to_currency", "rate", "household", "updated_at")
    list_filter = ("household",)
