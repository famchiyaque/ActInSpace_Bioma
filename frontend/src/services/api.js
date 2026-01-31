/**
 * API Service for Bioma Backend
 * 
 * Handles all communication with the backend API
 */

import { generateSyntheticPolygon } from '../utils/polygonGenerator';

// Determine API URL based on environment
// - If running via ngrok or other tunnel (not localhost), use /api proxy
// - If running locally, use direct connection to backend
const isLocalhost = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (isLocalhost ? 'http://localhost:8000' : '/api');

// Default coordinates for Mexican states/regions when none are provided
const REGION_DEFAULT_COORDINATES = {
  'Nuevo León': { lng: -100.31, lat: 25.67 },
  'Ciudad de México': { lng: -99.13, lat: 19.43 },
  'CDMX': { lng: -99.13, lat: 19.43 },
  'Jalisco': { lng: -103.35, lat: 20.67 },
  'Veracruz': { lng: -96.13, lat: 19.18 },
  'Quintana Roo': { lng: -87.46, lat: 20.21 },
  'Yucatán': { lng: -89.62, lat: 20.97 },
  'Chihuahua': { lng: -106.08, lat: 28.63 },
  'Sonora': { lng: -110.97, lat: 29.07 },
  'Baja California': { lng: -117.02, lat: 32.52 },
  'Oaxaca': { lng: -96.72, lat: 17.06 },
  'Chiapas': { lng: -93.11, lat: 16.75 },
  'Tabasco': { lng: -92.95, lat: 17.98 },
  'Sinaloa': { lng: -107.39, lat: 24.81 },
  'Puebla': { lng: -98.21, lat: 19.04 },
  'Guerrero': { lng: -99.50, lat: 17.55 },
  'Tamaulipas': { lng: -99.15, lat: 23.74 },
  'Michoacán': { lng: -101.18, lat: 19.70 },
  'Guanajuato': { lng: -101.26, lat: 21.02 },
  'San Luis Potosí': { lng: -100.98, lat: 22.15 },
  'Coahuila': { lng: -101.42, lat: 25.42 },
  'Durango': { lng: -104.67, lat: 24.03 },
  'Zacatecas': { lng: -102.57, lat: 22.77 },
  'Aguascalientes': { lng: -102.29, lat: 21.88 },
  'Nayarit': { lng: -104.89, lat: 21.75 },
  'Colima': { lng: -103.72, lat: 19.24 },
  'Querétaro': { lng: -100.39, lat: 20.59 },
  'Hidalgo': { lng: -98.76, lat: 20.09 },
  'Tlaxcala': { lng: -98.24, lat: 19.32 },
  'Morelos': { lng: -99.23, lat: 18.92 },
  'Estado de México': { lng: -99.62, lat: 19.29 },
  'Campeche': { lng: -90.53, lat: 19.84 },
  'Baja California Sur': { lng: -111.98, lat: 24.14 },
  // Fallback for unknown regions
  'default': { lng: -102.55, lat: 23.63 } // Center of Mexico
};

/**
 * Generic fetch wrapper with error handling
 */
async function apiFetch(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    console.log("API Response for map load:", response);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(error.detail || `API Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Projects API
 */
export const projectsApi = {
  /**
   * Get all projects for the map view
   * @returns {Promise<{projects: Array}>}
   */
  async getAllProjects() {
    return apiFetch('/projects');
  },

  /**
   * Get detailed project information
   * @param {string} projectId - Project UUID
   * @returns {Promise<Object>}
   */
  async getProjectDetail(projectId) {
    return apiFetch(`/projects/${projectId}`);
  },

  /**
   * Create a new project
   * @param {Object} projectData - Project creation data
   * @returns {Promise<Object>}
   */
  async createProject(projectData) {
    return apiFetch('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  },

  /**
   * Create a new analysis run for a project
   * @param {string} projectId - Project UUID
   * @param {Object} runData - Run configuration data
   * @returns {Promise<Object>}
   */
  async createRun(projectId, runData) {
    return apiFetch(`/projects/${projectId}/runs`, {
      method: 'POST',
      body: JSON.stringify(runData),
    });
  },
};

/**
 * Runs API
 */
export const runsApi = {
  /**
   * Get run status and results
   * @param {string} runId - Run UUID
   * @returns {Promise<Object>}
   */
  async getRunStatus(runId) {
    return apiFetch(`/runs/${runId}`);
  },

  /**
   * Get reports for a run
   * @param {string} runId - Run UUID
   * @returns {Promise<{reports: Array}>}
   */
  async getRunReports(runId) {
    return apiFetch(`/runs/${runId}/reports`);
  },
};

/**
 * Health API
 */
export const healthApi = {
  /**
   * Check backend health
   * @returns {Promise<{status: string, database: string}>}
   */
  async checkHealth() {
    return apiFetch('/health');
  },
};

/**
 * Helper function to transform backend project data to frontend format
 * Maps the backend schema to match the existing frontend expectations
 * Handles both the /projects list format and /projects/{id} detail format
 */
export function transformProjectData(backendData) {
  // Handle both list format (backendData is project) and detail format (backendData has project key)
  const backendProject = backendData.project || backendData;
  const geomarkersData = backendData.geomarkers || {};
  const latestRunData = backendData.latest_run || {};
  const reportsData = backendData.reports || [];
  const runHistoryData = backendData.run_history || [];

  // Extract the active geomarker to get the work zone geometry
  let workZone = null;
  if (geomarkersData.active?.geojson) {
    workZone = {
      type: 'Feature',
      geometry: geomarkersData.active.geojson,
      properties: {
        name: backendProject.name,
        compliance: backendProject.risk_label || 'unknown'
      }
    };
  }
  
  // Flag to track if we need to generate a synthetic polygon later
  let needsSyntheticPolygon = !workZone;

  // Extract center coordinates from the active geomarker's geometry if available
  // Priority: center_lat/center_lng from list > derived from geometry > region default
  let centerLat = backendProject.center_lat || null;
  let centerLng = backendProject.center_lng || null;
  
  // If no direct coordinates, try to derive from geomarker geometry
  if ((!centerLat || !centerLng) && geomarkersData.active?.geojson?.type === 'Polygon') {
    const coords = geomarkersData.active.geojson.coordinates[0];
    if (coords && coords.length > 0) {
      const centerIdx = Math.floor(coords.length / 2);
      centerLng = coords[centerIdx][0];
      centerLat = coords[centerIdx][1];
    }
  }
  
  // If still no coordinates, use region-based default coordinates
  if (!centerLat || !centerLng) {
    const regionName = backendProject.region?.name || 'default';
    
    // Find matching coordinates - try exact match first, then partial match
    let regionCoords = REGION_DEFAULT_COORDINATES[regionName];
    
    if (!regionCoords) {
      // Try to find a partial match (e.g., "Jalisco - Guadalajara" should match "Jalisco")
      const regionKeys = Object.keys(REGION_DEFAULT_COORDINATES);
      for (const key of regionKeys) {
        if (regionName.toLowerCase().includes(key.toLowerCase()) || 
            key.toLowerCase().includes(regionName.toLowerCase().split(' ')[0])) {
          regionCoords = REGION_DEFAULT_COORDINATES[key];
          console.log(`Matched region "${regionName}" to "${key}"`);
          break;
        }
      }
    }
    
    // Fall back to default if no match found
    if (!regionCoords) {
      regionCoords = REGION_DEFAULT_COORDINATES['default'];
    }
    
    // Add small random offset based on project ID to spread markers
    const idHash = backendProject.id ? 
      backendProject.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 0;
    const offsetLng = ((idHash % 100) - 50) * 0.003; // ±0.15 degrees
    const offsetLat = (((idHash * 7) % 100) - 50) * 0.003;
    
    centerLng = regionCoords.lng + offsetLng;
    centerLat = regionCoords.lat + offsetLat;
    
    console.log(`Using coordinates for "${backendProject.name}" in ${regionName}: ${centerLat.toFixed(4)}, ${centerLng.toFixed(4)}`);
  }

  const hasCoordinates = centerLat != null && centerLng != null;
  
  // Generate synthetic polygon if no real one exists but we have coordinates
  if (needsSyntheticPolygon && hasCoordinates) {
    // Use a default area of 100 hectares if not available
    const estimatedArea = 100;
    workZone = generateSyntheticPolygon(
      backendProject.id,
      centerLng,
      centerLat,
      estimatedArea
    );
    workZone.properties = {
      name: backendProject.name,
      compliance: backendProject.risk_label || 'unknown'
    };
  }

  const normalizedRiskLabel = backendProject.risk_label
    ? backendProject.risk_label.toString().trim().toLowerCase()
    : 'unknown'

  const carbonKgCo2e =
    latestRunData?.carbon_kg_co2e ??
    latestRunData?.stats?.carbon_kg_co2e ??
    latestRunData?.parameters?.carbon_kg_co2e ??
    backendProject?.carbon_kg_co2e ??
    null

  const carbonTonnes =
    latestRunData?.carbon_footprint_tonnes ??
    backendProject?.carbon_footprint_tonnes ??
    (carbonKgCo2e != null ? carbonKgCo2e / 1000 : null)

  return {
    id: backendProject.id,
    name: backendProject.name,
    description: backendProject.description || '',
    state: backendProject.region?.name || 'Unknown',
    stateCode: backendProject.region?.country_code || 'UNK',
    status: backendProject.status || 'active',
    compliance: normalizedRiskLabel,
    riskState: normalizedRiskLabel,
    category: backendProject.category || 'General',
    company: backendProject.company?.name || 'Unknown',
    companyId: backendProject.company?.id,
    companyDescription: backendProject.company?.description || backendProject.company?.name || 'Not available',
    regionDescription: backendProject.region?.description || backendProject.region?.name || 'Not available',
    startDate: backendProject.monitoring_start_date || new Date().toISOString(),
    monitoringEndDate: backendProject.monitoring_end_date || null,
    area: latestRunData.hectares_change ?? null,
    vegetationLoss: latestRunData.hectares_change ?? null,
    carbonFootprint: carbonTonnes,
    lastUpdated: backendProject.updated_at 
      ? new Date(backendProject.updated_at).toLocaleDateString('en-US', { 
          day: '2-digit', 
          month: 'short', 
          year: 'numeric' 
        })
      : 'N/A',
    imageUrl: backendProject.image_url || null,
    workZone: workZone,
    protectedZones: [],
    
    // Center coordinates for marker placement
    centerLat: centerLat,
    centerLng: centerLng,
    hasCoordinates: hasCoordinates,
    hasGeometry: workZone !== null,
    
    // Additional backend-specific data for detail view
    geomarkers: geomarkersData,
    latest_run: latestRunData,
    reports: reportsData,
    run_history: runHistoryData,
    created_at: backendProject.created_at,
    updated_at: backendProject.updated_at
  };
}

export default {
  projects: projectsApi,
  runs: runsApi,
  health: healthApi,
  transformProjectData,
};
