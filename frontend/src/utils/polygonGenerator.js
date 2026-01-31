/**
 * Synthetic Polygon Generator
 * 
 * Generates irregular polygons that simulate real construction footprints.
 * Uses seeded random for deterministic output based on project ID.
 */

// Seeded random number generator (Mulberry32)
function createSeededRandom(seed) {
  let state = seed;
  return function() {
    state = (state + 0x6D2B79F5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Convert string to numeric seed
function stringToSeed(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Generate a synthetic irregular polygon for a construction project
 * 
 * @param {string} projectId - Unique project identifier (for seed)
 * @param {number} centerLng - Center longitude
 * @param {number} centerLat - Center latitude
 * @param {number} areaHectares - Approximate area in hectares
 * @returns {Object} GeoJSON Feature with Polygon geometry
 */
export function generateSyntheticPolygon(projectId, centerLng, centerLat, areaHectares = 100) {
  const seed = stringToSeed(projectId);
  const random = createSeededRandom(seed);
  
  // Calculate approximate radius from area (in degrees, rough approximation)
  // 1 degree ≈ 111km at equator, 1 hectare = 0.01 km²
  // Approximate radius in degrees for given area
  const areaKm2 = areaHectares * 0.01;
  const radiusKm = Math.sqrt(areaKm2 / Math.PI);
  const baseRadiusLng = radiusKm / 111; // longitude degrees
  const baseRadiusLat = radiusKm / 111; // latitude degrees (simplified)
  
  // Scale factor to make polygons visible on map (multiply by factor for visibility)
  const scaleFactor = 2.5 + random() * 1.5;
  const radiusLng = baseRadiusLng * scaleFactor;
  const radiusLat = baseRadiusLat * scaleFactor;
  
  // Number of vertices (6-12)
  const numVertices = Math.floor(random() * 7) + 6;
  
  // Generate base shape type (affects overall polygon character)
  const shapeType = random();
  let aspectRatio, elongationAngle;
  
  if (shapeType < 0.35) {
    // Elongated shape (like highways, pipelines)
    aspectRatio = 2.5 + random() * 2;
    elongationAngle = random() * Math.PI;
  } else if (shapeType < 0.65) {
    // L-shaped or irregular industrial
    aspectRatio = 1.3 + random() * 0.5;
    elongationAngle = random() * Math.PI * 2;
  } else {
    // More compact but still irregular
    aspectRatio = 1.1 + random() * 0.3;
    elongationAngle = random() * Math.PI * 2;
  }
  
  // Global rotation angle (slight tilt, not aligned to axes)
  const rotationAngle = (random() - 0.5) * Math.PI * 0.4; // ±36 degrees max
  
  // Generate vertices
  const vertices = [];
  const angleStep = (2 * Math.PI) / numVertices;
  
  for (let i = 0; i < numVertices; i++) {
    // Base angle for this vertex
    const baseAngle = i * angleStep;
    
    // Add angular variation (±15% of step)
    const angleVariation = (random() - 0.5) * angleStep * 0.3;
    const angle = baseAngle + angleVariation;
    
    // Calculate radius with variation
    const radiusVariation = 0.7 + random() * 0.6; // 70% to 130% of base radius
    
    // Apply aspect ratio based on angle relative to elongation
    const elongationFactor = Math.abs(Math.cos(angle - elongationAngle));
    const aspectFactor = 1 + (aspectRatio - 1) * elongationFactor;
    
    // Calculate position before rotation
    const r = radiusVariation;
    const x = r * Math.cos(angle) * radiusLng * aspectFactor;
    const y = r * Math.sin(angle) * radiusLat;
    
    // Apply rotation
    const rotatedX = x * Math.cos(rotationAngle) - y * Math.sin(rotationAngle);
    const rotatedY = x * Math.sin(rotationAngle) + y * Math.cos(rotationAngle);
    
    // Final coordinates
    const lng = centerLng + rotatedX;
    const lat = centerLat + rotatedY;
    
    vertices.push([lng, lat]);
  }
  
  // Add some "indentations" to make it look more like a real construction footprint
  // This simulates access roads, setbacks, or partial construction areas
  const finalVertices = addIndentations(vertices, random, numVertices);
  
  // Close the polygon (first point = last point)
  finalVertices.push([...finalVertices[0]]);
  
  return {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [finalVertices]
    },
    properties: {}
  };
}

/**
 * Add natural indentations to make the polygon look more realistic
 */
function addIndentations(vertices, random, originalCount) {
  const result = [];
  const numIndentations = Math.floor(random() * 3); // 0-2 indentations
  const indentationPositions = new Set();
  
  // Choose random positions for indentations
  for (let i = 0; i < numIndentations; i++) {
    indentationPositions.add(Math.floor(random() * originalCount));
  }
  
  for (let i = 0; i < vertices.length; i++) {
    const current = vertices[i];
    const next = vertices[(i + 1) % vertices.length];
    
    result.push(current);
    
    // Add indentation point between current and next
    if (indentationPositions.has(i)) {
      const midLng = (current[0] + next[0]) / 2;
      const midLat = (current[1] + next[1]) / 2;
      
      // Calculate perpendicular direction
      const dx = next[0] - current[0];
      const dy = next[1] - current[1];
      const len = Math.sqrt(dx * dx + dy * dy);
      
      if (len > 0) {
        // Perpendicular unit vector
        const perpX = -dy / len;
        const perpY = dx / len;
        
        // Indentation depth (inward)
        const depth = len * (0.15 + random() * 0.2);
        const direction = random() > 0.5 ? 1 : -1;
        
        const indentLng = midLng + perpX * depth * direction;
        const indentLat = midLat + perpY * depth * direction;
        
        result.push([indentLng, indentLat]);
      }
    }
  }
  
  return result;
}

/**
 * Scale a polygon from its centroid by a given factor
 * Preserves the original shape while expanding/contracting
 * 
 * @param {Object} feature - GeoJSON Feature with Polygon geometry
 * @param {number} scale - Scale factor (1.1 = 10% expansion)
 * @returns {Object} Scaled GeoJSON Feature
 */
export function scalePolygon(feature, scale) {
  const coordinates = feature.geometry.coordinates[0];
  if (!coordinates || coordinates.length < 3) return null;
  
  // Calculate centroid
  let centroidLng = 0;
  let centroidLat = 0;
  const n = coordinates.length - 1; // Exclude closing point
  
  for (let i = 0; i < n; i++) {
    centroidLng += coordinates[i][0];
    centroidLat += coordinates[i][1];
  }
  centroidLng /= n;
  centroidLat /= n;
  
  // Scale each point from centroid
  const scaledCoordinates = coordinates.map(([lng, lat]) => [
    centroidLng + (lng - centroidLng) * scale,
    centroidLat + (lat - centroidLat) * scale
  ]);
  
  return {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [scaledCoordinates]
    },
    properties: feature.properties || {}
  };
}

/**
 * Get center coordinates from a polygon feature
 * 
 * @param {Object} feature - GeoJSON Feature with Polygon geometry
 * @returns {Object} { lng, lat }
 */
export function getPolygonCenter(feature) {
  const coordinates = feature.geometry.coordinates[0];
  if (!coordinates || coordinates.length < 3) return null;
  
  let centroidLng = 0;
  let centroidLat = 0;
  const n = coordinates.length - 1;
  
  for (let i = 0; i < n; i++) {
    centroidLng += coordinates[i][0];
    centroidLat += coordinates[i][1];
  }
  
  return {
    lng: centroidLng / n,
    lat: centroidLat / n
  };
}

/**
 * Generate a complete work zone with buffer zones
 * 
 * @param {string} projectId - Unique project identifier
 * @param {number} centerLng - Center longitude
 * @param {number} centerLat - Center latitude
 * @param {number} areaHectares - Approximate area in hectares
 * @returns {Object} { workZone, yellowBuffer, redBuffer }
 */
export function generateWorkZoneWithBuffers(projectId, centerLng, centerLat, areaHectares) {
  const workZone = generateSyntheticPolygon(projectId, centerLng, centerLat, areaHectares);
  const yellowBuffer = scalePolygon(workZone, 1.1); // 10% expansion
  const redBuffer = scalePolygon(workZone, 1.2);    // 20% expansion (additional 10%)
  
  return {
    workZone,
    yellowBuffer,
    redBuffer
  };
}

export default {
  generateSyntheticPolygon,
  scalePolygon,
  getPolygonCenter,
  generateWorkZoneWithBuffers
};

