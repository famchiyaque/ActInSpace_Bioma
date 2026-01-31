import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

mapboxgl.accessToken =
  import.meta.env.VITE_MAPBOX_TOKEN ||
  'pk.eyJ1IjoiYmlvbWEtbWFwIiwiYSI6ImNtNWRlZjBkZjBhcWYya3M3NzVhZDJhZWYifQ.placeholder'

const ensureClosedRing = (ring) => {
  if (!ring.length) return ring
  const [firstLng, firstLat] = ring[0]
  const [lastLng, lastLat] = ring[ring.length - 1]
  if (firstLng === lastLng && firstLat === lastLat) {
    return ring
  }
  return [...ring, ring[0]]
}

const getCentroid = (ring) => {
  const total = ring.reduce(
    (acc, [lng, lat]) => {
      acc.lng += lng
      acc.lat += lat
      return acc
    },
    { lng: 0, lat: 0 }
  )
  const count = ring.length || 1
  return [total.lng / count, total.lat / count]
}

const buildScaledPolygon = (feature, scale) => {
  const ring = ensureClosedRing(feature.geometry?.coordinates?.[0] || [])
  if (!ring.length) return null
  const [centerLng, centerLat] = getCentroid(ring)
  const scaled = ring.map(([lng, lat]) => [
    centerLng + (lng - centerLng) * scale,
    centerLat + (lat - centerLat) * scale
  ])

  return {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [scaled]
    },
    properties: {}
  }
}

const ProjectDetailMap = ({ project }) => {
  const mapContainer = useRef(null)
  const mapRef = useRef(null)
  const [mapLoaded, setMapLoaded] = useState(false)

  useEffect(() => {
    if (mapRef.current) return

    mapRef.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [-99.1332, 19.4326],
      zoom: 12
    })

    mapRef.current.addControl(new mapboxgl.NavigationControl(), 'top-right')
    mapRef.current.on('load', () => setMapLoaded(true))

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!mapLoaded || !project?.workZone) return

    const mapInstance = mapRef.current
    const baseFeature = project.workZone
    if (baseFeature.geometry?.type !== 'Polygon') return

    const bufferYellow = buildScaledPolygon(baseFeature, 1.1)
    const bufferRed = buildScaledPolygon(baseFeature, 1.2)
    const ring = ensureClosedRing(baseFeature.geometry?.coordinates?.[0] || [])
    if (!ring.length || !bufferYellow || !bufferRed) return

    const setSource = (id, data) => {
      const source = mapInstance.getSource(id)
      if (source) {
        source.setData(data)
        return
      }
      mapInstance.addSource(id, { type: 'geojson', data })
    }

    setSource('buffer-red', bufferRed)
    setSource('buffer-yellow', bufferYellow)
    setSource('workzone', baseFeature)

    if (!mapInstance.getLayer('buffer-red-fill')) {
      mapInstance.addLayer({
        id: 'buffer-red-fill',
        type: 'fill',
        source: 'buffer-red',
        paint: {
          'fill-color': '#f26b6b',
          'fill-opacity': 0.35
        }
      })
    }

    if (!mapInstance.getLayer('buffer-yellow-fill')) {
      mapInstance.addLayer({
        id: 'buffer-yellow-fill',
        type: 'fill',
        source: 'buffer-yellow',
        paint: {
          'fill-color': '#f3c969',
          'fill-opacity': 0.45
        }
      })
    }

    if (!mapInstance.getLayer('workzone-fill')) {
      mapInstance.addLayer({
        id: 'workzone-fill',
        type: 'fill',
        source: 'workzone',
        paint: {
          'fill-color': '#5aa469',
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
          'line-color': '#1f4d2f',
          'line-width': 2
        }
      })
    }

    if (ring.length) {
      const bounds = ring.reduce(
        (acc, coord) => acc.extend(coord),
        new mapboxgl.LngLatBounds(ring[0], ring[0])
      )
      mapInstance.fitBounds(bounds, { padding: 40, duration: 800 })
    }
  }, [mapLoaded, project])

  return <div ref={mapContainer} className="project-detail-mapbox" />
}

export default ProjectDetailMap

