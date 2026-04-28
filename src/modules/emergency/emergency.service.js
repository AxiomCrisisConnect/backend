const { randomUUID } = require('node:crypto');
const { createEmergencyRequest } = require('./emergency.repository');

async function createEmergency(input) {
  const emergencyId = randomUUID();
  const now = Date.now();
  
  const payload = {
    category: input.category,
    civilian_id: input.civilian_id,
    description: input.description || '',
    emergency_id: emergencyId,
    location: input.location,
    priority: input.priority || 'high',
    status: 'active',
    type: input.type,
    created_at: now,
    updated_at: now
  };

  return await createEmergencyRequest(emergencyId, payload);
}

module.exports = { createEmergency };
