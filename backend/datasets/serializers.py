import re
from django.shortcuts import get_object_or_404
from rest_framework import serializers

from . import models


class SignalSerializer(serializers.ModelSerializer):

    class Meta:
        model = models.Signal
        exclude = ('user', )
        read_only_fields = ('raw_file',)


class RawFileSerializer(serializers.ModelSerializer):

    class Meta:
        model = models.RawFile
        exclude = ('user',)
        extra_kwargs = {
            'path': {'write_only': True},
        }


class DatasetSerializer(serializers.ModelSerializer):
    signals = SignalSerializer(many=True, read_only=True)
    raw_files = RawFileSerializer(many=True, read_only=True)

    class Meta:
        model = models.Dataset
        exclude = ('user',)


class SessionDetailSerializer(serializers.ModelSerializer):
    datasets = DatasetSerializer(many=True, read_only=True)

    class Meta:
        model = models.Session
        exclude = ('user',)
        read_only_fields = ('datasets',)


class SessionListCreateSerializer(serializers.ModelSerializer):
    datasets = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = models.Session
        exclude = ('user',)


class SubjectListSerializer(serializers.ModelSerializer):
    sessions = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = models.Subject
        exclude = ('user',)


class SubjectSerializer(serializers.ModelSerializer):
    sessions = SessionListCreateSerializer(many=True, read_only=True)

    class Meta:
        model = models.Subject
        exclude = ('user',)


class SourceSerializer(serializers.ModelSerializer):

    class Meta:
        model = models.Source
        exclude = ('classname', )
