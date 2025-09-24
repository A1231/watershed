from django.db import models
from django.contrib.gis.db import models as gis_models

# Create your models here.
class Watersheds(models.Model):
    """
    Model representing watershed data from Supabase.
    This model mirrors the structure of the watersheds table in Supabase.
    """
    id = models.BigIntegerField(primary_key=True)
    objectid1 = models.IntegerField(null=True, blank=True)
    huc_8 = models.CharField(max_length=255, null=True, blank=True)
    huc_10 = models.CharField(max_length=255, null=True, blank=True)
    huc_12 = models.CharField(max_length=255, null=True, blank=True)
    acres = models.DecimalField(max_digits=20, decimal_places=10, null=True, blank=True)
    hu_10_name = models.CharField(max_length=255, null=True, blank=True)
    hu_12_name = models.CharField(max_length=255, null=True, blank=True)
    basin = models.CharField(max_length=255, null=True, blank=True)
    dwq_basin = models.CharField(max_length=255, null=True, blank=True)
    population = models.IntegerField(null=True, blank=True)
    shape_area = models.FloatField(null=True, blank=True)
    shape_length = models.FloatField(null=True, blank=True)
    pop_2010 = models.IntegerField(null=True, blank=True)
    pop_2000 = models.IntegerField(null=True, blank=True)
    area = models.DecimalField(max_digits=20, decimal_places=10, null=True, blank=True)
    pop_chg_10_20 = models.IntegerField(null=True, blank=True)
    pop_chg_00_10 = models.IntegerField(null=True, blank=True)
    geom = gis_models.GeometryField(null=True, blank=True)
    created_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'watersheds'
        managed = False  # Since we're using Supabase, we don't want Django to manage this table

    def __str__(self):
        return f"Watershed {self.huc_12} - {self.hu_12_name or 'Unnamed'}"
