from django.db import transaction
from rest_framework import serializers

from datasets import models
from datasets.constants import method_types

class UserFilteredPrimaryKeyRelatedField(serializers.PrimaryKeyRelatedField):
    def get_queryset(self):
        request = self.context.get('request', None)
        queryset = super(UserFilteredPrimaryKeyRelatedField, self).get_queryset()
        if not request or not queryset:
            return None
        return queryset.filter(user=request.user)


class ProcessingMethodSerializer(serializers.ModelSerializer):

    class Meta:
        model = models.ProcessingMethod
        exclude = ('classname',)


class ProcessSerializer(serializers.ModelSerializer):

    class Meta:
        model = models.Process
        exclude = ('task', 'user', 'created_at')


class AnalysisLabelSerializer(serializers.ModelSerializer):

    class Meta:
        model = models.AnalysisLabel
        exclude = ('user',)


class AnalysisSampleSerializer(serializers.ModelSerializer):
    label = UserFilteredPrimaryKeyRelatedField(queryset=models.AnalysisLabel.objects)
    session = UserFilteredPrimaryKeyRelatedField(queryset=models.Session.objects)

    class Meta:
        model = models.AnalysisSample
        exclude = ('user',)


class AnalysisSerializer(serializers.ModelSerializer):
    signal = UserFilteredPrimaryKeyRelatedField(
        queryset=models.Signal.objects
    )
    label = UserFilteredPrimaryKeyRelatedField(
        queryset=models.AnalysisLabel.objects
    )
    snapshot = UserFilteredPrimaryKeyRelatedField(
        queryset=models.AnalysisSnapshot,
        default=None
    )
    process = ProcessSerializer(read_only=True)
    configuration = serializers.JSONField(write_only=True, default={})

    class Meta:
        model = models.Analysis
        exclude = ('user',)
        read_only_fields = ('result', 'status')

    def create(self, validated_data):
        configuration = validated_data.pop('configuration', {})
        instance = super(AnalysisSerializer, self).create(validated_data)

        plugin = instance.method.get_plugin()
        configuration = {
            **plugin.default_configuration(),
            **configuration
        }

        process = ProcessSerializer().create({
            'configuration': configuration,
            'method': instance.method,
            'user': instance.user
        })
        instance.process = process
        instance.save()

        return instance


class AnalysisSnapshotSerializer(serializers.ModelSerializer):
    analyses = UserFilteredPrimaryKeyRelatedField(
        queryset=models.Analysis.objects,
        many=True
    )

    class Meta:
        model = models.AnalysisSnapshot
        exclude = ('user',)


class AnalysisExportSerializer(serializers.Serializer):
    sessions = UserFilteredPrimaryKeyRelatedField(
        queryset=models.Session.objects,
        many=True
    )
    labels = UserFilteredPrimaryKeyRelatedField(
        queryset=models.AnalysisLabel.objects,
        many=True
    )


class SignalSerializer(serializers.ModelSerializer):
    process = ProcessSerializer(read_only=True)

    class Meta:
        model = models.Signal
        exclude = ('user', )
        read_only_fields = ('raw_file',)


class FilteredSignalSerializer(serializers.Serializer):
    signal = UserFilteredPrimaryKeyRelatedField(queryset=models.Signal.objects)
    filter = serializers.PrimaryKeyRelatedField(
        queryset=models.ProcessingMethod.objects
    )
    configuration = serializers.JSONField(default={})

    @transaction.atomic
    def create(self, validated_data):
        signal = validated_data.get('signal')
        filter = validated_data.get('filter')
        plugin = filter.get_plugin()
        configuration = {
            **plugin.default_configuration(),
            **validated_data.get('configuration')
        }

        if hasattr(signal, 'filtered_signal'):
            signal.filtered_signal.delete()

        process = models.Process.objects.create(
            method=filter,
            configuration=configuration,
            user=signal.user,
        )

        filtered_signal = models.Signal.objects.create(
            name=signal.name + ' Filtered',
            dataset=signal.dataset,
            type=signal.type,
            raw_signal=signal,
            process=process,
            frequency=signal.frequency,
            unit=signal.unit,
            user=signal.user,
        )

        return filtered_signal

    def to_representation(self, instance):
        return SignalSerializer().to_representation(instance)


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
    analysis_samples = AnalysisSampleSerializer(many=True, read_only=True)

    class Meta:
        model = models.Session
        exclude = ('user',)
        read_only_fields = ('datasets', 'analysis_samples')


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
