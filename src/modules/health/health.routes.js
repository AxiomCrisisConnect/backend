const { Router } = require('express');

const healthRouter = Router();

healthRouter.get('/', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'CrisisConnect backend is healthy'
  });
});

module.exports = { healthRouter };
