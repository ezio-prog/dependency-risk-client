import { Hono } from "hono";

import {
  x402Client,
} from "@x402/core/client";

import {
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

  const rawKey =
    c.env.CLIENT_PRIVATE_KEY;

  if (!rawKey) {
    return c.json(
      {
        error:
          "CLIENT_PRIVATE_KEY secret is not configured."
      },
      500
    );
  }


  try {

    // Accept either:
    // 64 hexadecimal characters
    // OR
    // 0x + 64 hexadecimal characters

    let privateKey =
      String(rawKey).trim();

    if (!privateKey.startsWith("0x")) {
      privateKey =
        "0x" + privateKey;
    }


    if (
      !/^0x[0-9a-fA-F]{64}$/.test(
        privateKey
      )
    ) {
      return c.json(
        {
          error:
            "CLIENT_PRIVATE_KEY has an invalid format. It must contain exactly 64 hexadecimal characters, optionally preceded by 0x."
        },
        500
      );
    }


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


    const fetchWithPayment =
      wrapFetchWithPayment(
        fetch,
        client
      );


    const response =
      await fetchWithPayment(
        API,
        {
          method: "GET",
        }
      );


    const body =
      await response.text();


    return c.json({
      payer:
        account.address,

      target:
        API,

      status:
        response.status,

      paid:
        response.ok,

      body,
    });


  } catch (error) {

    console.error(
      "x402 payment error:",
      error
    );


    return c.json(
      {
        error:
          "x402 payment failed.",

        details:
          String(error)
      },
      500
    );
  }
});


app.get("/health", (c) => {

  return c.json({
    status:
      "healthy",

    service:
      "dependency-risk-client"
  });

});


export default app;
