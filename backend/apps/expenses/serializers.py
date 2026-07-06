from rest_framework import serializers
from .models import RecurringExpense, RecurringExpenseSkip


class RecurringExpenseSkipSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecurringExpenseSkip
        fields = ["id", "month_year"]


class RecurringExpenseSerializer(serializers.ModelSerializer):
    skips = RecurringExpenseSkipSerializer(many=True, read_only=True)
    owner_name = serializers.CharField(source="owner.display_name", read_only=True)

    class Meta:
        model = RecurringExpense
        fields = ["id", "name", "projected_amount", "owner", "owner_name",
                   "main_category", "skips"]
