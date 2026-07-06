from datetime import date
from dateutil.relativedelta import relativedelta
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import MonthlyChecklist, ChecklistItem
from .serializers import MonthlyChecklistSerializer, ChecklistItemSerializer


class MonthlyChecklistViewSet(viewsets.ModelViewSet):
    serializer_class = MonthlyChecklistSerializer

    def get_queryset(self):
        return MonthlyChecklist.objects.filter(
            household=self.request.household
        ).prefetch_related("items")

    @action(detail=False, methods=["get"])
    def current(self, request):
        """Get or auto-create the checklist for the current month."""
        household = request.household
        today = date.today()
        month_start = today.replace(day=1)

        checklist, created = MonthlyChecklist.objects.get_or_create(
            household=household,
            month_year=month_start,
        )

        # If newly created, auto-suggest items from last month
        if created:
            last_month_start = (month_start - relativedelta(months=1))
            try:
                last_checklist = MonthlyChecklist.objects.get(
                    household=household,
                    month_year=last_month_start,
                )
                for item in last_checklist.items.all():
                    ChecklistItem.objects.create(
                        checklist=checklist,
                        name=item.name,
                        projected_amount=item.projected_amount,
                        display_order=item.display_order,
                    )
            except MonthlyChecklist.DoesNotExist:
                pass

        return Response(self.get_serializer(checklist).data)

    @action(detail=False, methods=["get"])
    def by_month(self, request):
        """Get checklist for a specific month."""
        month_year = request.query_params.get("month_year")
        if not month_year:
            return Response({"error": "month_year required"}, status=400)

        household = request.household
        checklist, _ = MonthlyChecklist.objects.get_or_create(
            household=household,
            month_year=month_year,
        )
        return Response(self.get_serializer(checklist).data)


class ChecklistItemViewSet(viewsets.ModelViewSet):
    serializer_class = ChecklistItemSerializer

    def get_queryset(self):
        return ChecklistItem.objects.filter(
            checklist__household=self.request.household
        )

    def perform_create(self, serializer):
        checklist_id = self.request.data.get("checklist_id")
        checklist = MonthlyChecklist.objects.get(
            id=checklist_id,
            household=self.request.household,
        )
        serializer.save(checklist=checklist)

    @action(detail=True, methods=["post"])
    def toggle_paid(self, request, pk=None):
        """Toggle paid status and record actual amount / paid date."""
        item = self.get_object()
        item.is_paid = not item.is_paid

        if item.is_paid:
            item.paid_date = date.today()
            # Use actual_amount if provided, otherwise projected
            actual = request.data.get("actual_amount")
            if actual is not None:
                item.actual_amount = actual
            elif item.actual_amount is None:
                item.actual_amount = item.projected_amount
        else:
            item.paid_date = None

        item.save()
        return Response(self.get_serializer(item).data)
