from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r"years", views.YearViewSet, basename="year")
router.register(r"pots", views.SavingsPotViewSet, basename="pot")
router.register(r"categories", views.CategoryViewSet, basename="category")
router.register(r"types", views.TransactionTypeViewSet, basename="type")
router.register(r"fx-rates", views.FXRateViewSet, basename="fxrate")

urlpatterns = [
    path("", include(router.urls)),
]
