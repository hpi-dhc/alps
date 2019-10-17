from django.urls import path
from rest_framework.urlpatterns import format_suffix_patterns
from . import views

urlpatterns = [
    path('sources/', views.SourceList.as_view()),
    path('processing_methods/', views.ProcessingMethodList.as_view()),

    path('subjects/', views.SubjectListCreate.as_view()),
    path('subjects/<uuid:pk>/', views.SubjectDetail.as_view()),
    path('subjects/<uuid:subject>/sessions/', views.SessionListCreate.as_view()),

    path('sessions/', views.SessionListCreate.as_view()),
    path('sessions/<uuid:pk>/', views.SessionDetail.as_view()),
    path('sessions/<uuid:session>/datasets/', views.DatasetListCreate.as_view()),
    path('sessions/<uuid:session>/analysis_samples/', views.AnalysisSampleCreate.as_view()),

    path('datasets/<uuid:pk>/', views.DatasetDetail.as_view()),
    path('datasets/<uuid:dataset>/files/', views.RawFileCreate.as_view()),
    path('datasets/<uuid:dataset>/parse/', views.DatasetReparse.as_view()),

    path('signals/<uuid:pk>/', views.SignalDetail.as_view()),
    path('signals/<uuid:signal>/samples/', views.SampleList.as_view()),

    path('analysis/', views.AnalysisListCreate.as_view()),
    path('analysis/<uuid:pk>/', views.AnalysisDetail.as_view()),
    path('analysis/export/', views.AnalysisExport.as_view()),

    path('analysis_samples/<uuid:pk>/', views.AnalysisSampleDetail.as_view()),

    path('analysis_labels/', views.AnalysisLabelListCreate.as_view()),
    path('analysis_labels/<uuid:pk>/', views.AnalysisLabelDetail.as_view()),

    path('analysis_snapshots/', views.AnalysisSnapshotListCreate.as_view()),

    path('sync/', views.Synchronization.as_view()),
    path('filter/', views.FilterSignal.as_view()),
]

urlpatterns = format_suffix_patterns(urlpatterns)
