from rest_framework import serializers
from .models import MonthlyChecklist, ChecklistItem


class ChecklistItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChecklistItem
        fields = [
            "id", "name", "projected_amount", "actual_amount",
            "is_paid", "paid_date", "notes", "display_order",
        ]
        read_only_fields = ["id"]


class MonthlyChecklistSerializer(serializers.ModelSerializer):
    items = ChecklistItemSerializer(many=True, read_only=True)
    month_label = serializers.SerializerMethodField()

    class Meta:
        model = MonthlyChecklist
        fields = ["id", "month_year", "month_label", "items"]
        read_only_fields = ["id"]

    def get_month_label(self, obj):
        return obj.month_year.strftime("%B %Y")
