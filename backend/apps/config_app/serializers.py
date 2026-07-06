from rest_framework import serializers
from .models import Year, SavingsPot, Category, TransactionType, FXRate


class YearSerializer(serializers.ModelSerializer):
    class Meta:
        model = Year
        fields = ["id", "year", "is_archived"]
        read_only_fields = ["id"]


class SavingsPotSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavingsPot
        fields = ["id", "name", "display_order"]
        read_only_fields = ["id"]


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "display_order"]
        read_only_fields = ["id"]


class TransactionTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransactionType
        fields = ["id", "name", "effect_logic"]
        read_only_fields = ["id"]


class FXRateSerializer(serializers.ModelSerializer):
    class Meta:
        model = FXRate
        fields = ["id", "from_currency", "to_currency", "rate", "updated_at"]
        read_only_fields = ["id", "updated_at"]
