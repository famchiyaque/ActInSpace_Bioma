import { useEffect, useRef, useState, useCallback } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { scalePolygon, generateSyntheticPolygon } from '../../utils/polygonGenerator'
import { 
  predictRisk, 
  generateProjectedPolygon, 
  getRiskColorHex,
  generateRiskTimeline,
  WORK_TYPES
} from '../../utils/riskModel'

mapboxgl.accessToken =
  import.meta.env.VITE_MAPBOX_TOKEN ||
  'pk.eyJ1IjoiYmlvbWEtbWFwIiwiYSI6ImNtNWRlZjBkZjBhcWYya3M3NzVhZDJhZWYifQ.placeholder'

/**
 * Get the center coordinates from a project
 */
const getProjectCenter = (project) => {
  if (project.centerLng != null && project.centerLat != null) {
    return [project.centerLng, project.centerLat]
  }
  
  if (project.workZone?.geometry?.coordinates?.[0]) {
    const coords = project.workZone.geometry.coordinates[0]
    if (coords.length > 0) {
      let sumLng = 0, sumLat = 0
      const count = coords.length - 1
      for (let i = 0; i < count; i++) {
        sumLng += coords[i][0]
        sumLat += coords[i][1]
      }
      return [sumLng / count, sumLat / count]
    }
  }
  
  return [-99.1332, 19.4326]
}

/**
 * Ensure the work zone polygon exists for the project
 */
const ensureWorkZone = (project) => {
  if (project.workZone?.geometry?.coordinates?.[0]?.length > 0) {
    return project.workZone
  }
  
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

// Risk level icons
const riskIcons = {
  low: '✅',
  medium: '⚠️',
  high: '🔶',
  critical: '🚨'
}

// Custom hook for detecting mobile
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  return isMobile
}

const ProjectDetailMap = ({ project }) => {
  const mapContainer = useRef(null)
  const mapRef = useRef(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const prevProjectId = useRef(null)
  const isMobile = useIsMobile()
  
  // Risk prediction state
  const [daysFuture, setDaysFuture] = useState(0)
  const [prediction, setPrediction] = useState(null)
  const [showVariables, setShowVariables] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const playIntervalRef = useRef(null)
  
  // Mobile panel states
  const [showAIPanel, setShowAIPanel] = useState(false)
  const [showLegend, setShowLegend] = useState(false)
  const [showLocation, setShowLocation] = useState(false)

  // Calculate prediction when days change
  useEffect(() => {
    if (project) {
      const newPrediction = predictRisk(project, daysFuture)
      setPrediction(newPrediction)
    }
  }, [project, daysFuture])

  // Auto-play animation
  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = setInterval(() => {
        setDaysFuture(prev => {
          if (prev >= 180) {
            setIsPlaying(false)
            return 0
          }
          return prev + 5
        })
      }, 100)
    } else {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current)
      }
    }
    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current)
      }
    }
  }, [isPlaying])

  // Create map when project changes
  useEffect(() => {
    if (prevProjectId.current && prevProjectId.current !== project?.id) {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
        setMapLoaded(false)
      }
      setDaysFuture(0)
    }
    prevProjectId.current = project?.id

    if (!project || mapRef.current) return

    const center = getProjectCenter(project)
    
    mapRef.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: center,
      zoom: 14
    })

    mapRef.current.addControl(new mapboxgl.NavigationControl(), 'top-right')
    
    mapRef.current.on('load', () => {
      setMapLoaded(true)
    })

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [project?.id])

  // Update polygon layers based on prediction
  const updatePolygonLayers = useCallback(() => {
    if (!mapLoaded || !project || !mapRef.current || !prediction) return

    const mapInstance = mapRef.current
    const workZone = ensureWorkZone(project)
    if (!workZone) return

    const baseCoords = workZone.geometry.coordinates[0]
    
    // Generate projected polygon based on expansion factor
    const projectedCoords = generateProjectedPolygon(
      baseCoords, 
      prediction.expansionFactor, 
      project
    )
    
    // Create GeoJSON features
    const projectedPolygon = {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [projectedCoords]
      },
      properties: { type: 'projected' }
    }

    // Create buffer zones from base
    const bufferYellow = scalePolygon(workZone, 1.1)
    const bufferRed = scalePolygon(workZone, 1.2)

    // Determine colors based on risk
    const riskColor = getRiskColorHex(prediction.riskScore)
    const projectedOpacity = 0.3 + (prediction.riskScore / 100) * 0.3

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
    setSource('projected', projectedPolygon)
    setSource('buffer-red', bufferRed)
    setSource('buffer-yellow', bufferYellow)
    setSource('workzone', workZone)

    // Add layers in order (back to front)
    if (!mapInstance.getLayer('projected-fill')) {
      mapInstance.addLayer({
        id: 'projected-fill',
        type: 'fill',
        source: 'projected',
        paint: {
          'fill-color': riskColor,
          'fill-opacity': projectedOpacity
        }
      })
      mapInstance.addLayer({
        id: 'projected-outline',
        type: 'line',
        source: 'projected',
        paint: {
          'line-color': riskColor,
          'line-width': 3,
          'line-dasharray': [5, 3]
        }
      })
    } else {
      mapInstance.setPaintProperty('projected-fill', 'fill-color', riskColor)
      mapInstance.setPaintProperty('projected-fill', 'fill-opacity', projectedOpacity)
      mapInstance.setPaintProperty('projected-outline', 'line-color', riskColor)
    }

    if (!mapInstance.getLayer('buffer-red-fill')) {
      mapInstance.addLayer({
        id: 'buffer-red-fill',
        type: 'fill',
        source: 'buffer-red',
        paint: { 'fill-color': '#e74c3c', 'fill-opacity': 0.15 }
      })
      mapInstance.addLayer({
        id: 'buffer-red-outline',
        type: 'line',
        source: 'buffer-red',
        paint: { 'line-color': '#c0392b', 'line-width': 2, 'line-dasharray': [4, 2] }
      })
    }

    if (!mapInstance.getLayer('buffer-yellow-fill')) {
      mapInstance.addLayer({
        id: 'buffer-yellow-fill',
        type: 'fill',
        source: 'buffer-yellow',
        paint: { 'fill-color': '#f39c12', 'fill-opacity': 0.2 }
      })
      mapInstance.addLayer({
        id: 'buffer-yellow-outline',
        type: 'line',
        source: 'buffer-yellow',
        paint: { 'line-color': '#d68910', 'line-width': 2, 'line-dasharray': [3, 2] }
      })
    }

    if (!mapInstance.getLayer('workzone-fill')) {
      mapInstance.addLayer({
        id: 'workzone-fill',
        type: 'fill',
        source: 'workzone',
        paint: { 'fill-color': '#27ae60', 'fill-opacity': 0.5 }
      })
      mapInstance.addLayer({
        id: 'workzone-outline',
        type: 'line',
        source: 'workzone',
        paint: { 'line-color': '#1e8449', 'line-width': 3 }
      })
    }

    // Fit bounds on initial load
    if (daysFuture === 0) {
      const allCoords = [...baseCoords, ...projectedCoords]
      const bounds = new mapboxgl.LngLatBounds()
      allCoords.forEach(coord => bounds.extend(coord))
      mapInstance.fitBounds(bounds, { padding: isMobile ? 40 : 80, duration: 1000, maxZoom: 16 })
    }

  }, [mapLoaded, project, prediction, daysFuture, isMobile])

  useEffect(() => {
    updatePolygonLayers()
  }, [updatePolygonLayers])

  const formatNumber = (num, decimals = 1) => {
    if (num === undefined || num === null) return '-'
    return Number(num).toFixed(decimals)
  }

  // Shared styles
  const panelStyle = {
    background: 'linear-gradient(135deg, rgba(44, 62, 80, 0.98) 0%, rgba(52, 73, 94, 0.98) 100%)',
    borderRadius: '12px',
    padding: isMobile ? '0.75rem' : '1rem',
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
    color: 'white',
    zIndex: 10,
    backdropFilter: 'blur(10px)'
  }

  const floatingButtonStyle = {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    border: 'none',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.2rem',
    transition: 'transform 0.2s, box-shadow 0.2s',
    zIndex: 10
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={mapContainer} className="project-detail-mapbox" />
      
      {/* Mobile: Floating Action Buttons */}
      {isMobile && prediction && (
        <div style={{
          position: 'absolute',
          bottom: '1rem',
          right: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          zIndex: 20
        }}>
          {/* AI Panel Toggle */}
          <button
            onClick={() => { setShowAIPanel(!showAIPanel); setShowLegend(false); setShowLocation(false); }}
            style={{
              ...floatingButtonStyle,
              background: showAIPanel ? prediction.riskLevel.color : 'white',
              color: showAIPanel ? 'white' : prediction.riskLevel.color
            }}
            title="Modelo IA"
          >
            🤖
          </button>
          
          {/* Legend Toggle */}
          <button
            onClick={() => { setShowLegend(!showLegend); setShowAIPanel(false); setShowLocation(false); }}
            style={{
              ...floatingButtonStyle,
              background: showLegend ? '#2c3e50' : 'white',
              color: showLegend ? 'white' : '#2c3e50'
            }}
            title="Leyenda"
          >
            🗺️
          </button>
          
          {/* Location Toggle */}
          <button
            onClick={() => { setShowLocation(!showLocation); setShowAIPanel(false); setShowLegend(false); }}
            style={{
              ...floatingButtonStyle,
              background: showLocation ? '#3498db' : 'white',
              color: showLocation ? 'white' : '#3498db'
            }}
            title="Ubicación"
          >
            📍
          </button>
        </div>
      )}

      {/* Mobile: Compact Risk Indicator (always visible) */}
      {isMobile && prediction && !showAIPanel && (
        <div 
          onClick={() => setShowAIPanel(true)}
          style={{
            position: 'absolute',
            top: '0.5rem',
            left: '0.5rem',
            background: prediction.riskLevel.color,
            borderRadius: '20px',
            padding: '0.4rem 0.75rem',
            color: 'white',
            fontSize: '0.8rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            cursor: 'pointer',
            zIndex: 10
          }}
        >
          <span>{riskIcons[prediction.riskLevel.level]}</span>
          <span>{prediction.riskScore}</span>
        </div>
      )}

      {/* Mobile: AI Panel (Full Screen Modal) */}
      {isMobile && showAIPanel && prediction && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 30,
          display: 'flex',
          alignItems: 'flex-end'
        }} onClick={() => setShowAIPanel(false)}>
          <div 
            style={{
              ...panelStyle,
              width: '100%',
              maxHeight: '70vh',
              overflowY: 'auto',
              borderRadius: '16px 16px 0 0',
              padding: '1rem'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>🤖 Modelo Predictivo IA</span>
              <button 
                onClick={() => setShowAIPanel(false)}
                style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}
              >×</button>
            </div>

            {/* Risk Score */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: `conic-gradient(${prediction.riskLevel.color} ${prediction.riskScore * 3.6}deg, rgba(255,255,255,0.1) 0deg)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  background: 'rgba(44, 62, 80, 0.95)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{ fontSize: '1.3rem', fontWeight: '700', color: prediction.riskLevel.color }}>
                    {prediction.riskScore}
                  </span>
                </div>
              </div>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: '600', color: prediction.riskLevel.color }}>
                  Riesgo {prediction.riskLevel.label}
                </div>
                <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>
                  Tipo: {prediction.workType.name} · Expansión: +{((prediction.expansionFactor - 1) * 100).toFixed(0)}%
                </div>
              </div>
            </div>

            {/* Time Slider */}
            <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem' }}>📅 Proyección</span>
                <span style={{ fontWeight: '600', color: prediction.riskLevel.color }}>+{daysFuture} días</span>
              </div>
              <input
                type="range"
                min="0"
                max="180"
                value={daysFuture}
                onChange={(e) => setDaysFuture(parseInt(e.target.value))}
                style={{
                  width: '100%',
                  height: '8px',
                  borderRadius: '4px',
                  appearance: 'none',
                  background: 'linear-gradient(to right, #27ae60 0%, #f39c12 50%, #e74c3c 100%)',
                  cursor: 'pointer'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', opacity: 0.6, marginTop: '0.25rem' }}>
                <span>Hoy</span>
                <span>90d</span>
                <span>180d</span>
              </div>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                style={{
                  width: '100%',
                  marginTop: '0.5rem',
                  padding: '0.6rem',
                  background: isPlaying ? 'rgba(231, 76, 60, 0.3)' : 'rgba(39, 174, 96, 0.3)',
                  border: `1px solid ${isPlaying ? '#e74c3c' : '#27ae60'}`,
                  borderRadius: '6px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: '500'
                }}
              >
                {isPlaying ? '⏸️ Pausar' : '▶️ Simular'}
              </button>
            </div>

            {/* Variables Toggle */}
            <button
              onClick={() => setShowVariables(!showVariables)}
              style={{
                width: '100%',
                padding: '0.5rem',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '6px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '0.75rem'
              }}
            >
              {showVariables ? '▼ Ocultar Variables' : '▶ Ver Variables'}
            </button>

            {/* Variables */}
            {showVariables && (
              <div style={{ marginTop: '0.75rem', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.4rem' }}>
                {[
                  { icon: '🟡', label: 'Z. Amarilla', value: prediction.variables.yellowZoneEvents },
                  { icon: '🔴', label: 'Z. Roja', value: prediction.variables.redZoneEvents },
                  { icon: '📈', label: 'Expansión', value: `${prediction.variables.expansionVelocity} m²/d` },
                  { icon: '🛡️', label: 'Zona Sens.', value: `${(prediction.variables.sensitiveZoneProximity * 100).toFixed(0)}%` },
                  { icon: '📋', label: 'Hist. Riesgo', value: `${(prediction.variables.historicalRisk * 100).toFixed(0)}%` },
                  { icon: '📆', label: 'Duración', value: `${prediction.variables.projectDuration}d` }
                ].map((v, i) => (
                  <div key={i} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    padding: '0.4rem', 
                    background: 'rgba(255,255,255,0.05)', 
                    borderRadius: '4px',
                    fontSize: '0.7rem'
                  }}>
                    <span>{v.icon} {v.label}</span>
                    <strong>{v.value}</strong>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile: Legend Panel */}
      {isMobile && showLegend && (
        <div style={{
          position: 'absolute',
          bottom: '70px',
          right: '1rem',
          background: 'rgba(255, 255, 255, 0.98)',
          borderRadius: '10px',
          padding: '0.75rem',
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          fontSize: '0.7rem',
          zIndex: 15,
          maxWidth: '180px'
        }}>
          <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#2c3e50' }}>🗺️ Capas</div>
          {[
            { color: '#27ae60', border: 'solid', label: 'Área Base' },
            { color: '#f39c12', border: 'dashed', label: 'Zona +10%' },
            { color: '#e74c3c', border: 'dashed', label: 'Zona +20%' },
            { color: prediction ? getRiskColorHex(prediction.riskScore) : '#95a5a6', border: 'dashed', label: 'Proyección' }
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
              <div style={{ 
                width: '16px', 
                height: '10px', 
                background: item.color, 
                border: `2px ${item.border} ${item.color}`,
                borderRadius: '2px',
                opacity: 0.8
              }} />
              <span style={{ color: '#34495e' }}>{item.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Mobile: Location Panel */}
      {isMobile && showLocation && project && (
        <div style={{
          position: 'absolute',
          bottom: '70px',
          right: '1rem',
          background: 'rgba(255, 255, 255, 0.98)',
          borderRadius: '10px',
          padding: '0.75rem',
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          fontSize: '0.7rem',
          zIndex: 15
        }}>
          <div style={{ fontWeight: '600', marginBottom: '0.3rem', color: '#2c3e50' }}>
            📍 {project.state || 'México'}
          </div>
          <div style={{ color: '#7f8c8d' }}>
            {project.centerLat?.toFixed(4)}°N, {Math.abs(project.centerLng || 0).toFixed(4)}°W
          </div>
          {project.area && (
            <div style={{ color: '#7f8c8d', marginTop: '0.2rem' }}>
              Área: {project.area} ha
            </div>
          )}
        </div>
      )}

      {/* Desktop: Full Risk Score Panel */}
      {!isMobile && prediction && (
        <div style={{
          position: 'absolute',
          top: '1rem',
          right: '60px',
          ...panelStyle,
          minWidth: '200px'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: '0.75rem'
          }}>
            <span style={{ 
              fontSize: '0.75rem', 
              textTransform: 'uppercase', 
              letterSpacing: '1px',
              opacity: 0.8 
            }}>
              Modelo Predictivo IA
            </span>
            <span style={{ fontSize: '1.2rem' }}>
              {riskIcons[prediction.riskLevel.level]}
            </span>
          </div>
          
          {/* Risk Score Circle */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1rem'
          }}>
            <div style={{
              width: '70px',
              height: '70px',
              borderRadius: '50%',
              background: `conic-gradient(${prediction.riskLevel.color} ${prediction.riskScore * 3.6}deg, rgba(255,255,255,0.1) 0deg)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}>
              <div style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                background: 'rgba(44, 62, 80, 0.95)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column'
              }}>
                <span style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: '700',
                  color: prediction.riskLevel.color 
                }}>
                  {prediction.riskScore}
                </span>
              </div>
            </div>
            <div>
              <div style={{ 
                fontSize: '1.1rem', 
                fontWeight: '600',
                color: prediction.riskLevel.color,
                marginBottom: '0.25rem'
              }}>
                Riesgo {prediction.riskLevel.label}
              </div>
              <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                Tipo: {prediction.workType.name}
              </div>
              <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                Expansión: +{((prediction.expansionFactor - 1) * 100).toFixed(0)}%
              </div>
            </div>
          </div>

          {/* Time Projection */}
          <div style={{ 
            background: 'rgba(255,255,255,0.1)', 
            borderRadius: '8px', 
            padding: '0.75rem',
            marginBottom: '0.75rem'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.5rem'
            }}>
              <span style={{ fontSize: '0.8rem', opacity: 0.9 }}>
                📅 Proyección Temporal
              </span>
              <span style={{ 
                fontSize: '0.9rem', 
                fontWeight: '600',
                color: prediction.riskLevel.color 
              }}>
                +{daysFuture} días
              </span>
            </div>
            
            <input
              type="range"
              min="0"
              max="180"
              value={daysFuture}
              onChange={(e) => setDaysFuture(parseInt(e.target.value))}
              style={{
                width: '100%',
                height: '6px',
                borderRadius: '3px',
                appearance: 'none',
                background: `linear-gradient(to right, #27ae60 0%, #f39c12 50%, #e74c3c 100%)`,
                cursor: 'pointer'
              }}
            />
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              fontSize: '0.65rem',
              opacity: 0.6,
              marginTop: '0.25rem'
            }}>
              <span>Hoy</span>
              <span>90 días</span>
              <span>180 días</span>
            </div>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              style={{
                width: '100%',
                marginTop: '0.5rem',
                padding: '0.5rem',
                background: isPlaying ? 'rgba(231, 76, 60, 0.3)' : 'rgba(39, 174, 96, 0.3)',
                border: `1px solid ${isPlaying ? '#e74c3c' : '#27ae60'}`,
                borderRadius: '6px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
            >
              {isPlaying ? '⏸️ Pausar Simulación' : '▶️ Simular Evolución'}
            </button>
          </div>

          <button
            onClick={() => setShowVariables(!showVariables)}
            style={{
              width: '100%',
              padding: '0.5rem',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '6px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '0.75rem',
              transition: 'all 0.2s'
            }}
          >
            {showVariables ? '▼ Ocultar Variables' : '▶ Ver Variables de Riesgo'}
          </button>
        </div>
      )}

      {/* Desktop: Variables Panel */}
      {!isMobile && prediction && showVariables && (
        <div style={{
          position: 'absolute',
          top: '1rem',
          right: '270px',
          ...panelStyle,
          width: '280px',
          maxHeight: '400px',
          overflowY: 'auto'
        }}>
          <div style={{ 
            fontSize: '0.75rem', 
            textTransform: 'uppercase', 
            letterSpacing: '1px',
            opacity: 0.8,
            marginBottom: '0.75rem',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            paddingBottom: '0.5rem'
          }}>
            📊 Variables del Modelo
          </div>

          {[
            { label: 'Eventos en Zona Amarilla', value: prediction.variables.yellowZoneEvents, icon: '🟡', unit: 'eventos' },
            { label: 'Eventos en Zona Roja', value: prediction.variables.redZoneEvents, icon: '🔴', unit: 'eventos', critical: true },
            { label: 'Frecuencia de Salidas', value: formatNumber(prediction.variables.exitFrequency), icon: '🚧', unit: '/semana' },
            { label: 'Velocidad de Expansión', value: prediction.variables.expansionVelocity, icon: '📈', unit: 'm²/día' },
            { label: 'Superficie Afectada', value: formatNumber(prediction.variables.affectedSurface), icon: '🌿', unit: 'ha' },
            { label: 'Duración del Proyecto', value: prediction.variables.projectDuration, icon: '📆', unit: 'días' },
            { label: 'Riesgo Histórico', value: (prediction.variables.historicalRisk * 100).toFixed(0), icon: '📋', unit: '%' },
            { label: 'Proximidad Zonas Sensibles', value: (prediction.variables.sensitiveZoneProximity * 100).toFixed(0), icon: '🛡️', unit: '%', critical: prediction.variables.sensitiveZoneProximity > 0.6 },
            { label: 'Tendencia Temporal', value: prediction.variables.temporalTrend > 0 ? `+${formatNumber(prediction.variables.temporalTrend)}` : formatNumber(prediction.variables.temporalTrend), icon: prediction.variables.temporalTrend > 0 ? '📈' : '📉', unit: '', trend: true }
          ].map((variable, index) => (
            <div 
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.5rem',
                background: variable.critical ? 'rgba(231, 76, 60, 0.2)' : 'rgba(255,255,255,0.05)',
                borderRadius: '6px',
                marginBottom: '0.4rem',
                borderLeft: variable.critical ? '3px solid #e74c3c' : 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1rem' }}>{variable.icon}</span>
                <span style={{ fontSize: '0.7rem', opacity: 0.9 }}>{variable.label}</span>
              </div>
              <div style={{ 
                fontWeight: '600', 
                fontSize: '0.8rem',
                color: variable.critical ? '#e74c3c' : (variable.trend && prediction.variables.temporalTrend > 0) ? '#e74c3c' : 'inherit'
              }}>
                {variable.value}{variable.unit && <span style={{ opacity: 0.6, fontSize: '0.65rem', marginLeft: '2px' }}>{variable.unit}</span>}
              </div>
            </div>
          ))}

          <div style={{
            marginTop: '0.75rem',
            padding: '0.75rem',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '8px',
            fontSize: '0.7rem',
            lineHeight: '1.4'
          }}>
            <div style={{ fontWeight: '600', marginBottom: '0.5rem', opacity: 0.9 }}>
              💡 Interpretación:
            </div>
            <p style={{ opacity: 0.8, margin: 0 }}>
              {prediction.riskScore < 30 && 'La obra mantiene un ritmo de avance dentro de los parámetros permitidos. Se recomienda monitoreo rutinario.'}
              {prediction.riskScore >= 30 && prediction.riskScore < 60 && 'Se detectan indicadores de posible expansión fuera del área autorizada. Se recomienda inspección preventiva.'}
              {prediction.riskScore >= 60 && prediction.riskScore < 80 && 'Alto riesgo de violación de límites. La obra muestra tendencia expansiva significativa. Se requiere intervención inmediata.'}
              {prediction.riskScore >= 80 && 'Riesgo crítico de daño ambiental. Múltiples indicadores en niveles de alerta. Acción correctiva urgente necesaria.'}
            </p>
          </div>
        </div>
      )}

      {/* Desktop: Map Legend */}
      {!isMobile && (
        <div style={{
          position: 'absolute',
          bottom: '1rem',
          left: '1rem',
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '10px',
          padding: '0.75rem 1rem',
          boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
          fontSize: '0.75rem',
          zIndex: 10,
          maxWidth: '220px'
        }}>
          <div style={{ 
            fontWeight: '700', 
            marginBottom: '0.6rem', 
            color: '#2c3e50',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span>🗺️</span>
            <span>Capas del Mapa</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '18px', height: '12px', background: '#27ae60', border: '2px solid #1e8449', borderRadius: '2px' }} />
              <span style={{ color: '#34495e' }}>Área Autorizada (Base)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '18px', height: '12px', background: '#f39c12', border: '2px dashed #d68910', borderRadius: '2px' }} />
              <span style={{ color: '#34495e' }}>Zona de Ajuste (+10%)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '18px', height: '12px', background: '#e74c3c', border: '2px dashed #c0392b', borderRadius: '2px' }} />
              <span style={{ color: '#34495e' }}>Zona de Riesgo (+20%)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.3rem', paddingTop: '0.4rem', borderTop: '1px solid #ecf0f1' }}>
              <div style={{ 
                width: '18px', 
                height: '12px', 
                background: prediction ? `${getRiskColorHex(prediction.riskScore)}66` : '#95a5a6',
                border: `2px dashed ${prediction ? getRiskColorHex(prediction.riskScore) : '#95a5a6'}`,
                borderRadius: '2px'
              }} />
              <span style={{ color: '#34495e', fontWeight: '500' }}>Expansión Proyectada</span>
            </div>
          </div>
        </div>
      )}

      {/* Desktop: Project Location Badge */}
      {!isMobile && project && (
        <div style={{
          position: 'absolute',
          top: '1rem',
          left: '1rem',
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '10px',
          padding: '0.6rem 0.85rem',
          boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
          fontSize: '0.75rem',
          zIndex: 10,
          maxWidth: '200px'
        }}>
          <div style={{ 
            fontWeight: '700', 
            color: '#2c3e50', 
            marginBottom: '0.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}>
            <span>📍</span>
            <span>{project.state || 'México'}</span>
          </div>
          <div style={{ color: '#7f8c8d', fontSize: '0.65rem' }}>
            {project.centerLat?.toFixed(4)}°N, {Math.abs(project.centerLng || 0).toFixed(4)}°W
          </div>
          {project.area && (
            <div style={{ color: '#7f8c8d', fontSize: '0.65rem', marginTop: '0.15rem' }}>
              Área: {project.area} hectáreas
            </div>
          )}
        </div>
      )}

      {/* Warning indicator when projected expansion exceeds red zone */}
      {prediction && prediction.expansionFactor > 1.2 && (
        <div style={{
          position: 'absolute',
          bottom: isMobile ? '70px' : '1rem',
          right: isMobile ? 'auto' : '1rem',
          left: isMobile ? '0.5rem' : 'auto',
          background: 'linear-gradient(135deg, rgba(231, 76, 60, 0.95) 0%, rgba(192, 57, 43, 0.95) 100%)',
          borderRadius: '10px',
          padding: isMobile ? '0.5rem 0.75rem' : '0.75rem 1rem',
          boxShadow: '0 4px 16px rgba(231, 76, 60, 0.4)',
          color: 'white',
          zIndex: 10,
          maxWidth: isMobile ? '200px' : '240px',
          animation: 'pulse 2s infinite'
        }}>
          <style>
            {`
              @keyframes pulse {
                0%, 100% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.9; transform: scale(1.02); }
              }
            `}
          </style>
          <div style={{ 
            fontWeight: '700', 
            marginBottom: '0.3rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: isMobile ? '0.75rem' : '0.85rem'
          }}>
            <span>⚠️</span>
            <span>Alerta de Invasión</span>
          </div>
          {!isMobile && (
            <div style={{ fontSize: '0.7rem', opacity: 0.9, lineHeight: '1.3' }}>
              La proyección indica que la obra podría exceder los límites permitidos 
              en {Math.round(180 * (1.2 / prediction.expansionFactor))} días si continúa la tendencia actual.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ProjectDetailMap
