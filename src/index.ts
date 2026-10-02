import { Hono } from "hono";

const app = new Hono();

const API =
  "https://dependency-risk-gateway.giraffehorse.workers.dev/check-package?package=requests&ecosystem=PyPI&version=2.31.0";

app.get("/", async (c) => {
  try {
    const response = await fetch(API);

    const headers: Record<string, string> = {};

    response.headers.forEach((value, key) => {
      headers[key] = value;
    });

    const body = await response.text();

    return c.json({
      target: API,
      status: response.status,
      payment_required: response.status === 402,
      headers,
      body
    });
  } catch (error) {
    return c.json(
      {
        error: "Failed to contact DependencyRisk Gateway.",
        details: String(error)
      },
      502
    );
  }
});

app.get("/health", (c) => {
  return c.json({
    status: "healthy",
    service: "dependency-risk-client"
  });
});

export default app;
