"""
URL configuration for watershed_backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse



def api_info(request):
    """Simple API info endpoint"""
    return JsonResponse({
        'message': 'Watershed Analysis API',
        'version': '1.0.0',
        'status': 'running',
        'database': 'Connected to Supabase PostGIS',
        'endpoints': {
            'get_by_huc': '/watershed_api/watershed/huc/{huc_code}/',
            'get_by_basin': '/watershed_api/watersheds/basin/{basin_name}/',
            'get_by_hu12name': '/watershed_api/watersheds/hu12name/{hu12_name}/'
        }
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', api_info, name='api_info'),
    path('watershed_api/', include('watershed_api.urls')),
   
]
