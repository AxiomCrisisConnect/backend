const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const YAML = require('yamljs');
const swaggerUi = require('swagger-ui-express');

const { healthRouter } = require('./modules/health/health.routes');
const { dispatchRouter } = require('./modules/dispatch/dispatch.routes');
const { notFound } = require('./middlewares/notFound');
const { errorHandler } = require('./middlewares/errorHandler');

const app = express();
const openApiDocument = YAML.load(path.join(__dirname, 'docs/openapi.yaml'));

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));

app.use('/api/v1/health', healthRouter);
app.use('/api/v1/dispatch', dispatchRouter);

app.use(notFound);
app.use(errorHandler);

module.exports = { app };
