from django.contrib import admin
from .models import MortgageConfig, RateChange, PaymentChange

@admin.register(MortgageConfig)
class MortgageConfigAdmin(admin.ModelAdmin):
    list_display = ("household", "loan_amount", "start_date", "term_years")

@admin.register(RateChange)
class RateChangeAdmin(admin.ModelAdmin):
    list_display = ("mortgage", "effective_date", "annual_rate")

@admin.register(PaymentChange)
class PaymentChangeAdmin(admin.ModelAdmin):
    list_display = ("mortgage", "effective_date", "monthly_payment")
