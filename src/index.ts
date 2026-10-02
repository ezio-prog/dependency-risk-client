import { Hono } from "hono";

const app = new Hono();

const API =
  "https://dependency-risk-gateway.giraffehorse.workers.dev/check-package?package=requests&ecosystem=PyPI&version=2.31.0";

app.get("/", async (c) => {
  const response = await fetch(API);

  const body = await response.text();

  return c.json({
    status: response.status,
    body: body
  });
});

export default app;
