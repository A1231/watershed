from rest_framework import serializers
from .models import Watersheds
from rest_framework_gis.serializers import GeoFeatureModelSerializer


class WatershedsGeoJSONSerializer(GeoFeatureModelSerializer):
    """
    Serializer for Watersheds model that returns GeoJSON format.
    Use this for map visualization and GIS applications.
    """
    class Meta:
        model = Watersheds
        geo_field = "geom"   # This field will be converted to GeoJSON geometry
        fields = [
            'id', 'objectid1', 'huc_8', 'huc_10', 'huc_12', 
            'acres', 'hu_10_name', 'hu_12_name', 'basin', 
            'dwq_basin', 'population', 'shape_area', 'shape_length',
            'pop_2010', 'pop_2000', 'area', 'pop_chg_10_20', 
            'pop_chg_00_10', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']



