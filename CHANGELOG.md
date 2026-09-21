# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [10.1.0] - 2026-09-21

- Added typed search across customers, financial accounts, orders, payouts, and
  products, including filters, facets, sorting, cursor pagination, totals, and
  freshness metadata.
- Added typed verification purposes for OTP initiation requests.

## [10.0.0] - 2026-09-14

- **Breaking:** replaced payout records and generic payloads with named request,
  response, settings, page, error, and destination types.
- Made `ghs` the explicit supported payout-destination field and exposed payout
  timestamps as `Date` values.
- Removed server-internal purchase-intent activity response models and exposed
  refund order and cancellation context.

## [9.0.4] - 2026-09-12

- Restored npm release publishing through the existing automation token while
  npm trusted publisher setup is blocked on account-level 2FA.
- Corrected the runtime SDK version used for telemetry and the User-Agent
  header to match the published package version.

## [9.0.3] - 2026-09-12

- Added opt-in response envelopes that expose status, headers, request IDs,
  retry hints, and response metadata without changing existing resource return
  values.
- Added fluent domain helpers for common resource state and actionability checks.

## [9.0.2] - 2026-09-10

- Added the complete typed file-link access request and response fields.
- Added a separate partial owner shape for payment-method updates.

## [9.0.1] - 2026-09-10

- Switched release publication to npm trusted publishing with short-lived OIDC credentials.

## [9.0.0] - 2026-09-10

- **Breaking:** replaced generic object maps with named models for balances, purchase intents, products, payment methods, payments, and orders.
- **Breaking:** exposed API timestamps as `Date` values and accepted `Date` values for timestamp request fields.
- Preserved opaque application metadata without interpreting timestamp-like keys inside it.

## [8.2.0] - 2026-09-06

- Added opt-in, typed error reporting to application-owned collectors with privacy-safe payloads, stable fingerprints, isolated reporter failures, and no reporting work when unconfigured.

## [8.1.0] - 2026-09-04

- Added vendor-neutral OpenTelemetry spans for logical SDK operations, HTTP attempts, retries, response receipt, decoding, and safe failure categories.
- Added W3C trace-context propagation with explicit-header preservation and configurable tracer providers.
- Kept request bodies, credentials, resource identifiers, dynamic URLs, and exception details out of telemetry.

## [8.0.0] - 2026-09-04

- **Breaking:** renamed every public request and domain property from API wire-format snake case to idiomatic TypeScript camel case.
- Added recursive request serialization and response deserialization at the HTTP boundary while preserving user-defined keys in opaque maps such as `customData`.
- Updated examples and validation errors to use the same camelCase public names.

## [7.0.0] - 2026-09-03

- **Breaking:** moved financial-account wallet types into the `wallets` module.
- **Breaking:** moved financial-account bank types into the `bank-accounts` module.
- Added `wallets` and `bankAccounts` namespace exports from the package root.

## [6.1.0] - 2026-09-03

- Moved runtime enum constants into their owning domain modules and removed the internal catch-all `api-enums` module.
- Preserved the package-root enum exports and their existing names.

## [6.0.1] - 2026-09-03

- **Breaking:** consolidated Chime, broadcast, and schedule types in the `chimes` module.
- **Breaking:** moved payment lifecycle types out of `orders` and into the `payments` module, with `PaymentStatus` as the canonical status type.
- **Breaking:** replaced the catch-all `common` module with focused `money`, `requests`, and `custom-data` modules.
- Added distinct request and response amount and price types across order, product, refund, payout, and purchase-intent contracts.

## [5.0.0] - 2026-09-03

- **Breaking:** request objects now match the canonical API contract for orders, Chimes,
  financial accounts, payment-method tokenization, prices, and products.
- Product media, dimensions, attributes, and shipment inputs now have dedicated domain types.
- Corrected the transport user agent and release-verification example.

## [4.0.0] - 2026-09-03

### Changed

- **Breaking:** every resource method now unwraps the wire payload and returns its domain object or page directly.
- **Breaking:** removed response- and envelope-oriented public resource types.
- **Breaking:** renamed `APIErrorResponse` to `APIErrorDocument`, exposed it as `errorDocument`, and removed the raw response from `FileDownload`.
- Renamed the payment result status constants to `PaymentResultStatuses`.

## [3.0.0] - 2026-09-02

### Changed

- **Breaking:** order methods now return domain objects directly instead of HTTP response envelopes.
- **Breaking:** removed response-oriented aliases from the public order type surface.

## [2.0.0] - 2026-09-01

### Changed

- **Breaking:** renamed the package to `@inttegro/inttegro-sdk`.
- **Breaking:** renamed `InttegroClient`, configuration types, and all SDK-prefixed errors from their former service name to `Inttegro*`.
- Updated runtime metadata, examples, documentation, and repository links to Inttegro.

## [0.1.0] - 2024-01-01

### Added

- Initial release of the Inttegro SDK for TypeScript
- InttegroClient class for SDK initialization
- Orders resource with full CRUD operations:
  - `create()` - Create new orders
  - `lookup()` - Retrieve order details
  - `pay()` - Process payments
  - `confirmPayment()` - Confirm payments with OTP/token
  - `requestConfirmation()` - Request new confirmation codes
- Comprehensive TypeScript type definitions
- Custom error classes:
  - `InttegroAPIError` - Base API error
  - `InttegroValidationError` - Validation errors
  - `InttegroNetworkError` - Network/timeout errors
  - `InttegroAuthenticationError` - Auth errors
  - `InttegroRateLimitError` - Rate limiting errors
- HTTP client with:
  - Automatic retry logic with exponential backoff
  - Request/response interceptors
  - Configurable timeouts
  - Debug logging
- Support for CommonJS and ESM modules
- Full test suite with >80% coverage
- Comprehensive documentation and examples

### Features

- 🎯 Type-safe API with full TypeScript support
- 🔄 Automatic retry with exponential backoff
- 🛡️ Built-in error handling
- 🔌 Request/response middleware via interceptors
- 📦 Dual module support (CJS + ESM)
- 🧪 Thoroughly tested
- 📝 JSDoc documentation throughout

[9.0.4]: https://github.com/inttegro/inttegro-sdk-typescript/releases/tag/v9.0.4
[9.0.3]: https://github.com/inttegro/inttegro-sdk-typescript/releases/tag/v9.0.3
[9.0.2]: https://github.com/inttegro/inttegro-sdk-typescript/releases/tag/v9.0.2
[9.0.1]: https://github.com/inttegro/inttegro-sdk-typescript/releases/tag/v9.0.1
[9.0.0]: https://github.com/inttegro/inttegro-sdk-typescript/releases/tag/v9.0.0
[8.1.0]: https://github.com/inttegro/inttegro-sdk-typescript/releases/tag/v8.1.0
[7.0.0]: https://github.com/inttegro/inttegro-sdk-typescript/releases/tag/v7.0.0
[8.0.0]: https://github.com/inttegro/inttegro-sdk-typescript/releases/tag/v8.0.0
[6.1.0]: https://github.com/inttegro/inttegro-sdk-typescript/releases/tag/v6.1.0
[6.0.1]: https://github.com/inttegro/inttegro-sdk-typescript/releases/tag/v6.0.1
[6.0.0]: https://github.com/inttegro/inttegro-sdk-typescript/releases/tag/v6.0.0
[4.0.0]: https://github.com/inttegro/inttegro-sdk-typescript/releases/tag/v4.0.0
[5.0.0]: https://github.com/inttegro/inttegro-sdk-typescript/releases/tag/v5.0.0
[3.0.0]: https://github.com/inttegro/inttegro-sdk-typescript/releases/tag/v3.0.0
[2.0.0]: https://github.com/inttegro/inttegro-sdk-typescript/releases/tag/v2.0.0
[0.1.0]: https://github.com/inttegro/inttegro-sdk-typescript/releases/tag/v0.1.0
