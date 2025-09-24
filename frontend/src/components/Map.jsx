import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, useMap, GeoJSON } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { transformGeoJSONData } from '../utils/transform'

// Fix for default markers in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// North Carolina center coordinates
const NC_CENTER = [35.7596, -79.0193]
const NC_ZOOM = 7

// Component to handle map events and fit bounds
const MapEvents = ({ watershedData }) => {
  const map = useMap()

  useEffect(() => {
    const handleMapClick = (e) => {
      const { lat, lng } = e.latlng
      console.log(`Map clicked at: ${lat}, ${lng}`)
      
      // Show coordinates in a popup
      L.popup()
        .setLatLng([lat, lng])
        .setContent(`
          <div style="color: #1a1a1a;">
            <h3 style="margin: 0 0 8px 0; color: #1d4ed8;">Location Selected</h3>
            <p style="margin: 0 0 4px 0;"><strong>Latitude:</strong> ${lat.toFixed(6)}</p>
            <p style="margin: 0;"><strong>Longitude:</strong> ${lng.toFixed(6)}</p>
          </div>
        `)
        .openOn(map)
    }

    map.on('click', handleMapClick)

    return () => {
      map.off('click', handleMapClick)
    }
  }, [map])

  useEffect(() => {
    if (watershedData && map) {
      let bounds;
      if (watershedData.type === 'Feature' || watershedData.type === 'FeatureCollection') {
        bounds = L.geoJSON(transformGeoJSONData(watershedData)).getBounds();
      }
      if (bounds && bounds.isValid()) {
        // Calculate what zoom level would be needed to fit the bounds
        const boundsZoom = map.getBoundsZoom(bounds);
        
        // Only auto-zoom if the watershed is reasonably sized
        // This prevents excessive zoom-out for very large watersheds
        if (boundsZoom >= 10) {
          map.fitBounds(bounds, { 
            padding: [50, 50],
            maxZoom: Math.max(boundsZoom, 10) // Don't zoom out beyond level 10
          });
        }
        // For large watersheds (boundsZoom < 10), don't auto-zoom
      }
    }
  }, [watershedData, map]);
  

  
  return null
}

const Map = ({ watershedData }) => {
  const [mapLoaded, setMapLoaded] = useState(false)


  return (
    <div className="map-container">
      <MapContainer
        center={NC_CENTER}
        zoom={NC_ZOOM}
        style={{ height: '100%', width: '100%' }}
        whenReady={() => {
          setMapLoaded(true)
          console.log('Map loaded successfully')
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapEvents watershedData={watershedData} />

        {watershedData && (
          <GeoJSON
            key={JSON.stringify(watershedData)}
            data={transformGeoJSONData(watershedData)}
            style={{
              color: '#1d4ed8',      // blue border
              weight: 2,
              fillColor: '#3b82f6',  // blue fill
              fillOpacity: 0.3
            }}
            onEachFeature={(feature, layer) => {
              if (feature.properties) {
                layer.bindPopup(`
                  <h3>${feature.properties.hu_12_name || 'Watershed'}</h3>
                  <p><strong>HUC-12:</strong> ${feature.properties.huc_12 || 'N/A'}</p>
                  <p><strong>Basin:</strong> ${feature.properties.basin || 'N/A'}</p>
                `);
              }
            }}
          />
        )}
       
      </MapContainer>
      
      {!mapLoaded && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '8px',
          zIndex: 1000
        }}>
          Loading map...
        </div>
      )}
    </div>
  )
}

export default Map
