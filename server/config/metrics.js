import client from "prom-client";

// 1. Create a Registry to collect metrics
const register = new client.Registry();

// 2. Set default labels for all metrics
register.setDefaultLabels({
  app: "11jersey-api",
});

// 3. Collect default metrics (memory, CPU usage, etc.)
client.collectDefaultMetrics({ register });

// 4. Create a custom metric: HTTP Request Counter
const httpRequestCounter = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"], // Dimensions to track
  registers: [register], // Add it to our registry
});

// 5. Create a custom metric: HTTP Request Duration Histogram
const httpRequestDurationMicroseconds = new client.Histogram({
  name: "http_request_duration_ms",
  help: "Duration of HTTP requests in ms",
  labelNames: ["method", "route", "status_code"],
  // Define buckets for response times (in milliseconds)
  buckets: [50, 100, 200, 300, 400, 500, 1000, 2000],
  registers: [register],
});

export { register, httpRequestCounter, httpRequestDurationMicroseconds };
