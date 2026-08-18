from django.contrib.auth import get_user_model
from django.http import HttpResponse
from django.test import RequestFactory, TestCase

from .middleware import CurrentHouseholdMiddleware
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

    def test_reverse_relationships(self):
        user = get_user_model().objects.create_user(username="alex")
        household = Household.objects.create(name="Smith Household")
        profile = UserProfile.objects.create(user=user, household=household)

        self.assertEqual(user.profile, profile)
        self.assertEqual(household.members.get(), profile)

    def test_deleting_household_deletes_profile_but_preserves_user(self):
        user = get_user_model().objects.create_user(username="alex")
        household = Household.objects.create(name="Smith Household")
        profile = UserProfile.objects.create(user=user, household=household)
        user_id = user.pk
        profile_id = profile.pk

        household.delete()

        self.assertFalse(UserProfile.objects.filter(pk=profile_id).exists())
        self.assertTrue(get_user_model().objects.filter(pk=user_id).exists())


class CurrentHouseholdMiddlewareTests(TestCase):
    def test_sets_household_for_authenticated_user_with_profile(self):
        user = get_user_model().objects.create_user(username="alex")
        household = Household.objects.create(name="Smith Household")
        UserProfile.objects.create(user=user, household=household)
        request = RequestFactory().get("/")
        request.user = user
        expected_response = HttpResponse("ok")
        middleware = CurrentHouseholdMiddleware(
            lambda _request: expected_response
        )

        response = middleware(request)

        self.assertEqual(request.household, household)
        self.assertIs(response, expected_response)

    def test_sets_none_for_authenticated_user_without_profile(self):
        user = get_user_model().objects.create_user(username="alex")
        request = RequestFactory().get("/")
        request.user = user
        expected_response = HttpResponse("ok")
        middleware = CurrentHouseholdMiddleware(
            lambda _request: expected_response
        )

        response = middleware(request)

        self.assertIsNone(request.household)
        self.assertIs(response, expected_response)
