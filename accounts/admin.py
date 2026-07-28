from django.contrib import admin

from .models import Household, UserProfile


@admin.register(Household)
class HouseholdAdmin(admin.ModelAdmin):
    list_display = ("name", "base_currency", "fiscal_year_start_month", "created_at")
    search_fields = ("name",)


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "display_name", "household", "descriptive_role", "permission_role")
    list_filter = ("household", "permission_role", "descriptive_role")
    search_fields = ("user__email", "display_name")
    raw_id_fields = ("user",)
