const { ZodError } = require('zod');
const { allocateEmergencySchema, assignmentResponseSchema } = require('./dispatch.validation');
const { allocateVolunteers, respondToAssignment } = require('./dispatch.service');
const { ApiError } = require('../../utils/apiError');

async function allocateExistingEmergency(req, res) {
  try {
    const payload = allocateEmergencySchema.parse(req.body);
    const result = await allocateVolunteers(payload);

    res.status(200).json({
      success: true,
      message: 'Volunteer allocation attempted for existing emergency request',
      data: result
    });
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ApiError(400, 'Invalid request payload', error.issues);
    }
    throw error;
  }
}

async function respondAssignment(req, res) {
  try {
    const { action } = assignmentResponseSchema.parse(req.body);
    const volunteerId = req.user.uid;
    const result = await respondToAssignment(req.params.assignmentId, action, volunteerId);

    res.status(200).json({
      success: true,
      message: `Assignment ${action}`,
      data: result
    });
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ApiError(400, 'Invalid request payload', error.issues);
    }
    throw error;
  }
}

module.exports = {
  allocateExistingEmergency,
  respondAssignment
};
