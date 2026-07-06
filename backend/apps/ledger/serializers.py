from rest_framework import serializers
from .models import MonthlyLedger, LedgerPotValue


class LedgerPotValueSerializer(serializers.ModelSerializer):
    pot_name = serializers.CharField(source="pot.name", read_only=True)

    class Meta:
        model = LedgerPotValue
        fields = ["id", "pot", "pot_name", "amount"]


class MonthlyLedgerSerializer(serializers.ModelSerializer):
    pot_values = LedgerPotValueSerializer(many=True, read_only=True)
    year_label = serializers.IntegerField(source="year.year", read_only=True)

    class Meta:
        model = MonthlyLedger
        fields = [
            "id", "year", "year_label", "month",
            "joint_income", "savings", "monthly_expenses",
            "pot_values",
        ]
        read_only_fields = ["id", "savings", "monthly_expenses"]


class LedgerUpdateSerializer(serializers.ModelSerializer):
    """Used for updating ledger rows — only editable fields."""

    class Meta:
        model = MonthlyLedger
        fields = ["joint_income"]
