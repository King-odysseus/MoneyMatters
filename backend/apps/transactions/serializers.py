from decimal import Decimal
from rest_framework import serializers
from .models import ExtraTransaction


class ExtraTransactionSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source="created_by.display_name", read_only=True)

    class Meta:
        model = ExtraTransaction
        fields = [
            "id", "date", "category", "type", "amount", "notes",
            "signed_amount", "month_year", "pot", "created_by_name", "created_at"
        ]
        read_only_fields = ["id", "signed_amount", "month_year", "created_at"]

    def create(self, validated_data):
        return _save_with_calculations(validated_data, self.context)


class TransactionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExtraTransaction
        fields = ["date", "category", "type", "amount", "notes", "pot"]

    def create(self, validated_data):
        return _save_with_calculations(validated_data, self.context)


def _save_with_calculations(validated_data, context):
    """Compute signed_amount and month_year, save, and recalculate ledger."""
    from datetime import date
    from apps.ledger.models import MonthlyLedger
    from apps.ledger.services import recalculate_ledger_row

    request = context.get("request")
    txn_type = validated_data.get("type", "")
    amount = validated_data.get("amount", Decimal("0.00"))
    txn_date = validated_data.get("date", date.today())

    # Determine signed amount based on transaction type
    signed_map = {
        "Expense": -amount,
        "Refund": amount,
        "Expense from Pot": -amount,
        "Refund to Pot": amount,
        "Interest earned to Pot": amount,
        "Interest earned main account": amount,
    }
    signed_amount = signed_map.get(txn_type, -amount)

    # Compute month_year
    month_year = txn_date.replace(day=1)

    txn = ExtraTransaction(
        household=request.household,
        signed_amount=signed_amount,
        month_year=month_year,
        created_by=request.user,
        **validated_data,
    )
    txn.save()

    # Recalculate the affected ledger row
    try:
        ledger_row = MonthlyLedger.objects.get(
            year__household=request.household,
            month=txn_date.month,
            year__year=txn_date.year,
        )
        recalculate_ledger_row(ledger_row)
    except MonthlyLedger.DoesNotExist:
        pass

    return txn
