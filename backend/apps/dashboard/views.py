from datetime import date, timedelta
from decimal import Decimal
from calendar import monthrange
from rest_framework.decorators import api_view
from rest_framework.response import Response

from apps.ledger.models import MonthlyLedger, LedgerPotValue
from apps.config_app.models import SavingsPot
from apps.transactions.models import ExtraTransaction


@api_view(["GET"])
def dashboard_summary(request):
    """Return comprehensive dashboard data with pot breakdowns and time-series."""
    household = request.household
    if not household:
        return Response({"error": "No household"}, status=400)

    period = request.query_params.get("period", "year")  # year, month, week, day
    year_param = request.query_params.get("year")

    today = date.today()
    if year_param:
        try:
            current_year = int(year_param)
        except ValueError:
            current_year = today.year
    else:
        current_year = today.year

    # Get ledger rows for the selected year
    from apps.config_app.models import Year
    year_obj = Year.objects.filter(household=household, year=current_year).first()

    if not year_obj:
        return Response({
            "kpi_cards": [],
            "pots": [],
            "monthly_trend": [],
            "total_income_ytd": "0.00",
            "total_expenses_ytd": "0.00",
            "total_savings_ytd": "0.00",
            "net_cashflow_ytd": "0.00",
        })

    rows = MonthlyLedger.objects.filter(year=year_obj).order_by("month")
    pots = SavingsPot.objects.filter(household=household).order_by("display_order")

    # Filter by period
    current_month = today.month if current_year == today.year else 12
    filtered_rows = rows
    if period == "month":
        filtered_rows = rows.filter(month=current_month)
    elif period == "week":
        # Current week's month
        filtered_rows = rows.filter(month=current_month)
    elif period == "day":
        filtered_rows = rows.filter(month=current_month)

    # KPI cards - one per pot showing YTD totals
    kpi_cards = []
    pot_colors = ["#6366f1", "#06b6d4", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444", "#ec4899", "#14b8a6"]

    for i, pot in enumerate(pots):
        pot_values = LedgerPotValue.objects.filter(
            ledger__in=filtered_rows, pot=pot
        )
        pot_total = sum(pv.amount for pv in pot_values)

        # Monthly trend for this pot
        monthly_pot_data = []
        for row in rows:
            pv = row.pot_values.filter(pot=pot).first()
            monthly_pot_data.append({
                "month": row.month,
                "month_label": date(current_year, row.month, 1).strftime("%b"),
                "amount": str(pv.amount if pv else Decimal("0.00")),
            })

        kpi_cards.append({
            "id": pot.id,
            "name": pot.name,
            "ytd_total": str(pot_total),
            "color": pot_colors[i % len(pot_colors)],
            "monthly_data": monthly_pot_data,
        })

    # Aggregate KPIs
    total_income = sum(r.joint_income for r in rows)
    total_expenses = sum(r.monthly_expenses for r in rows)
    total_savings = sum(r.savings for r in rows)

    # Monthly trend data for combo chart
    monthly_trend = []
    cumulative_savings = Decimal("0.00")
    for row in rows:
        cumulative_savings += row.savings
        monthly_trend.append({
            "month": row.month,
            "month_label": date(current_year, row.month, 1).strftime("%b"),
            "income": str(row.joint_income),
            "expenses": str(row.monthly_expenses),
            "savings": str(row.savings),
            "cumulative_savings": str(cumulative_savings),
        })

    # Recent transactions
    recent_txns = ExtraTransaction.objects.filter(
        household=household
    ).order_by("-date")[:10]

    recent = []
    for txn in recent_txns:
        recent.append({
            "id": txn.id,
            "date": str(txn.date),
            "type": txn.type,
            "category": txn.category,
            "amount": str(txn.amount),
            "signed_amount": str(txn.signed_amount),
            "notes": txn.notes,
        })

    # Available years
    available_years = list(
        Year.objects.filter(household=household)
        .order_by("-year")
        .values_list("year", flat=True)
    )

    return Response({
        "kpi_cards": kpi_cards,
        "total_income_ytd": str(total_income),
        "total_expenses_ytd": str(total_expenses),
        "total_savings_ytd": str(total_savings),
        "net_cashflow_ytd": str(total_income - total_expenses),
        "monthly_trend": monthly_trend,
        "recent_transactions": recent,
        "available_years": available_years,
        "current_year": current_year,
    })
