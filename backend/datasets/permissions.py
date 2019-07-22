from django.shortcuts import get_object_or_404
from rest_framework import permissions
from datasets.models.data import Dataset, Session


class IsOwner(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to retrieve and edit it.
    """

    def has_object_permission(self, request, view, obj):
        return obj.user == request.user


class IsSessionOwner(permissions.BasePermission):
    """
    Checks if the user is owner of the related session.
    """

    def has_permission(self, request, view):
        session = get_object_or_404(Session, pk=view.kwargs['session'])
        return request.user == session.user


class IsDatasetOwner(permissions.BasePermission):
    """
    Checks if the user is owner of the related session.
    """

    def has_permission(self, request, view):
        dataset = get_object_or_404(Dataset, pk=view.kwargs['dataset'])
        return request.user == dataset.user
