/**
 * Predictive Risk Model for Construction Projects
 * 
 * Simulates future expansion and calculates risk scores based on multiple variables.
 * This is a deterministic, explainable model for visualization purposes.
 */

// Seeded random for consistent results per project
function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function stringToSeed(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash);
}

/**
 * Work type configurations affecting expansion patterns
 */
export const WORK_TYPES = {
  punctual: {
    name: 'Puntual',
    expansionRate: 0.02,    // 2% per 30 days
    maxExpansion: 1.3,      // Max 30% growth
    directionality: 'radial'
  },
  linear: {
    name: 'Lineal',
    expansionRate: 0.04,    // 4% per 30 days
    maxExpansion: 1.6,      // Max 60% growth
    directionality: 'axial'
  },
  extensive: {
    name: 'Extensiva',
    expansionRate: 0.06,    // 6% per 30 days
    maxExpansion: 2.0,      // Max 100% growth
    directionality: 'radial'
  }
};

/**
 * Determine work type based on project characteristics
 */
export function determineWorkType(project) {
  const category = (project.category || '').toLowerCase();
  const name = (project.name || '').toLowerCase();
  
  if (category.includes('transporte') || name.includes('carretera') || 
      name.includes('tren') || name.includes('metro') || name.includes('highway')) {
    return 'linear';
  }
  if (category.includes('turismo') || category.includes('desarrollo') || 
      name.includes('resort') || name.includes('industrial')) {
    return 'extensive';
  }
  return 'punctual';
}

/**
 * Generate simulated risk variables for a project
 * These would come from real sensors/analysis in production
 */
export function generateRiskVariables(project, daysPassed = 0) {
  const seed = stringToSeed(project.id + daysPassed.toString());
  const baseSeed = stringToSeed(project.id);
  
  // Base risk from compliance status
  const complianceRisk = {
    'compliant': 0.1,
    'warning': 0.4,
    'violation': 0.7
  }[project.compliance || project.riskState] || 0.3;
  
  // Simulated events - increase with days and base risk
  const yellowZoneEvents = Math.floor(seededRandom(seed + 1) * 10 * complianceRisk * (1 + daysPassed / 100));
  const redZoneEvents = Math.floor(seededRandom(seed + 2) * 5 * complianceRisk * (1 + daysPassed / 150));
  
  // Frequency of exits from base area (per week)
  const exitFrequency = seededRandom(seed + 3) * 3 * complianceRisk * (1 + daysPassed / 200);
  
  // Expansion velocity (m²/day)
  const workType = determineWorkType(project);
  const baseExpansionVelocity = WORK_TYPES[workType].expansionRate * (project.area || 100) * 10000 / 30;
  const expansionVelocity = baseExpansionVelocity * (0.5 + seededRandom(seed + 4) * complianceRisk);
  
  // Affected surface outside base (hectares)
  const affectedSurface = (project.vegetationLoss || 10) * (1 + daysPassed / 180) * (0.8 + seededRandom(seed + 5) * 0.4);
  
  // Project duration (days)
  const startDate = project.startDate ? new Date(project.startDate) : new Date();
  const projectDuration = Math.max(30, Math.floor((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + daysPassed);
  
  // Historical risk (0-1) - based on company/project history
  const historicalRisk = seededRandom(baseSeed + 6) * 0.5 + complianceRisk * 0.5;
  
  // Proximity to sensitive zones (0-1, 1 = very close)
  const sensitiveZoneProximity = seededRandom(baseSeed + 7) * 0.6 + (project.protectedZones?.length > 0 ? 0.4 : 0);
  
  // Temporal trend (-1 to 1, positive = increasing risk)
  const temporalTrend = (seededRandom(seed + 8) - 0.3) * complianceRisk * 2;
  
  return {
    yellowZoneEvents,
    redZoneEvents,
    exitFrequency: Math.round(exitFrequency * 10) / 10,
    expansionVelocity: Math.round(expansionVelocity),
    affectedSurface: Math.round(affectedSurface * 10) / 10,
    projectDuration,
    workType,
    historicalRisk: Math.round(historicalRisk * 100) / 100,
    sensitiveZoneProximity: Math.round(sensitiveZoneProximity * 100) / 100,
    temporalTrend: Math.round(temporalTrend * 100) / 100
  };
}

/**
 * Calculate overall risk score (1-100)
 */
export function calculateRiskScore(variables) {
  const weights = {
    yellowZoneEvents: 0.08,      // 8%
    redZoneEvents: 0.15,         // 15%
    exitFrequency: 0.10,         // 10%
    expansionVelocity: 0.12,     // 12%
    affectedSurface: 0.10,       // 10%
    projectDuration: 0.05,       // 5%
    historicalRisk: 0.15,        // 15%
    sensitiveZoneProximity: 0.12,// 12%
    temporalTrend: 0.13          // 13%
  };
  
  // Normalize each variable to 0-1 scale
  const normalized = {
    yellowZoneEvents: Math.min(1, variables.yellowZoneEvents / 20),
    redZoneEvents: Math.min(1, variables.redZoneEvents / 10),
    exitFrequency: Math.min(1, variables.exitFrequency / 5),
    expansionVelocity: Math.min(1, variables.expansionVelocity / 1000),
    affectedSurface: Math.min(1, variables.affectedSurface / 100),
    projectDuration: Math.min(1, variables.projectDuration / 365),
    historicalRisk: variables.historicalRisk,
    sensitiveZoneProximity: variables.sensitiveZoneProximity,
    temporalTrend: (variables.temporalTrend + 1) / 2 // Convert -1,1 to 0,1
  };
  
  // Calculate weighted score
  let score = 0;
  for (const [key, weight] of Object.entries(weights)) {
    score += normalized[key] * weight;
  }
  
  // Scale to 1-100
  return Math.round(Math.max(1, Math.min(100, score * 100)));
}

/**
 * Get risk level from score
 */
export function getRiskLevel(score) {
  if (score < 30) return { level: 'low', label: 'Bajo', color: '#27ae60' };
  if (score < 60) return { level: 'medium', label: 'Medio', color: '#f39c12' };
  if (score < 80) return { level: 'high', label: 'Alto', color: '#e67e22' };
  return { level: 'critical', label: 'Crítico', color: '#e74c3c' };
}

/**
 * Calculate expansion factor based on days and risk
 */
export function calculateExpansionFactor(project, daysFuture, riskScore) {
  const workType = determineWorkType(project);
  const config = WORK_TYPES[workType];
  
  // Base expansion from time
  const timeExpansion = 1 + (config.expansionRate * daysFuture / 30);
  
  // Risk multiplier (higher risk = more expansion)
  const riskMultiplier = 1 + (riskScore / 100) * 0.5;
  
  // Combined expansion, capped at max
  const totalExpansion = Math.min(config.maxExpansion, timeExpansion * riskMultiplier);
  
  return totalExpansion;
}

/**
 * Generate projected polygon coordinates
 */
export function generateProjectedPolygon(baseCoordinates, expansionFactor, project) {
  if (!baseCoordinates || baseCoordinates.length < 3) return null;
  
  const workType = determineWorkType(project);
  const seed = stringToSeed(project.id);
  
  // Calculate centroid
  let centroidLng = 0, centroidLat = 0;
  const n = baseCoordinates.length - 1; // Exclude closing point
  for (let i = 0; i < n; i++) {
    centroidLng += baseCoordinates[i][0];
    centroidLat += baseCoordinates[i][1];
  }
  centroidLng /= n;
  centroidLat /= n;
  
  // Generate expansion direction based on work type
  const rotationAngle = seededRandom(seed) * Math.PI * 2;
  
  // Expand each point
  const expandedCoords = baseCoordinates.map((coord, i) => {
    const [lng, lat] = coord;
    
    // Vector from centroid to point
    const dx = lng - centroidLng;
    const dy = lat - centroidLat;
    
    // Calculate angle from centroid
    const angle = Math.atan2(dy, dx);
    
    // For linear works, expand more along the main axis
    let localExpansion = expansionFactor;
    if (workType === 'linear') {
      const angleDiff = Math.abs(angle - rotationAngle);
      const axialFactor = Math.abs(Math.cos(angleDiff));
      localExpansion = 1 + (expansionFactor - 1) * (0.5 + axialFactor * 0.5);
    }
    
    // Add some irregularity to make it look natural
    const irregularity = 0.9 + seededRandom(seed + i) * 0.2;
    localExpansion *= irregularity;
    
    // Expand point from centroid
    const newLng = centroidLng + dx * localExpansion;
    const newLat = centroidLat + dy * localExpansion;
    
    return [newLng, newLat];
  });
  
  return expandedCoords;
}

/**
 * Get risk color with gradient based on score
 */
export function getRiskColor(score, opacity = 1) {
  if (score < 30) {
    return `rgba(39, 174, 96, ${opacity})`; // Green
  } else if (score < 50) {
    // Green to yellow gradient
    const t = (score - 30) / 20;
    const r = Math.round(39 + (243 - 39) * t);
    const g = Math.round(174 + (156 - 174) * t);
    const b = Math.round(96 + (18 - 96) * t);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  } else if (score < 70) {
    // Yellow to orange gradient
    const t = (score - 50) / 20;
    const r = Math.round(243 + (230 - 243) * t);
    const g = Math.round(156 + (126 - 156) * t);
    const b = Math.round(18 + (34 - 18) * t);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  } else {
    // Orange to red gradient
    const t = Math.min(1, (score - 70) / 30);
    const r = Math.round(230 + (231 - 230) * t);
    const g = Math.round(126 + (76 - 126) * t);
    const b = Math.round(34 + (60 - 34) * t);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
}

/**
 * Get hex color for Mapbox
 */
export function getRiskColorHex(score) {
  if (score < 30) return '#27ae60';
  if (score < 50) return '#f1c40f';
  if (score < 70) return '#e67e22';
  return '#e74c3c';
}

/**
 * Generate full risk prediction for a project at a given future day
 */
export function predictRisk(project, daysFuture = 0) {
  const variables = generateRiskVariables(project, daysFuture);
  const riskScore = calculateRiskScore(variables);
  const riskLevel = getRiskLevel(riskScore);
  const expansionFactor = calculateExpansionFactor(project, daysFuture, riskScore);
  
  return {
    daysFuture,
    variables,
    riskScore,
    riskLevel,
    expansionFactor,
    workType: WORK_TYPES[variables.workType]
  };
}

/**
 * Generate risk timeline for charting
 */
export function generateRiskTimeline(project, maxDays = 180, step = 30) {
  const timeline = [];
  for (let day = 0; day <= maxDays; day += step) {
    const prediction = predictRisk(project, day);
    timeline.push({
      day,
      score: prediction.riskScore,
      expansion: prediction.expansionFactor,
      level: prediction.riskLevel.level
    });
  }
  return timeline;
}

export default {
  determineWorkType,
  generateRiskVariables,
  calculateRiskScore,
  getRiskLevel,
  calculateExpansionFactor,
  generateProjectedPolygon,
  getRiskColor,
  getRiskColorHex,
  predictRisk,
  generateRiskTimeline,
  WORK_TYPES
};

