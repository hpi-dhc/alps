from rest_framework import serializers

from . import models

class UserFilteredPrimaryKeyRelatedField(serializers.PrimaryKeyRelatedField):
    def get_queryset(self):
        request = self.context.get('request', None)
        queryset = super(UserFilteredPrimaryKeyRelatedField, self).get_queryset()
        if not request or not queryset:
            return None
        return queryset.filter(user=request.user)


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
    configuration = serializers.JSONField(default={})

    class Meta:
        model = models.Analysis
        exclude = ('user',)
        read_only_fields = ('result', 'status')


class AnalysisSnapshotSerializer(serializers.ModelSerializer):
    analyses = UserFilteredPrimaryKeyRelatedField(
        queryset=models.Analysis.objects,
        many=True
    )

    class Meta:
        model = models.AnalysisSnapshot
        exclude = ('user',)


class ProcessingMethodSerializer(serializers.ModelSerializer):

    class Meta:
        model = models.ProcessingMethod
        exclude = ('classname',)


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
