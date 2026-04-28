const { z } = require('zod');

const createEmergencySchema = z.object({
  category: z.string().min(1),
  civilian_id: z.string().min(1),
  description: z.string().optional(),
  location: z.object({
    geohash: z.string().optional(),
    lat: z.number(),
    lng: z.number()
  }),
  priority: z.string().optional().default('high'),
  type: z.string().min(1)
});

module.exports = { createEmergencySchema };
