const { z } = require('zod');

const allocateEmergencySchema = z.object({
  emergencyId: z.string().min(1)
});

const assignmentResponseSchema = z.object({
  action: z.enum(['accepted', 'declined'])
});

module.exports = { allocateEmergencySchema, assignmentResponseSchema };
