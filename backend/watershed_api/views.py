#from rest_framework_gis.renderers import GeoJSONRenderer
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.contrib.gis.geos import Point
from django.contrib.gis.db.models.functions import Distance
from django.db import models
from .models import Watersheds
from .serializers import WatershedsGeoJSONSerializer
import logging
from django.http import HttpResponse, JsonResponse
from django.views import View



logger = logging.getLogger(__name__)

# def hello_world(request):
#     watersheds_query_set = Watersheds.objects.all() # Manager object: interface to the database which returns a QuerySet object
#     #query set are lazy, they are not executed until they are used
#     #query set are iterable
   
#     for watershed in watersheds_query_set:
#         print(watershed.hu_12_name)

#     return HttpResponse("Hello, World!")

# class HelloEarth(View):
#     def get(self, request):
#         return JsonResponse({"message": "Hello, Earth!"})


# @api_view(['GET'])
# def find_watershed_by_coordinates(request):
#     """
#     Find watershed data by latitude and longitude coordinates.
    
#     Query parameters:
#     - lat: Latitude (required)
#     - lng: Longitude (required)
    
#     Returns the watershed that contains the given point.
#     """
#     try:
#         # Get coordinates from query parameters
#         lat = request.GET.get('lat')
#         lng = request.GET.get('lng')
        
#         if not lat or not lng:
#             return Response(
#                 {'error': 'Both lat and lng parameters are required'}, 
#                 status=status.HTTP_400_BAD_REQUEST
#             )
        
#         # Convert to float
#         try:
#             latitude = float(lat)
#             longitude = float(lng)
#         except ValueError:
#             return Response(
#                 {'error': 'Invalid coordinates. lat and lng must be numbers'}, 
#                 status=status.HTTP_400_BAD_REQUEST
#             )
        
#         # Create a Point object from the coordinates
#         point = Point(longitude, latitude, srid=4326)
        
#         # Find the watershed that contains this point
#         watershed = Watersheds.objects.filter(geom__contains=point).first()
        
#         if watershed:
#             serializer = WatershedsSerializer(watershed)
#             return Response({
#                 'status': 'success',
#                 'data': serializer.data,
#                 'message': f'Found watershed: {watershed.hu_12_name or "Unnamed"}'
#             })
#         else:
#             return Response({
#                 'status': 'not_found',
#                 'data': None,
#                 'message': 'No watershed found for the given coordinates'
#             }, status=status.HTTP_404_NOT_FOUND)
            
#     except Exception as e:
#         logger.error(f"Error finding watershed: {str(e)}")
#         return Response(
#             {'error': 'Internal server error occurred while finding watershed'}, 
#             status=status.HTTP_500_INTERNAL_SERVER_ERROR
#         )

@api_view(['GET'])
#@renderer_classes([GeoJSONRenderer])
def get_watershed_by_huc(request, huc_code):
    """
    Get watershed data by HUC code (8, 10, or 12 digit).
    
    URL parameter:
    - huc_code: HUC code to search for
    
    Returns watershed data matching the HUC code.
    """
    try:
        # Search for watershed by HUC code (try all HUC fields)
        watershed = Watersheds.objects.filter(
            models.Q(huc_8=huc_code) | 
            models.Q(huc_10=huc_code) | 
            models.Q(huc_12=huc_code)
        ).first()
        
        if watershed:
            serializer = WatershedsGeoJSONSerializer(watershed)
            return Response({
                'status': 'success',
                'data': serializer.data,
                'message': f'Found watershed: {watershed.hu_12_name or "Unnamed"}'
            })
        else:
            return Response({
                'status': 'not_found',
                'data': None,
                'message': f'No watershed found with HUC code: {huc_code}'
            }, status=status.HTTP_404_NOT_FOUND)
            
    except Exception as e:
        logger.error(f"Error finding watershed by HUC: {str(e)}")
        return Response(
            {'error': 'Internal server error occurred while finding watershed'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
#@renderer_classes([GeoJSONRenderer])
def get_watersheds_in_basin(request, basin_name):
    """
    Get all watersheds in a specific basin.
    
    URL parameter:
    - basin_name: Name of the basin to search for
    
    Returns list of watersheds in the specified basin.
    """
    try:
        watersheds = Watersheds.objects.filter(dwq_basin__icontains=basin_name)
        
        if watersheds.exists():
            serializer = WatershedsGeoJSONSerializer(watersheds, many=True)
            return Response({
                'status': 'success',
                'data': serializer.data,
                'count': watersheds.count(),
                'message': f'Found {watersheds.count()} watersheds in {basin_name} basin'
            })
        else:
            return Response({
                'status': 'not_found',
                'data': [],
                'count': 0,
                'message': f'No watersheds found in {basin_name} basin'
            }, status=status.HTTP_404_NOT_FOUND)
            
    except Exception as e:
        logger.error(f"Error finding watersheds in basin: {str(e)}")
        return Response(
            {'error': 'Internal server error occurred while finding watersheds'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
def get_watersheds_by_hu_12_name(request, hu_12_name):
    """
    Get all watersheds matching a specific HUC-12 name.
    
    URL parameter:
    - hu_12_name: Name of the HUC-12 watershed to search for (case-insensitive)
    
    Returns list of watersheds matching the specified HUC-12 name.
    """
    try:
        watersheds = Watersheds.objects.filter(hu_12_name__icontains=hu_12_name)
        
        if watersheds.exists():
            serializer = WatershedsGeoJSONSerializer(watersheds, many=True)
            return Response({
                'status': 'success',
                'data': serializer.data,
                'count': watersheds.count(),
                'message': f'Found {watersheds.count()} watersheds matching HUC-12 name: {hu_12_name}'
            })
        else:
            return Response({
                'status': 'not_found',
                'data': [],
                'count': 0,
                'message': f'No watersheds found matching HUC-12 name: {hu_12_name}'
            }, status=status.HTTP_404_NOT_FOUND)
            
    except Exception as e:
        logger.error(f"Error finding watersheds by HUC-12 name: {str(e)}")
        return Response(
            {'error': 'Internal server error occurred while finding watersheds by HUC-12 name'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
def autocomplete_basin_names(request):
    """
    Get autocomplete suggestions for basin names.
    
    Query parameter:
    - q: Search query (case-insensitive)
    
    Returns list of unique basin names matching the query.
    """
    try:
        query = request.GET.get('q', '').strip()
        
        if len(query) < 2:
            return Response({
                'status': 'success',
                'data': [],
                'message': 'Query too short. Enter at least 2 characters.'
            })
        
        # Get unique basin names that contain the query
        basin_names = Watersheds.objects.filter(
            dwq_basin__icontains=query
        ).values_list('dwq_basin', flat=True).distinct().order_by('dwq_basin')
        
        # Convert to list and filter out None values
        suggestions = [name for name in basin_names if name]
        
        return Response({
            'status': 'success',
            'data': suggestions[:10],  # Limit to 10 suggestions
            'count': len(suggestions),
            'message': f'Found {len(suggestions)} basin names matching "{query}"'
        })
        
    except Exception as e:
        logger.error(f"Error in basin autocomplete: {str(e)}")
        return Response(
            {'error': 'Internal server error occurred during basin autocomplete'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
def autocomplete_hu12_names(request):
    """
    Get autocomplete suggestions for HUC-12 names.
    
    Query parameter:
    - q: Search query (case-insensitive)
    
    Returns list of unique HUC-12 names matching the query.
    """
    try:
        query = request.GET.get('q', '').strip()
        
        if len(query) < 2:
            return Response({
                'status': 'success',
                'data': [],
                'message': 'Query too short. Enter at least 2 characters.'
            })
        
        # Get unique HUC-12 names that contain the query
        hu12_names = Watersheds.objects.filter(
            hu_12_name__icontains=query
        ).values_list('hu_12_name', flat=True).distinct().order_by('hu_12_name')
        
        # Convert to list and filter out None values
        suggestions = [name for name in hu12_names if name]
        
        return Response({
            'status': 'success',
            'data': suggestions[:10],  # Limit to 10 suggestions
            'count': len(suggestions),
            'message': f'Found {len(suggestions)} HUC-12 names matching "{query}"'
        })
        
    except Exception as e:
        logger.error(f"Error in HUC-12 name autocomplete: {str(e)}")
        return Response(
            {'error': 'Internal server error occurred during HUC-12 name autocomplete'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
