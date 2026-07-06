from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import MonthlyLedger, LedgerPotValue
from .serializers import MonthlyLedgerSerializer, LedgerUpdateSerializer, LedgerPotValueSerializer
from .services import recalculate_ledger_row


class MonthlyLedgerViewSet(viewsets.ModelViewSet):
    """CRUD for monthly ledger rows, scoped to household via year."""

    serializer_class = MonthlyLedgerSerializer

    def get_queryset(self):
        return MonthlyLedger.objects.filter(
            year__household=self.request.household
        ).select_related("year").prefetch_related("pot_values__pot")

    def get_serializer_class(self):
        if self.action in ("update", "partial_update"):
            return LedgerUpdateSerializer
        return MonthlyLedgerSerializer

    def perform_update(self, serializer):
        row = serializer.save()
        recalculate_ledger_row(row)

    @action(detail=True, methods=["post"])
    def recalculate(self, request, pk=None):
        """Force recalculation of a ledger row."""
        row = self.get_object()
        recalculate_ledger_row(row)
        return Response(self.get_serializer(row).data)

    @action(detail=False, methods=["get"])
    def by_year(self, request):
        """Get all ledger rows for a specific year."""
        year_id = request.query_params.get("year_id")
        if not year_id:
            return Response({"error": "year_id required"}, status=400)
        rows = self.get_queryset().filter(year_id=year_id)
        return Response(self.get_serializer(rows, many=True).data)


class LedgerPotValueViewSet(viewsets.ModelViewSet):
    queryset = LedgerPotValue.objects.all()
    serializer_class = LedgerPotValueSerializer

    def get_queryset(self):
        return super().get_queryset().filter(
            ledger__year__household=self.request.household
        )
