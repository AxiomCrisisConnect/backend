const { Router } = require('express');
const { asyncHandler } = require('../../utils/asyncHandler');
const { allocateExistingEmergency, respondAssignment } = require('./dispatch.controller');

const dispatchRouter = Router();

dispatchRouter.post('/emergencies/allocate', asyncHandler(allocateExistingEmergency));
dispatchRouter.post('/assignments/:assignmentId/respond', asyncHandler(respondAssignment));

module.exports = { dispatchRouter };
