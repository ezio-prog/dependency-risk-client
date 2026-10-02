import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => {
  const raw = c.env.CLIENT_PRIVATE_KEY;

  if (!raw) {
    return c.json({
      secret_exists: false,
      error: "CLIENT_PRIVATE_KEY is missing"
    }, 500);
  }

  const key = String(raw).trim();

  return c.json({
    secret_exists: true,
    length: key.length,
    starts_with_0x: key.startsWith("0x"),
    hex_after_0x: key.startsWith("0x")
      ? /^[0-9a-fA-F]{64}$/.test(key.slice(2))
      : /^[0-9a-fA-F]{64}$/.test(key),
    first_character: key.charAt(0),
    last_character: key.charAt(key.length - 1)
  });
});

app.get("/health", (c) => {
  return c.json({
    status: "healthy"
  });
});

export default app;
