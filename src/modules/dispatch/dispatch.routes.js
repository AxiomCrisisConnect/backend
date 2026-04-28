const { Router } = require('express');
const { asyncHandler } = require('../../utils/asyncHandler');
const { authenticate } = require('../../middlewares/authenticate');
const { allocateExistingEmergency, respondAssignment } = require('./dispatch.controller');

const dispatchRouter = Router();

dispatchRouter.post('/emergencies/allocate', authenticate, asyncHandler(allocateExistingEmergency));
dispatchRouter.post('/assignments/:assignmentId/respond', authenticate, asyncHandler(respondAssignment));

module.exports = { dispatchRouter };
