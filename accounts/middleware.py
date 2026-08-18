from .models import UserProfile


class CurrentHouseholdMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        request.household = None

        if request.user.is_authenticated:
            try:
                request.household = request.user.profile.household
            except UserProfile.DoesNotExist:
                pass

        return self.get_response(request)
