from django.contrib.auth import get_user_model
from django.test import TestCase

from .models import Household, UserProfile


class HouseholdModelTests(TestCase):
    def test_default_values(self):
        household = Household.objects.create(name="Smith Household")

        self.assertEqual(household.base_currency, "GBP")
        self.assertEqual(household.fiscal_year_start_month, 1)

    def test_string_representation(self):
        household = Household.objects.create(name="Smith Household")

        self.assertEqual(str(household), "Smith Household")


class UserProfileModelTests(TestCase):
    def test_default_role(self):
        user = get_user_model().objects.create_user(username="alex")
        household = Household.objects.create(name="Smith Household")
        profile = UserProfile.objects.create(user=user, household=household)

        self.assertEqual(profile.descriptive_role, UserProfile.Role.SECONDARY)
