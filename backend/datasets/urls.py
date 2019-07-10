from django.urls import path, re_path
from rest_framework.urlpatterns import format_suffix_patterns
from . import views

urlpatterns = [
    path('sources/', views.SourceList.as_view()),
    path('subjects/', views.SubjectListCreate.as_view()),
    path('subjects/<uuid:pk>/', views.SubjectDetail.as_view()),
    path('subjects/<uuid:subject>/sessions/', views.SessionListCreate.as_view()),
    path('sessions/<uuid:pk>/', views.SessionDetail.as_view()),
    path('sessions/<uuid:session>/datasets/', views.DatasetListCreate.as_view()),
    path('datasets/<uuid:pk>/', views.DatasetDetail.as_view()),
    path('datasets/<uuid:dataset>/files/', views.RawFileCreate.as_view()),
    path('datasets/<uuid:dataset>/parse/', views.DatasetReparse.as_view()),
    path('signals/<uuid:pk>/', views.SignalDetail.as_view()),
    path('signals/<uuid:signal>/samples/', views.SampleList.as_view()),
]

urlpatterns = format_suffix_patterns(urlpatterns)
