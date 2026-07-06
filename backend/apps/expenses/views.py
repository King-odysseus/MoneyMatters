from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import RecurringExpense, RecurringExpenseSkip
from .serializers import RecurringExpenseSerializer, RecurringExpenseSkipSerializer
from apps.ledger.services import recalculate_ledger_row
from apps.ledger.models import MonthlyLedger


class RecurringExpenseViewSet(viewsets.ModelViewSet):
    serializer_class = RecurringExpenseSerializer

    def get_queryset(self):
        return RecurringExpense.objects.filter(
            household=self.request.household
        ).prefetch_related("skips")

    def perform_create(self, serializer):
        serializer.save(household=self.request.household)

    @action(detail=True, methods=["post"])
    def toggle_month(self, request, pk=None):
        """Toggle a month on/off for this expense. Triggers recalculation."""
        expense = self.get_object()
        month_year = request.data.get("month_year")
        active = request.data.get("active", True)

        if not month_year:
            return Response({"error": "month_year required"}, status=400)

        if active:
            RecurringExpenseSkip.objects.filter(
                expense=expense, month_year=month_year
            ).delete()
        else:
            RecurringExpenseSkip.objects.get_or_create(
                expense=expense, month_year=month_year
            )

        # Recalculate affected ledger row
        try:
            ledger_row = MonthlyLedger.objects.get(
                year__household=request.household,
                month=int(month_year.split("-")[1]),
                year__year=int(month_year.split("-")[0]),
            )
            recalculate_ledger_row(ledger_row)
        except MonthlyLedger.DoesNotExist:
            pass

        return Response(self.get_serializer(expense).data)
