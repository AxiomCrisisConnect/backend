const { db } = require('../../config/firebase');
const { COLLECTIONS } = require('../../constants/collections');

async function createEmergencyRequest(emergencyId, payload) {
  const emergencyRef = db.collection(COLLECTIONS.EMERGENCY_REQUESTS).doc(emergencyId);
  await emergencyRef.set(payload);
  return { id: emergencyId, ...payload };
}

module.exports = { createEmergencyRequest };
