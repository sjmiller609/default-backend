import "@babel/polyfill";
import express from "express";
import morgan from "morgan";
import { includes } from "lodash";

// Create express server.
const app = express();

// Set up HTTP request logging.
app.use(
  morgan(process.env.NODE_ENV === "development" ? "dev" : "short", {
    stream: { write: msg => console.log(msg.trim()) }
  })
);

// Set up static dir (helps in dev).
app.use(express.static(`${__dirname}/static`));

// Setup healtcheck endpoin.
app.get("/healthz", function(req, res) {
  res.status(200).send({});
});

// Set up the default route.
// All requests are sent here from the ingress controller.
app.get("*", function(req, res) {
  console.log(req.headers);

  // Get some headers.
  const code = req.get("x-code");
  const ingress = req.get("x-ingress-name");

  // If we're erroring from an airflow deployment.
  if (code && includes(ingress, "airflow-ingress")) {
    return res
      .status(code)
      .sendFile(`${__dirname}/static/airflow-${code}.html`);
  }

  // Default back to standard 404 page.
  return res.status(404).sendFile(`${__dirname}/static/404.html`);
});

// Start the server.
app.listen(8080, () => console.log("Serving default backend..."));
