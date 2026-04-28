const { randomUUID } = require('node:crypto');
const {
  getEmergencyById,
  getAssignableVolunteers,
  createAssignmentAndMarkEmergency,
  getAssignmentById,
  updateAssignmentStatus,
  updateEmergencyStatus
} = require('./dispatch.repository');
const { ApiError } = require('../../utils/apiError');
const { haversineDistanceInKm } = require('../../utils/distance');

const SOS_SKILLS = ['Rescue', 'Medical'];
const CATEGORY_SKILL_MAP = {
  medical: ['Medical'],
  engineering: ['Engineering'],
  food: ['Food & Logistics'],
  mentalhealth: ['Mental Health Support'],
  communication: ['Communication & Coordination'],
  other: ['Rescue']
};

const EXPERIENCE_SCORE = {
  student: 1,
  junior: 2,
  senior: 3,
  expert: 4
};

function normalizeCategory(category = 'other') {
  return category.toLowerCase().replace(/\s+/g, '');
}

function requiredSkillsFor(type, category) {
  if (type === 'SOS') return SOS_SKILLS;
  return CATEGORY_SKILL_MAP[normalizeCategory(category)] || CATEGORY_SKILL_MAP.other;
}

function getEmergencyLocation(emergency) {
  if (emergency.location && typeof emergency.location.lat === 'number' && typeof emergency.location.lng === 'number') {
    return emergency.location;
  }
  if (typeof emergency.latitude === 'number' && typeof emergency.longitude === 'number') {
    return { lat: emergency.latitude, lng: emergency.longitude };
  }
  return null;
}

function computeVolunteerScore(volunteer, emergency, requiredSkills) {
  const lat = volunteer.last_latitude;
  const lng = volunteer.last_longitude;
  const emergencyLocation = getEmergencyLocation(emergency);

  if (typeof lat !== 'number' || typeof lng !== 'number' || !emergencyLocation) {
    return null;
  }

  const distanceKm = haversineDistanceInKm(emergencyLocation.lat, emergencyLocation.lng, lat, lng);
  const skills = Array.isArray(volunteer.skills) ? volunteer.skills : [];
  const skillScore = requiredSkills.some((requiredSkill) =>
    skills.some((volunteerSkill) => volunteerSkill.toLowerCase().startsWith(requiredSkill.toLowerCase()))
  )
    ? 5
    : 0;
  const experienceScore = EXPERIENCE_SCORE[volunteer.experience_level] || 0;

  return {
    volunteer,
    distanceKm,
    totalScore: skillScore + experienceScore - distanceKm / 20
  };
}

function rankVolunteers(volunteers, emergency, requiredSkills) {
  return volunteers
    .map((volunteer) => computeVolunteerScore(volunteer, emergency, requiredSkills))
    .filter(Boolean)
    .sort((a, b) => b.totalScore - a.totalScore || a.distanceKm - b.distanceKm);
}

async function allocateVolunteers(input) {
  const emergency = await getEmergencyById(input.emergencyId);
  if (!emergency) {
    throw new ApiError(404, 'Emergency request not found');
  }
  if (['resolved', 'cancelled'].includes(String(emergency.status || '').toLowerCase())) {
    throw new ApiError(409, 'Cannot allocate volunteer for resolved or cancelled emergency');
  }
  if (Array.isArray(emergency.assigned_volunteer_ids) && emergency.assigned_volunteer_ids.length > 0) {
    throw new ApiError(409, 'Emergency request already has an assigned volunteer');
  }

  const candidates = await getAssignableVolunteers();
  const neededSkills = requiredSkillsFor(emergency.type, emergency.category);
  const ranked = rankVolunteers(candidates, emergency, neededSkills);
  const selected = ranked[0];

  if (!selected) {
    return {
      emergencyId: input.emergencyId,
      status: emergency.status || 'active',
      requiredSkills: neededSkills,
      assignedVolunteer: null
    };
  }

  const now = Date.now();
  const assignmentId = randomUUID();
  const volunteerId = selected.volunteer.user_id || selected.volunteer.id;
  const assignmentPayload = {
    assignment_id: assignmentId,
    emergency_id: input.emergencyId,
    volunteer_id: volunteerId,
    civilian_id: emergency.civilian_id || '',
    status: 'pending',
    created_at: now,
    distance_km: Number(selected.distanceKm.toFixed(2))
  };

  await createAssignmentAndMarkEmergency({
    emergencyId: input.emergencyId,
    assignmentId,
    assignmentPayload,
    volunteerId,
    emergencyStatus: 'assigned'
  });

  return {
    emergencyId: input.emergencyId,
    status: 'assigned',
    requiredSkills: neededSkills,
    assignedVolunteer: {
      assignmentId,
      volunteerId
    }
  };
}

async function respondToAssignment(assignmentId, action, volunteerIdFromToken) {
  const assignment = await getAssignmentById(assignmentId);

  if (!assignment) {
    throw new ApiError(404, 'Assignment not found');
  }

  if (assignment.volunteer_id !== volunteerIdFromToken) {
    throw new ApiError(403, 'You are not allowed to update this assignment');
  }

  await updateAssignmentStatus(assignmentId, action);

  if (action === 'accepted') {
    await updateEmergencyStatus(assignment.emergency_id, 'assigned');
  } else if (action === 'declined') {
    await updateEmergencyStatus(assignment.emergency_id, 'active');
  }

  return {
    assignmentId,
    status: action,
    emergencyId: assignment.emergency_id
  };
}

module.exports = {
  allocateVolunteers,
  respondToAssignment
};
