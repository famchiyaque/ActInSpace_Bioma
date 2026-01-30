import { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import mexicoStates from '../../data/mexico-states.geojson?url';
import { getProjectsByState, getStateProjectSummary } from '../../data/mock-projects';

// Set your Mapbox token here
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const stateCodeByNumeric = {
  1: 'AGS',
  2: 'BC',
  3: 'BCS',
  4: 'CAM',
  5: 'COA',
  6: 'COL',
  7: 'CHS',
  8: 'CHH',
  9: 'CDMX',
  10: 'DUR',
  11: 'GUA',
  12: 'GRO',
  13: 'HID',
  14: 'JAL',
  15: 'MEX',
  16: 'MIC',
  17: 'MOR',
  18: 'NAY',
  19: 'NL',
  20: 'OAX',
  21: 'PUE',
  22: 'QRO',
  23: 'QROO',
  24: 'SLP',
  25: 'SIN',
  26: 'SON',
  27: 'TAB',
  28: 'TAM',
  29: 'TLA',
  30: 'VER',
  31: 'YUC',
  32: 'ZAC'
};

const MexicoMap = ({ onStateSelect, onProjectSelect, selectedState }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize map
  useEffect(() => {
    if (map.current) return; // Initialize map only once

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-102.5528, 23.6345], // Center of Mexico
      zoom: 4.5,
      projection: 'mercator'
    });

    map.current.on('load', () => {
      setMapLoaded(true);

      // Fetch and add Mexico states source
      fetch(mexicoStates)
        .then(response => response.json())
        .then(data => {
          map.current.addSource('mexico-states', {
            type: 'geojson',
            data: data,
            promoteId: 'state_code'
          });

          addStateLayers();
        })
        .catch(error => console.error('Error loading GeoJSON:', error));
    });

    const addStateLayers = () => {
      if (!map.current.getSource('mexico-states')) return;

      // Add state fill layer
      map.current.addLayer({
        id: 'states-fill',
        type: 'fill',
        source: 'mexico-states',
        paint: {
          'fill-color': '#7a9a7e',
          'fill-opacity': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            0.4,
            0.2
          ]
        }
      });

      // Add state border layer
      map.current.addLayer({
        id: 'states-border',
        type: 'line',
        source: 'mexico-states',
        paint: {
          'line-color': '#4a6b4d',
          'line-width': 2
        }
      });

      // Add state labels
      map.current.addLayer({
        id: 'states-label',
        type: 'symbol',
        source: 'mexico-states',
        layout: {
          'text-field': ['get', 'name'],
          'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
          'text-size': 12
        },
        paint: {
          'text-color': '#2d3e2f',
          'text-halo-color': '#ffffff',
          'text-halo-width': 1
        }
      });

      // Hover effect
      let hoveredStateId = null;
      const hoverPopup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        offset: [0, -6]
      });

      map.current.on('mousemove', 'states-fill', (e) => {
        if (e.features.length > 0) {
          if (hoveredStateId !== null) {
            map.current.setFeatureState(
              { source: 'mexico-states', id: hoveredStateId },
              { hover: false }
            );
          }
          hoveredStateId = e.features[0].id;
          map.current.setFeatureState(
            { source: 'mexico-states', id: hoveredStateId },
            { hover: true }
          );
          map.current.getCanvas().style.cursor = 'pointer';

          const feature = e.features[0];
          const rawStateCode = feature.properties.state_code;
          const stateCode = stateCodeByNumeric[rawStateCode] || null;
          const stateName = feature.properties.state_name;
          const { activeCount, finishedCount, total } = getStateProjectSummary(stateCode);

          hoverPopup
            .setLngLat(e.lngLat)
            .setHTML(`
              <div style="font-family: var(--font-body); padding: 0.5rem 0.6rem;">
                <div style="font-family: var(--font-display); font-size: 0.95rem; color: var(--earth-dark); margin-bottom: 0.35rem;">
                  ${stateName}
                </div>
                <div style="font-size: 0.85rem; color: var(--ink-light);">
                  <div><strong>En construcción:</strong> ${activeCount}</div>
                  <div><strong>Finalizados:</strong> ${finishedCount}</div>
                  <div><strong>Total:</strong> ${total}</div>
                </div>
              </div>
            `)
            .addTo(map.current);
        }
      });

      map.current.on('mouseleave', 'states-fill', () => {
        if (hoveredStateId !== null) {
          map.current.setFeatureState(
            { source: 'mexico-states', id: hoveredStateId },
            { hover: false }
          );
        }
        hoveredStateId = null;
        map.current.getCanvas().style.cursor = '';
        hoverPopup.remove();
      });

      // Click handler for states
      map.current.on('click', 'states-fill', (e) => {
        if (e.features.length > 0) {
          const feature = e.features[0];
          const rawStateCode = feature.properties.state_code;
          const stateCode = stateCodeByNumeric[rawStateCode] || null;
          const stateName = feature.properties.state_name;
          
          // Get bounds of clicked state
          const bounds = new mapboxgl.LngLatBounds();
          
          if (feature.geometry.type === 'Polygon') {
            feature.geometry.coordinates[0].forEach(coord => {
              bounds.extend(coord);
            });
          }

          // Zoom to state
          map.current.fitBounds(bounds, {
            padding: 100,
            duration: 1000
          });

          // Load projects for this state
          const projects = getProjectsByState(stateCode);
          
          if (onStateSelect) {
            onStateSelect({
              code: stateCode,
              name: stateName,
              projects: projects
            });
          }
        }
      });
    };

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Handle project layer updates when state is selected
  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    // Remove existing project layers if any
    if (map.current.getLayer('projects-fill')) {
      map.current.removeLayer('projects-fill');
    }
    if (map.current.getLayer('projects-border')) {
      map.current.removeLayer('projects-border');
    }
    if (map.current.getSource('projects')) {
      map.current.removeSource('projects');
    }

    // Add project layers if state is selected
    if (selectedState && selectedState.projects && selectedState.projects.length > 0) {
      const projectFeatures = selectedState.projects.map(project => project.workZone);
      
      map.current.addSource('projects', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: projectFeatures
        }
      });

      // Add project fill layer with color based on compliance
      map.current.addLayer({
        id: 'projects-fill',
        type: 'fill',
        source: 'projects',
        paint: {
          'fill-color': [
            'match',
            ['get', 'compliance'],
            'compliant', '#6b9e78',
            'warning', '#e09b3d',
            'violation', '#c84f3f',
            '#7a9a7e' // default
          ],
          'fill-opacity': 0.6
        }
      });

      // Add project border layer
      map.current.addLayer({
        id: 'projects-border',
        type: 'line',
        source: 'projects',
        paint: {
          'line-color': '#2d3e2f',
          'line-width': 2
        }
      });

      // Add click handler for projects
      map.current.on('click', 'projects-fill', (e) => {
        if (e.features.length > 0) {
          const feature = e.features[0];
          const projectName = feature.properties.name;
          
          // Find the full project data
          const project = selectedState.projects.find(p => p.name === projectName);
          
          if (onProjectSelect && project) {
            onProjectSelect(project);
          }

          // Show popup
          new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(`
              <div style="font-family: var(--font-body); padding: 0.5rem;">
                <h3 style="font-family: var(--font-display); font-size: 1rem; margin-bottom: 0.5rem; color: var(--earth-dark);">
                  ${projectName}
                </h3>
                <p style="font-size: 0.85rem; color: var(--ink-light); margin: 0.25rem 0;">
                  <strong>Status:</strong> ${feature.properties.compliance}
                </p>
              </div>
            `)
            .addTo(map.current);
        }
      });

      // Change cursor on hover
      map.current.on('mouseenter', 'projects-fill', () => {
        map.current.getCanvas().style.cursor = 'pointer';
      });

      map.current.on('mouseleave', 'projects-fill', () => {
        map.current.getCanvas().style.cursor = '';
      });
    }
  }, [selectedState, mapLoaded, onProjectSelect]);

  // Reset to Mexico view
  const resetToMexico = () => {
    if (map.current) {
      map.current.flyTo({
        center: [-102.5528, 23.6345],
        zoom: 4.5,
        duration: 1000
      });
      
      if (onStateSelect) {
        onStateSelect(null);
      }
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
      
      {selectedState && (
        <button
          onClick={resetToMexico}
          style={{
            position: 'absolute',
            top: '1rem',
            left: '1rem',
            background: 'var(--earth-dark)',
            color: 'var(--paper)',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            fontFamily: 'var(--font-body)',
            fontSize: '0.9rem',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            zIndex: 1
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'var(--earth-mid)';
            e.target.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'var(--earth-dark)';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          ← Volver a México
        </button>
      )}

      {selectedState && selectedState.projects && selectedState.projects.length > 0 && (
        <div
          style={{
            position: 'absolute',
            bottom: '2rem',
            right: '2rem',
            background: 'white',
            padding: '1.5rem',
            borderRadius: '8px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
            border: '2px solid var(--border)',
            maxWidth: '300px',
            zIndex: 1
          }}
        >
          <h3 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1rem',
            marginBottom: '1rem',
            color: 'var(--earth-dark)'
          }}>
            Leyenda
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '16px',
                height: '16px',
                background: '#6b9e78',
                borderRadius: '2px',
                border: '2px solid #2d3e2f'
              }}></div>
              <span style={{ fontSize: '0.9rem' }}>Cumplimiento</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '16px',
                height: '16px',
                background: '#e09b3d',
                borderRadius: '2px',
                border: '2px solid #2d3e2f'
              }}></div>
              <span style={{ fontSize: '0.9rem' }}>Advertencia</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '16px',
                height: '16px',
                background: '#c84f3f',
                borderRadius: '2px',
                border: '2px solid #2d3e2f'
              }}></div>
              <span style={{ fontSize: '0.9rem' }}>Violación</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MexicoMap;
