from django.conf import settings
from django.db import models

class Household(models.Model):
    """top level container for all financial data for a household"""

    name = models.CharField(max_length=100)
    base_currency = models.CharField(max_length=3, default="GBP")
    fiscal_year_start_month = models.PositiveSmallIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class UserProfile(models.Model):
    """Stores a Django user's household membership and financial label."""

    class Role(models.TextChoices):
        PRIMARY = "PRIMARY", "Primary User"
        SECONDARY = "SECONDARY", "Secondary User"
        JOINT = "JOINT", "Joint"

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
    descriptive_role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.SECONDARY,
    )
    avatar = models.ImageField(
        upload_to="avatars/",
        blank=True,
        null=True,
    )
