// Coordinate transformation utilities
const transformCoordinates = (coords) => {
    if (!coords || !Array.isArray(coords)) return coords;
    
    const transformPoint = (point) => {
      if (!Array.isArray(point) || point.length < 2) return point;
      
      const [x, y] = point;
      
      // Check if coordinates look like Web Mercator (large numbers)
      // Web Mercator coordinates are typically in the range of -20037508 to +20037508
      if (Math.abs(x) > 100000 || Math.abs(y) > 100000) {
        // Transform from Web Mercator (EPSG:3857) to WGS84 (EPSG:4326)
        const lon = (x / 20037508.34) * 180;
        const lat = (Math.atan(Math.exp((y / 20037508.34) * Math.PI)) / (Math.PI / 4) - 1) * 90;
        return [lon, lat];
      }
      
      return point;
    };
    
    const transformCoordArray = (coordArray) => {
      if (!Array.isArray(coordArray)) return coordArray;
      
      // Check if this is a point coordinate [x, y]
      if (coordArray.length === 2 && typeof coordArray[0] === 'number' && typeof coordArray[1] === 'number') {
        return transformPoint(coordArray);
      }
      
      // Recursively transform nested arrays
      return coordArray.map(item => transformCoordArray(item));
    };
    
    return transformCoordArray(coords);
  };
  
  const transformGeoJSONData = (data) => {
    if (!data) return data;
    
    if (data.type === 'Feature') {
      return {
        ...data,
        geometry: {
          ...data.geometry,
          coordinates: transformCoordinates(data.geometry.coordinates)
        }
      };
    } else if (data.type === 'FeatureCollection') {
      return {
        ...data,
        features: data.features.map(feature => transformGeoJSONData(feature))
      };
    }
    
    return data;
  };

  export { transformGeoJSONData };