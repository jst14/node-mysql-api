import express from 'express';
const router = express.Router();
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';

// Use absolute path that works in both dev and Vercel
const swaggerPath = path.join(process.cwd(), 'swagger.yaml');
const swaggerDocument = YAML.load(swaggerPath);

router.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

export default router;