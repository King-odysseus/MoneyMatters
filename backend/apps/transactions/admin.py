from django.contrib import admin
from .models import ExtraTransaction

@admin.register(ExtraTransaction)
class ExtraTransactionAdmin(admin.ModelAdmin):
    list_display = ("date", "category", "type", "amount", "signed_amount", "household")
    list_filter = ("household", "category", "type", "date")
