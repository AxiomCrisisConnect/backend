const { Router } = require('express');
const { asyncHandler } = require('../../utils/asyncHandler');
const { createEmergencyHandler } = require('./emergency.controller');

const emergencyRouter = Router();

emergencyRouter.post('/', asyncHandler(createEmergencyHandler));

module.exports = { emergencyRouter };
