from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("apps.core.urls")),
    path("api/config/", include("apps.config_app.urls")),
    path("api/ledger/", include("apps.ledger.urls")),
    path("api/expenses/", include("apps.expenses.urls")),
    path("api/transactions/", include("apps.transactions.urls")),
    path("api/dashboard/", include("apps.dashboard.urls")),
]
