const { ZodError } = require('zod');
const { createEmergencySchema } = require('./emergency.validation');
const { createEmergency } = require('./emergency.service');
const { ApiError } = require('../../utils/apiError');

async function createEmergencyHandler(req, res) {
  try {
    const payload = createEmergencySchema.parse(req.body);
    const result = await createEmergency(payload);

    res.status(201).json({
      success: true,
      message: 'Emergency request created successfully',
      data: result
    });
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ApiError(400, 'Invalid request payload', error.issues);
    }
    throw error;
  }
}

module.exports = { createEmergencyHandler };
