# Inttegro TypeScript SDK

[![npm](https://img.shields.io/npm/v/%40inttegro%2Finttegro-sdk?label=npm&logo=npm)](https://www.npmjs.com/package/@inttegro/inttegro-sdk)
[![weekly downloads](https://img.shields.io/npm/dw/%40inttegro%2Finttegro-sdk?label=downloads&logo=npm)](https://www.npmjs.com/package/@inttegro/inttegro-sdk)
[![CI](https://github.com/inttegro/inttegro-sdk-typescript/actions/workflows/ci.yml/badge.svg)](https://github.com/inttegro/inttegro-sdk-typescript/actions/workflows/ci.yml)
[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/inttegro/inttegro-sdk-typescript/badge)](https://scorecard.dev/viewer/?uri=github.com/inttegro/inttegro-sdk-typescript)

The official TypeScript client for building server-side Inttegro integrations.

[Try the live Next.js checkout](https://nextjs-demo.inttegro.dev) ·
[Browse every live demo](https://demos.inttegro.dev) ·
[Read the integration guide](https://studio.inttegro.com/sdks/typescript) ·
[Open the API documentation](https://typescript.inttegro.dev/)

Use it when your trusted Node.js, Bun, or Deno service needs to:

- create and manage checkout, orders, and purchase intents;
- work with payments, payment methods, refunds, and payouts;
- manage customers, products, prices, files, and other Inttegro resources; and
- keep retries, idempotency, errors, telemetry, and API evolution explicit.

If this SDK helps your integration, [star the repository](https://github.com/inttegro/inttegro-sdk-typescript) so other developers can find it.

## See it working

These production-shaped applications use this SDK against the same public API:

| Stack | Live checkout | Source |
| --- | --- | --- |
| Next.js | [Open Kora Market](https://nextjs-demo.inttegro.dev) | [View the integration](https://github.com/inttegro/inttegro-demos/tree/main/nextjs) |
| Express | [Open Afterglow Sessions](https://express-demo.inttegro.dev) | [View the integration](https://github.com/inttegro/inttegro-demos/tree/main/express) |
| Nuxt | [Open Kora Market](https://nuxt-demo.inttegro.dev) | [View the integration](https://github.com/inttegro/inttegro-demos/tree/main/nuxt) |
| NestJS | [Open Openfield](https://nestjs-demo.inttegro.dev) | [View the integration](https://github.com/inttegro/inttegro-demos/tree/main/nestjs) |
| RedwoodSDK | [Open Openfield](https://redwoodsdk-demo.inttegro.dev) | [View the integration](https://github.com/inttegro/inttegro-demos/tree/main/redwoodsdk) |
| Astro | [Open Openfield](https://astro-demo.inttegro.dev) | [View the integration](https://github.com/inttegro/inttegro-demos/tree/main/astro) |

## Install

Requires Node.js 24 or newer.

```bash
npm install @inttegro/inttegro-sdk
```

Store your secret key in the server environment:

```bash
export INTTEGRO_API_KEY="your_secret_key"
```

Never put the key in browser code, a mobile app, or source control. The client uses `https://api.inttegro.com` by default.

## Create a hosted checkout

Create and finalize an order, then send the customer to its hosted invoice URL:

```ts
import { Currencies, InttegroClient, InttegroAPIError, ProductTypes } from '@inttegro/inttegro-sdk';

const inttegro = new InttegroClient({
  apiKey: process.env.INTTEGRO_API_KEY!,
});

try {
  const order = await inttegro.orders.create({
    requestMeta: { idempotencyKey: 'checkout-cart-123' },
    customerData: {
      name: 'Akua Mensah',
      emailAddress: 'akua@example.com',
      phoneNumber: '+233544998605',
    },
    finalize: true,
    checkoutSettings: {
      redirectUrl: 'https://example.com/orders/complete',
      cancelUrl: 'https://example.com/cart',
    },
    lineItems: [
      {
        type: 'product',
        product: {
          type: ProductTypes.Digital,
          name: 'Monthly subscription',
          quantity: 1,
          price: { currency: Currencies.GHS, value: 5000 },
        },
      },
    ],
  });

  const checkoutUrl = order.invoice?.format?.web?.url;
  if (!checkoutUrl) throw new Error('Order did not include a checkout URL');
  console.log(order.id, checkoutUrl);
} catch (error) {
  if (error instanceof InttegroAPIError) {
    console.error(error.code, error.detail ?? error.message);
  }
  throw error;
}
```

Amounts use integer minor units: `5000` GHS is GHS 50.00. Reuse the same idempotency key when retrying the same logical write. If you omit one, the SDK generates a UUIDv7 key for mutating calls.

## Prefer agent-assisted integration?

Connect an agent to [Inttegro MCP](https://studio.inttegro.com/inttegro-mcp) at
`https://mcp.inttegro.com`, then ask it to run `design_integration`. It returns
an implementation and test plan for your application before you connect the
plan to this SDK.

## Observe SDK operations

The SDK emits vendor-neutral OpenTelemetry spans through your application's provider. It never configures an exporter or sends telemetry by itself. Configure OpenTelemetry at application startup; the global provider is used automatically, or you can pass a provider explicitly:

```ts
const inttegro = new InttegroClient({
  apiKey: process.env.INTTEGRO_API_KEY!,
  telemetry: { tracerProvider },
});
```

Spans are named after logical operations such as `inttegro.orders.create`. HTTP attempts, retries, response receipt, and decoding are span events. API keys, bodies, resource IDs, dynamic URLs, and exception messages are never recorded. See [SDK observability](https://studio.inttegro.com/sdk-observability) for the complete contract and disable tracing with `telemetry: { enabled: false }` when needed.

### Report SDK failures

Provide an application-owned reporter to receive one typed, privacy-safe report after an SDK operation finally fails. The default `unexpected` policy reports transport, timeout, decoding, SDK, `unknown_error`, and server-side failures while leaving normal 4xx API errors alone:

```ts
const inttegro = new InttegroClient({
  apiKey: process.env.INTTEGRO_API_KEY!,
  errorReporting: {
    reporter: (report) => errorCollector.enqueue(report),
  },
});
```

Use `policy: 'all'` to include expected API failures; cancellations are never reported. Reports contain the logical operation, static route, server host, status and request IDs when available, duration, safe API error codes, SDK identity, stable fingerprint, exception type, and trace IDs when tracing is active. They exclude credentials, headers, bodies, resource IDs, dynamic URLs, exception messages, and stack traces. Reporter failures are isolated and the original SDK error is still thrown.

Error reporting is completely opt-in. Without `errorReporting`, the SDK does not calculate report metadata, create an event ID or timestamp, allocate a report, or serialize a payload.

## Work with the API

The SDK covers orders and checkout, customers, products and prices, purchase intents, payment methods, balances, payouts and refunds, notifications, files, application settings, keys, and country specifications. Resources use camelCase properties such as `purchaseIntents` and `paymentMethods`.

TypeScript-specific features:

- Typed request and domain objects, plus exported constants for public enum values.
- Idiomatic camelCase fields throughout; the SDK translates to and from the API's snake_case JSON at the HTTP boundary.
- Promise-based resource methods with ESM and CommonJS builds.
- Platform `fetch` transport with the lightweight OpenTelemetry API for application-owned tracing.
- Configurable timeouts, exponential retries, debug logging, and request/response interceptors.
- Injectable configuration and interceptors for tests and observability.

See the [API reference](https://studio.inttegro.com/api-reference) for request fields and lifecycle rules, [errors](https://studio.inttegro.com/errors) for recovery guidance, and [idempotency](https://studio.inttegro.com/idempotency) for safe retries.

## Verify a release

The GitHub release for each version is the canonical record. It contains the exact npm tarball, its file list, SHA-256 checksums, and a Sigstore attestation tied to the source commit and release workflow. The npm package also includes the TypeScript source and source maps.

```bash
sha256sum --check SHA256SUMS
gh attestation verify inttegro-inttegro-sdk-11.2.3.tgz \
  --repo inttegro/inttegro-sdk-typescript
```

## Develop

```bash
npm ci
npm run typecheck
npm test
```
