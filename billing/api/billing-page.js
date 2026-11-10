const HTML = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <meta name="theme-color" content="#10100f" />
    <meta name="description" content="R.S.D. private billing workspace." />
    <link rel="icon" type="image/png" href="/rsd-favicon.png" />
    <link rel="stylesheet" href="/assets/index.css" />
    <title>R.S.D. Billing Workspace</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/assets/app.js"></script>
  </body>
</html>`;

export default function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).send("Method not allowed.");
    return;
  }
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(HTML);
}
