import { Hono } from "hono";

import {
  x402Client,
  wrapFetchWithPayment,
} from "@x402/fetch";

import {
  registerExactEvmScheme,
} from "@x402/evm/exact/client";

import {
  privateKeyToAccount,
} from "viem/accounts";

const app = new Hono();

const API =
  "https://dependency-risk-gateway.giraffehorse.workers.dev/check-package?package=requests&ecosystem=PyPI&version=2.31.0";

app.get("/", async (c) => {
  try {
    const rawKey = String(
      c.env.CLIENT_PRIVATE_KEY || ""
    ).trim();

    if (!rawKey) {
      return c.json({
        error: "CLIENT_PRIVATE_KEY is missing"
      }, 500);
    }

    const privateKey =
      rawKey.startsWith("0x")
        ? rawKey
        : `0x${rawKey}`;

    const account =
      privateKeyToAccount(
        privateKey as `0x${string}`
      );

    const client =
      new x402Client();

    registerExactEvmScheme(
      client,
      {
        signer: account,
      }
    );

    const paidFetch =
      wrapFetchWithPayment(
        fetch,
        client
      );

    const response =
      await paidFetch(
        API,
        {
          method: "GET",
        }
      );

    const body =
      await response.text();

    return new Response(
      body,
      {
        status: response.status,
        headers: {
          "Content-Type":
            response.headers.get(
              "Content-Type"
            ) ||
            "application/json",
        },
      }
    );

  } catch (error) {
    console.error(
      "x402 payment error:",
      error
    );

    return c.json({
      error: "x402 payment failed.",
      details: String(error)
    }, 500);
  }
});

app.get("/health", (c) => {
  return c.json({
    status: "healthy"
  });
});

export default app;
