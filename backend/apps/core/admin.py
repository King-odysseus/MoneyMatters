from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import Household, User


@admin.register(Household)
class HouseholdAdmin(admin.ModelAdmin):
    list_display = ("name", "base_currency", "fiscal_year_start_month", "created_at")
    search_fields = ("name",)


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ("username", "email", "display_name", "household", "role", "is_active")
    list_filter = ("household", "role", "is_active")
    fieldsets = BaseUserAdmin.fieldsets + (
        ("Household", {"fields": ("household", "display_name", "descriptive_role", "role")}),
    )
