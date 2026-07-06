from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Year, SavingsPot, Category, TransactionType, FXRate
from .serializers import (
    YearSerializer, SavingsPotSerializer, CategorySerializer,
    TransactionTypeSerializer, FXRateSerializer,
)


class HouseholdScopedViewSet(viewsets.ModelViewSet):
    """Base ViewSet that scopes all queries to the request user's household."""

    def get_queryset(self):
        return super().get_queryset().filter(household=self.request.household)

    def perform_create(self, serializer):
        serializer.save(household=self.request.household)


class YearViewSet(HouseholdScopedViewSet):
    queryset = Year.objects.all()
    serializer_class = YearSerializer

    @action(detail=True, methods=["post"])
    def archive(self, request, pk=None):
        year = self.get_object()
        year.is_archived = True
        year.save()
        return Response(self.get_serializer(year).data)


class SavingsPotViewSet(HouseholdScopedViewSet):
    queryset = SavingsPot.objects.all()
    serializer_class = SavingsPotSerializer

    @action(detail=False, methods=["post"])
    def reorder(self, request):
        """Accept a list of {id, display_order} to reorder pots."""
        for item in request.data:
            SavingsPot.objects.filter(
                id=item["id"], household=request.household
            ).update(display_order=item["display_order"])
        return Response({"status": "ok"})


class CategoryViewSet(HouseholdScopedViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class TransactionTypeViewSet(HouseholdScopedViewSet):
    queryset = TransactionType.objects.all()
    serializer_class = TransactionTypeSerializer


class FXRateViewSet(HouseholdScopedViewSet):
    queryset = FXRate.objects.all()
    serializer_class = FXRateSerializer
