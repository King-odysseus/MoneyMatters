from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.db import models


class Household(models.Model):
    """A household is the top-level multi-tenant boundary."""

    name = models.CharField(max_length=255)
    base_currency = models.CharField(max_length=3, default="GBP")
    fiscal_year_start_month = models.PositiveSmallIntegerField(default=1)  # January
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "households"

    def __str__(self):
        return self.name


class User(AbstractUser):
    """Custom user model with household membership."""

    class Role(models.TextChoices):
        ADMIN = "admin", "Admin"
        MEMBER = "member", "Member"
        VIEWER = "viewer", "Viewer"

    household = models.ForeignKey(
        Household,
        on_delete=models.CASCADE,
        related_name="members",
        null=True,
        blank=True,
    )
    display_name = models.CharField(max_length=255, blank=True)
    descriptive_role = models.CharField(
        max_length=50,
        blank=True,
        help_text="Descriptive label: Primary User, Secondary User, Joint, etc.",
    )
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.MEMBER,
    )

    class Meta:
        db_table = "users"

    def __str__(self):
        return self.display_name or self.username
