import express from 'express';
import YAML from 'yamljs';
import path from 'path';

const router = express.Router();

const swaggerPath = path.join(process.cwd(), 'swagger.yaml');
const swaggerDocument = YAML.load(swaggerPath);

router.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerDocument);
});

router.get('/', (req, res) => {
  const specUrl = '/api-docs/swagger.json';
  res.setHeader('Content-Type', 'text/html');
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Node.js & MySQL - API</title>
  <link rel="icon" type="image/png" href="https://unpkg.com/swagger-ui-dist@5/favicon-32x32.png" sizes="32x32" />
  <link rel="icon" type="image/png" href="https://unpkg.com/swagger-ui-dist@5/favicon-16x16.png" sizes="16x16" />
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
  <style>
    /* ── Base dark background ── */
    body, .swagger-ui { background: #1a1a2e; color: #e0e0e0; }

    /* ── Custom topbar ── */
    #custom-topbar {
      display: flex;
      align-items: center;
      background: #1b1b1b;
      border-bottom: 2px solid #49cc90;
      padding: 10px 20px;
      gap: 12px;
    }
    #custom-topbar img {
      height: 40px;
      width: auto;
    }
    #custom-topbar .topbar-title {
      color: #49cc90;
      font-size: 1.1rem;
      font-weight: 600;
      font-family: sans-serif;
    }
    #custom-topbar .topbar-sub {
      color: #888;
      font-size: 0.7rem;
      font-family: sans-serif;
      margin-top: 2px;
    }

    /* ── Hide Swagger's built-in topbar (we have our own) ── */
    .swagger-ui .topbar { display: none !important; }

    /* ── Info section ── */
    .swagger-ui .info .title,
    .swagger-ui .info p,
    .swagger-ui .info a { color: #e0e0e0; }

    /* ── Scheme container ── */
    .swagger-ui .scheme-container { background: #16213e; box-shadow: none; border-bottom: 1px solid #0f3460; }

    /* ── Section headings ── */
    .swagger-ui .opblock-tag { color: #a0c4ff; border-bottom: 1px solid #0f3460; }
    .swagger-ui .opblock-tag:hover { background: #16213e; }

    /* ── Operation blocks ── */
    .swagger-ui .opblock { background: #16213e; border-color: #0f3460; border-radius: 6px; margin-bottom: 6px; }
    .swagger-ui .opblock .opblock-summary { background: transparent; }
    .swagger-ui .opblock .opblock-summary-description { color: #b0b0c0; }
    .swagger-ui .opblock.opblock-post   { border-left: 4px solid #49cc90; background: #0d2b1d; }
    .swagger-ui .opblock.opblock-get    { border-left: 4px solid #61affe; background: #0d1f3c; }
    .swagger-ui .opblock.opblock-put    { border-left: 4px solid #fca130; background: #2b1d0d; }
    .swagger-ui .opblock.opblock-delete { border-left: 4px solid #f93e3e; background: #2b0d0d; }

    /* ── Expanded opblock body ── */
    .swagger-ui .opblock-body,
    .swagger-ui .opblock-section { background: #12122a; }
    .swagger-ui .opblock-description-wrapper p,
    .swagger-ui .opblock-external-docs-wrapper p,
    .swagger-ui .opblock-section-header h4,
    .swagger-ui table thead tr td,
    .swagger-ui table thead tr th,
    .swagger-ui .response-col_status,
    .swagger-ui .response-col_description,
    .swagger-ui .parameter__name,
    .swagger-ui .parameter__type,
    .swagger-ui label { color: #c0c0d8; }

    /* ── Tables ── */
    .swagger-ui table tbody tr:nth-child(odd)  { background: #16163a; }
    .swagger-ui table tbody tr:nth-child(even) { background: #12122a; }
    .swagger-ui table tbody tr td { border-color: #0f3460; color: #c0c0d8; }

    /* ── Inputs & textareas ── */
    .swagger-ui input[type=text],
    .swagger-ui input[type=email],
    .swagger-ui input[type=password],
    .swagger-ui textarea,
    .swagger-ui select {
      background: #0d0d1f;
      color: #e0e0e0;
      border: 1px solid #0f3460;
      border-radius: 4px;
    }

    /* ── Buttons ── */
    .swagger-ui .btn { border-radius: 4px; }
    .swagger-ui .btn.execute   { background: #0f3460; color: #fff; border-color: #0f3460; }
    .swagger-ui .btn.authorize { background: #0f3460; color: #49cc90; border-color: #49cc90; }
    .swagger-ui .btn.cancel    { background: #2b0d0d; border-color: #f93e3e; color: #f93e3e; }

    /* ── Response body ── */
    .swagger-ui .highlight-code pre,
    .swagger-ui .microlight { background: #0d0d1f !important; color: #a0e0b0 !important; border-radius: 4px; }

    /* ── Model / schema boxes ── */
    .swagger-ui section.models { background: #16213e; border: 1px solid #0f3460; border-radius: 6px; }
    .swagger-ui section.models h4 { color: #a0c4ff; }
    .swagger-ui .model-box { background: #12122a; }
    .swagger-ui .model { color: #c0c0d8; }

    /* ── Markdown & misc text ── */
    .swagger-ui .markdown p,
    .swagger-ui .markdown li { color: #b0b0c0; }
    .swagger-ui .servers > label { color: #c0c0d8; }
    .swagger-ui .servers select { background: #0d0d1f; color: #e0e0e0; border-color: #0f3460; }
  </style>
</head>
<body>

  <!-- Custom Topbar -->
  <div id="custom-topbar">
    <img src="https://unpkg.com/swagger-ui-dist@5/favicon-32x32.png" alt="Swagger" />
    <div>
      <div class="topbar-title">Node.js Sign-up and Verification API</div>
      <div class="topbar-sub">Supported by SMARTBEAR</div>
    </div>
  </div>

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