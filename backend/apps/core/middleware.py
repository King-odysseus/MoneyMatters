from django.contrib.auth.models import AnonymousUser


class HouseholdMiddleware:
    """Stamps request.household from the authenticated user's household."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if hasattr(request, "user") and not isinstance(request.user, AnonymousUser):
            request.household = request.user.household
        else:
            request.household = None
        return self.get_response(request)
