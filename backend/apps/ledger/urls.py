from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r"rows", views.MonthlyLedgerViewSet, basename="ledger")
router.register(r"pot-values", views.LedgerPotValueViewSet, basename="potvalue")

urlpatterns = [
    path("", include(router.urls)),
]
