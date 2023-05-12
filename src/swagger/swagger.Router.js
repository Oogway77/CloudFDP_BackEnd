const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const { Router } = require('express');

const router = new Router();
const swaggerDoc = YAML.load(`${__dirname}/swagger.yaml`);
router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(swaggerDoc));

module.exports = router;