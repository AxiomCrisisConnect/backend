const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const YAML = require('yamljs');
const swaggerUi = require('swagger-ui-express');

const { healthRouter } = require('./modules/health/health.routes');
const { dispatchRouter } = require('./modules/dispatch/dispatch.routes');
const { emergencyRouter } = require('./modules/emergency/emergency.routes');
const { notFound } = require('./middlewares/notFound');
const { errorHandler } = require('./middlewares/errorHandler');

const app = express();
const openApiDocument = YAML.load(path.join(__dirname, 'docs/openapi.yaml'));
const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204
};

app.use(helmet());
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));

app.use('/api/v1/health', healthRouter);
app.use('/api/v1/dispatch', dispatchRouter);
app.use('/api/v1/emergencies', emergencyRouter);

app.use(notFound);
app.use(errorHandler);

module.exports = { app };
