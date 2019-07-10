import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser


class UUIDModel(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    class Meta:
        abstract = True


class User(AbstractUser, UUIDModel):
    pass


class OwnedModel(models.Model):
    created_at = models.DateTimeField(
        auto_now_add=True,
        editable=False,
    )
    user = models.ForeignKey(
        'datasets.User',
        on_delete=models.CASCADE,
        related_name='+',
        editable=False
    )

    class Meta:
        abstract = True
