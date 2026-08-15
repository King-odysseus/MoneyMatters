from django.test import TestCase

from .models import Household


class HouseholdModelTests(TestCase):
    def test_default_values(self):
        household = Household.objects.create(name="Smith Household")

        self.assertEqual(household.base_currency, "GBP")
        self.assertEqual(household.fiscal_year_start_month, 1)

    def test_string_representation(self):
        household = Household.objects.create(name="Smith Household")

        self.assertEqual(str(household), "Smith Household")
