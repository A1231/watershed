from django.urls import path
from . import views

# URL Configurations for Watershed API
urlpatterns = [
    # Main API endpoint for finding watershed by coordinates
    #path('find-watershed/', views.find_watershed_by_coordinates, name='find_watershed_by_coordinates'),
    
    # Get watershed by HUC code
    path('watershed/huc/<str:huc_code>/', views.get_watershed_by_huc, name='get_watershed_by_huc'),
    
    # Get all watersheds in a basin
    path('watersheds/basin/<str:basin_name>/', views.get_watersheds_in_basin, name='get_watersheds_in_basin'),
    
    # Get watersheds by HUC-12 name
    path('watersheds/hu12name/<str:hu_12_name>/', views.get_watersheds_by_hu_12_name, name='get_watersheds_by_hu_12_name'),
    
    # Autocomplete endpoints
    path('autocomplete/basin/', views.autocomplete_basin_names, name='autocomplete_basin_names'),
    path('autocomplete/hu12name/', views.autocomplete_hu12_names, name='autocomplete_hu12_names'),

   # path('hello-world/', views.hello_world, name='hello_world'),
   # path('hello-earth/', views.HelloEarth.as_view(), name='hello_earth'),
]