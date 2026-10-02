import { Hono } from "hono";

import {
  x402Client,
  wrapFetchWithPayment,
} from "@x402/fetch";

import {
  ExactEvmScheme,
} from "@x402/evm";

import {
  privateKeyToAccount,
} from "viem/accounts";


const app = new Hono();


const API =
  "https://dependency-risk-gateway.giraffehorse.workers.dev/check-package?package=requests&ecosystem=PyPI&version=2.31.0";


app.get("/", async (c) => {

  const rawKey = c.env.CLIENT_PRIVATE_KEY;

  if (!rawKey) {
    return c.json(
      {
        error: "CLIENT_PRIVATE_KEY secret is missing."
      },
      500
    );
  }

  try {

    let key = String(rawKey).trim();

    if (!key.startsWith("0x")) {
      key = "0x" + key;
    }

    if (!/^0x[0-9a-fA-F]{64}$/.test(key)) {
      return c.json(
        {
          error:
            "CLIENT_PRIVATE_KEY must be 0x followed by exactly 64 hexadecimal characters."
        },
        500
      );
    }


    const account =
      privateKeyToAccount(
        key as `0x${string}`
      );


    const client =
      new x402Client();


    client.register(
      "eip155:84532",
      new ExactEvmScheme(account)
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
          method: "GET"
        }
      );


    const body =
      await response.text();


    return c.json({
      payer: account.address,
      status: response.status,
      paid: response.ok,
      body
    });


  } catch (error) {

    console.error(
      "x402 error:",
      error
    );

    return c.json(
      {
        error: "x402 payment failed.",
        details: String(error)
      },
      500
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
