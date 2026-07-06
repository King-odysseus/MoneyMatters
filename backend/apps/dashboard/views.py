from rest_framework.decorators import api_view
from rest_framework.response import Response
from apps.ledger.models import MonthlyLedger


@api_view(["GET"])
def dashboard_summary(request):
    """Return KPI data for the dashboard."""
    household = request.household
    if not household:
        return Response({"error": "No household"}, status=400)

    rows = MonthlyLedger.objects.filter(year__household=household)
    total_income = sum(r.joint_income for r in rows)
    total_expenses = sum(r.monthly_expenses for r in rows)
    total_savings = sum(r.savings for r in rows)

    return Response({
        "total_income_ytd": str(total_income),
        "total_expenses_ytd": str(total_expenses),
        "total_savings_ytd": str(total_savings),
        "net_cashflow_ytd": str(total_income - total_expenses),
        "joint_account_balance": str(total_savings),
    })
