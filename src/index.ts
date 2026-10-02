import { Hono } from "hono";

const app = new Hono();

const API =
  "https://dependency-risk-gateway.giraffehorse.workers.dev/check-package?package=requests&ecosystem=PyPI&version=2.31.0";

app.get("/", async (c) => {
  const response = await fetch(API);

  return c.json({
    status: response.status,
    payment_required:
      response.status === 402,
    headers: Object.fromEntries(
      response.headers.entries()
    ),
  });
});

export default app;
