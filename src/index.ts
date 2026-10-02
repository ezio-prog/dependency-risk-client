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

  const privateKey =
    c.env.CLIENT_PRIVATE_KEY;


  if (!privateKey) {
    return c.json(
      {
        error:
          "CLIENT_PRIVATE_KEY secret is not configured."
      },
      500
    );
  }


  try {

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
        networks: [
          "eip155:84532"
        ]
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
          method: "GET"
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

      body
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
