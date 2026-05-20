import express from 'express';
import YAML from 'yamljs';
import path from 'path';

const router = express.Router();

const swaggerPath = path.join(process.cwd(), 'swagger.yaml');
const swaggerDocument = YAML.load(swaggerPath);

// Serve the swagger spec as JSON (Swagger UI will fetch this)
router.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerDocument);
});

// Serve Swagger UI via CDN — no static file dependency on Vercel
router.get('/', (req, res) => {
  const specUrl = '/api-docs/swagger.json';
  res.setHeader('Content-Type', 'text/html');
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>API Docs</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    SwaggerUIBundle({
      url: '${specUrl}',
      dom_id: '#swagger-ui',
      presets: [SwaggerUIBundle.presets.apis, SwaggerUIBundle.SwaggerUIStandalonePreset],
      layout: 'BaseLayout',
      deepLinking: true,
    });
  </script>
</body>
</html>`);
});

export default router;