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
 */
export function transformProjectData(backendProject) {
  // Extract coordinates from the active geomarker if available
  let workZone = null;
  if (backendProject.active_geomarker?.geojson) {
    workZone = {
      type: 'Feature',
      geometry: backendProject.active_geomarker.geojson,
      properties: {
        name: backendProject.name,
        compliance: backendProject.risk_label || 'unknown'
      }
    };
  }
  
  // Use center coordinates for marker placement
  const centerLat = backendProject.center_lat;
  const centerLng = backendProject.center_lng;
  const hasCoordinates = centerLat != null && centerLng != null;

  // Get the latest run data if available
  const latestRun = backendProject.latest_run || {};
  
  return {
    id: backendProject.id,
    name: backendProject.name,
    description: backendProject.description || '',
    state: backendProject.region?.name || 'Desconocido',
    stateCode: backendProject.region?.code || 'UNK',
    status: backendProject.status || 'active',
    compliance: backendProject.risk_label || 'unknown',
    riskState: backendProject.risk_label || 'unknown',
    category: backendProject.category || 'General',
    company: backendProject.company?.name || 'Desconocida',
    startDate: backendProject.monitoring_start_date || new Date().toISOString(),
    area: latestRun.area_hectares || 0,
    vegetationLoss: latestRun.vegetation_loss_hectares || 0,
    carbonFootprint: backendProject.carbon_footprint_tonnes || 0,
    lastUpdated: backendProject.updated_at 
      ? new Date(backendProject.updated_at).toLocaleDateString('es-MX', { 
          day: '2-digit', 
          month: 'short', 
          year: 'numeric' 
        })
      : 'N/A',
    imageUrl: backendProject.image_url || backendProject.latest_image_url || null,
    workZone: workZone,
    protectedZones: [], // TODO: Add protected zones if backend provides them
    
    // Center coordinates for marker placement
    centerLat: centerLat,
    centerLng: centerLng,
    hasCoordinates: hasCoordinates,
    hasGeometry: workZone !== null, // Flag to indicate if project has full polygon geometry
    
    // Additional backend-specific data
    runs: backendProject.runs || [],
    geomarkers: backendProject.geomarkers || [],
    latest_run: latestRun,
    reports: latestRun.reports || []
  };
}

export default {
  projects: projectsApi,
  runs: runsApi,
  health: healthApi,
  transformProjectData,
};
