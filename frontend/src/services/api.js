/**
 * API Service for Bioma Backend
 * 
 * Handles all communication with the backend API
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

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

  // Extract center coordinates from the active geomarker's geometry if available
  // Priority: center_lat/center_lng from list > derived from geometry
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

  const hasCoordinates = centerLat != null && centerLng != null;

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
