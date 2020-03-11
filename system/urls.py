from django.urls import path,include

from .views import *

urlpatterns = [
    path('list', orderListView.as_view(),name='list'),
    path('new', orderCreateView.as_view(),name='new'),
    path('nextnew', orderCreate2View.as_view(),name='nextnew'),
    path('update/<int:pk>', orderUpdateView.as_view(),name='update'),
    path('xlfile/<int:pk>', ExcelDownload, name='xlfile'),
]


