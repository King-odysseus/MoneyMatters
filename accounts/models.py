from django.conf import settings
from django.db import models


class Household(models.Model):
    """Top-level container isolating all financial data for one household."""

    name = models.CharField(max_length=200)
    base_currency = models.CharField(max_length=3, default="GBP")
    fiscal_year_start_month = models.PositiveSmallIntegerField(default=4)  # April
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class UserProfile(models.Model):
    """Extends Django's User with household membership and a descriptive role label."""

    class PermissionRole(models.TextChoices):
        ADMIN = "admin", "Admin"
        MEMBER = "member", "Member"
        VIEWER = "viewer", "Viewer"

    class DescriptiveRole(models.TextChoices):
        PRIMARY = "primary", "Primary User"
        SECONDARY = "secondary", "Secondary User"
        JOINT = "joint", "Joint"

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="profile",
    )
    household = models.ForeignKey(
        Household,
        on_delete=models.CASCADE,
        related_name="members",
    )
    display_name = models.CharField(max_length=150, blank=True)
    descriptive_role = models.CharField(
        max_length=20,
        choices=DescriptiveRole.choices,
        default=DescriptiveRole.PRIMARY,
    )
    permission_role = models.CharField(
        max_length=20,
        choices=PermissionRole.choices,
        default=PermissionRole.ADMIN,
    )
    avatar_url = models.URLField(blank=True)

    class Meta:
        ordering = ["user__email"]

    def __str__(self):
        return self.display_name or self.user.email
