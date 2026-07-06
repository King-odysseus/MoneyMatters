from django.contrib import admin
from .models import MonthlyChecklist, ChecklistItem

class ChecklistItemInline(admin.TabularInline):
    model = ChecklistItem
    extra = 0

@admin.register(MonthlyChecklist)
class MonthlyChecklistAdmin(admin.ModelAdmin):
    list_display = ("month_year", "household")
    list_filter = ("household",)
    inlines = [ChecklistItemInline]
