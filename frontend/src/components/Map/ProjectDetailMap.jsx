import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { scalePolygon, generateSyntheticPolygon } from '../../utils/polygonGenerator'

mapboxgl.accessToken =
  import.meta.env.VITE_MAPBOX_TOKEN ||
  'pk.eyJ1IjoiYmlvbWEtbWFwIiwiYSI6ImNtNWRlZjBkZjBhcWYya3M3NzVhZDJhZWYifQ.placeholder'

/**
 * Get the center coordinates from a project
 * Priority: centerLng/centerLat > workZone geometry centroid
 */
const getProjectCenter = (project) => {
  // First try direct center coordinates
  if (project.centerLng != null && project.centerLat != null) {
    return [project.centerLng, project.centerLat]
  }
  
  // Fall back to workZone centroid
  if (project.workZone?.geometry?.coordinates?.[0]) {
    const coords = project.workZone.geometry.coordinates[0]
    if (coords.length > 0) {
      let sumLng = 0, sumLat = 0
      const count = coords.length - 1 // Exclude closing point
      for (let i = 0; i < count; i++) {
        sumLng += coords[i][0]
        sumLat += coords[i][1]
      }
      return [sumLng / count, sumLat / count]
    }
  }
  
  // Default fallback (should not reach here)
  return [-99.1332, 19.4326]
}

/**
 * Ensure the work zone polygon exists for the project
 * If project doesn't have a workZone, generate a synthetic one
 */
const ensureWorkZone = (project) => {
  if (project.workZone?.geometry?.coordinates?.[0]?.length > 0) {
    return project.workZone
  }
  
  // Generate synthetic polygon if we have coordinates
  if (project.centerLng != null && project.centerLat != null) {
    const polygon = generateSyntheticPolygon(
      project.id,
      project.centerLng,
      project.centerLat,
      project.area || 100
    )
    polygon.properties = {
      name: project.name,
      compliance: project.compliance || project.riskState || 'unknown'
    }
    return polygon
  }
  
  return null
}

const ProjectDetailMap = ({ project }) => {
  const mapContainer = useRef(null)
  const mapRef = useRef(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const prevProjectId = useRef(null)

  // Clean up and recreate map when project changes
  useEffect(() => {
    // If project changed, destroy old map
    if (prevProjectId.current && prevProjectId.current !== project?.id) {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
        setMapLoaded(false)
      }
    }
    prevProjectId.current = project?.id

    // Don't create map if no project or map already exists
    if (!project || mapRef.current) return

    // Get center from project
    const center = getProjectCenter(project)
    
    console.log('Creating map for project:', project.name, 'at center:', center)

    mapRef.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: center,
      zoom: 14 // Start with a closer zoom
    })

    mapRef.current.addControl(new mapboxgl.NavigationControl(), 'top-right')
    
    mapRef.current.on('load', () => {
      console.log('Map loaded for project:', project.name)
      setMapLoaded(true)
    })

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [project?.id])

  // Add polygon layers when map is loaded
  useEffect(() => {
    if (!mapLoaded || !project || !mapRef.current) {
      console.log('Skipping layer setup - mapLoaded:', mapLoaded, 'project:', !!project)
      return
    }

    const mapInstance = mapRef.current
    
    // Get or generate workZone
    const workZone = ensureWorkZone(project)
    if (!workZone) {
      console.warn('No workZone available for project:', project.name)
      return
    }

    console.log('Adding polygon layers for project:', project.name)
    console.log('WorkZone coordinates:', workZone.geometry?.coordinates?.[0]?.length, 'points')

    // Create buffer zones - preserves irregular shape
    const bufferYellow = scalePolygon(workZone, 1.1) // 10% expansion
    const bufferRed = scalePolygon(workZone, 1.2)    // 20% expansion
    
    if (!bufferYellow || !bufferRed) {
      console.warn('Could not create buffer zones')
      return
    }

    // Helper to add or update source
    const setSource = (id, data) => {
      const source = mapInstance.getSource(id)
      if (source) {
        source.setData(data)
      } else {
        mapInstance.addSource(id, { type: 'geojson', data })
      }
    }

    // Add sources
    setSource('buffer-red', bufferRed)
    setSource('buffer-yellow', bufferYellow)
    setSource('workzone', workZone)

    // Add layers in order (red first so it's behind)
    // Red buffer layer (outermost - danger zone)
    if (!mapInstance.getLayer('buffer-red-fill')) {
      mapInstance.addLayer({
        id: 'buffer-red-fill',
        type: 'fill',
        source: 'buffer-red',
        paint: {
          'fill-color': '#e74c3c',
          'fill-opacity': 0.3
        }
      })
      mapInstance.addLayer({
        id: 'buffer-red-outline',
        type: 'line',
        source: 'buffer-red',
        paint: {
          'line-color': '#c0392b',
          'line-width': 2,
          'line-dasharray': [4, 2]
        }
      })
    }

    // Yellow buffer layer (warning zone)
    if (!mapInstance.getLayer('buffer-yellow-fill')) {
      mapInstance.addLayer({
        id: 'buffer-yellow-fill',
        type: 'fill',
        source: 'buffer-yellow',
        paint: {
          'fill-color': '#f39c12',
          'fill-opacity': 0.4
        }
      })
      mapInstance.addLayer({
        id: 'buffer-yellow-outline',
        type: 'line',
        source: 'buffer-yellow',
        paint: {
          'line-color': '#d68910',
          'line-width': 2,
          'line-dasharray': [3, 2]
        }
      })
    }

    // Green work zone layer (base - construction footprint)
    if (!mapInstance.getLayer('workzone-fill')) {
      mapInstance.addLayer({
        id: 'workzone-fill',
        type: 'fill',
        source: 'workzone',
        paint: {
          'fill-color': '#27ae60',
          'fill-opacity': 0.6
        }
      })
    }

    if (!mapInstance.getLayer('workzone-outline')) {
      mapInstance.addLayer({
        id: 'workzone-outline',
        type: 'line',
        source: 'workzone',
        paint: {
          'line-color': '#1e8449',
          'line-width': 3
        }
      })
    }

    // Fit map bounds to show the full polygon with buffers
    const redCoords = bufferRed.geometry.coordinates[0]
    if (redCoords && redCoords.length > 0) {
      const bounds = new mapboxgl.LngLatBounds()
      redCoords.forEach(coord => bounds.extend(coord))
      
      mapInstance.fitBounds(bounds, { 
        padding: 60, 
        duration: 1000,
        maxZoom: 16
      })
      
      console.log('Fitted bounds to polygon')
    }

  }, [mapLoaded, project])

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={mapContainer} className="project-detail-mapbox" />
      
      {/* Legend */}
      <div style={{
        position: 'absolute',
        bottom: '1rem',
        left: '1rem',
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '8px',
        padding: '0.75rem 1rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        fontSize: '0.8rem',
        zIndex: 10
      }}>
        <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#2c3e50' }}>
          Zonas de Monitoreo
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ 
              width: '16px', 
              height: '12px', 
              background: '#27ae60', 
              border: '2px solid #1e8449',
              borderRadius: '2px'
            }} />
            <span style={{ color: '#34495e' }}>Zona de Obra (Base)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ 
              width: '16px', 
              height: '12px', 
              background: '#f39c12', 
              border: '2px dashed #d68910',
              borderRadius: '2px'
            }} />
            <span style={{ color: '#34495e' }}>Buffer Amarillo (+10%)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ 
              width: '16px', 
              height: '12px', 
              background: '#e74c3c', 
              border: '2px dashed #c0392b',
              borderRadius: '2px'
            }} />
            <span style={{ color: '#34495e' }}>Buffer Rojo (+20%)</span>
          </div>
        </div>
      </div>

      {/* Project location indicator */}
      {project && (
        <div style={{
          position: 'absolute',
          top: '1rem',
          left: '1rem',
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '8px',
          padding: '0.5rem 0.75rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          fontSize: '0.75rem',
          zIndex: 10,
          maxWidth: '200px'
        }}>
          <div style={{ fontWeight: '600', color: '#2c3e50', marginBottom: '0.25rem' }}>
            📍 {project.state || 'México'}
          </div>
          <div style={{ color: '#7f8c8d', fontSize: '0.7rem' }}>
            {project.centerLat?.toFixed(4)}°N, {Math.abs(project.centerLng || 0).toFixed(4)}°W
          </div>
        </div>
      )}
    </div>
  )
}

export default ProjectDetailMap
