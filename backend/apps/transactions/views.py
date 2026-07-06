from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import ExtraTransaction
from .serializers import ExtraTransactionSerializer, TransactionCreateSerializer


class ExtraTransactionViewSet(viewsets.ModelViewSet):
    def get_queryset(self):
        qs = ExtraTransaction.objects.filter(
            household=self.request.household
        ).select_related("pot", "created_by")

        month_year = self.request.query_params.get("month_year")
        if month_year:
            qs = qs.filter(month_year=month_year)
        return qs

    def get_serializer_class(self):
        if self.action == "create":
            return TransactionCreateSerializer
        return ExtraTransactionSerializer

    def get_serializer_context(self):
        return {"request": self.request}
