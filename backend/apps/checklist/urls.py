from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r"lists", views.MonthlyChecklistViewSet, basename="checklist")
router.register(r"items", views.ChecklistItemViewSet, basename="checklist-item")

urlpatterns = [path("", include(router.urls))]
