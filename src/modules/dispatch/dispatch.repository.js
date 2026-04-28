const { db } = require('../../config/firebase');
const { COLLECTIONS } = require('../../constants/collections');

async function getActiveEmergencyByCivilianId(civilianId) {
  const snapshot = await db
    .collection(COLLECTIONS.EMERGENCY_REQUESTS)
    .where('civilian_id', '==', civilianId)
    .where('status', 'in', ['active', 'assigned'])
    .limit(1)
    .get();

  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() };
}

async function getEmergencyById(emergencyId) {
  const doc = await db.collection(COLLECTIONS.EMERGENCY_REQUESTS).doc(emergencyId).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
}

async function getAssignableVolunteers() {
  const snapshot = await db
    .collection(COLLECTIONS.VOLUNTEER_PROFILES)
    .where('is_available', '==', true)
    .where('onboarding_complete', '==', true)
    .get();

  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

async function createAssignmentAndMarkEmergency({
  emergencyId,
  assignmentId,
  assignmentPayload,
  volunteerId,
  emergencyStatus
}) {
  const batch = db.batch();
  const emergencyRef = db.collection(COLLECTIONS.EMERGENCY_REQUESTS).doc(emergencyId);
  const assignmentRef = db.collection(COLLECTIONS.ASSIGNMENTS).doc(assignmentId);
  batch.set(assignmentRef, assignmentPayload);

  batch.update(emergencyRef, {
    status: emergencyStatus,
    assigned_volunteer_ids: [volunteerId]
  });

  await batch.commit();
}

async function getAssignmentById(assignmentId) {
  const doc = await db.collection(COLLECTIONS.ASSIGNMENTS).doc(assignmentId).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
}

async function updateAssignmentStatus(assignmentId, status) {
  const assignmentRef = db.collection(COLLECTIONS.ASSIGNMENTS).doc(assignmentId);
  const payload = { status };

  if (status === 'accepted') payload.accepted_at = Date.now();
  if (status === 'declined') payload.declined_at = Date.now();

  await assignmentRef.update(payload);
}

async function updateEmergencyStatus(emergencyId, status) {
  await db.collection(COLLECTIONS.EMERGENCY_REQUESTS).doc(emergencyId).update({ status });
}

module.exports = {
  getActiveEmergencyByCivilianId,
  getEmergencyById,
  getAssignableVolunteers,
  createAssignmentAndMarkEmergency,
  getAssignmentById,
  updateAssignmentStatus,
  updateEmergencyStatus
};
