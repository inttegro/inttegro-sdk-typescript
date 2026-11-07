/** Per-request controls that do not change the operation payload. */
export interface RequestMeta {
  /** Idempotency key used to safely retry mutation requests. */
  idempotencyKey?: string;

  /** Preferences for computing and representing the successful response. */
  response?: RequestResponse;
}

/** Caller-controlled preferences for a successful response. */
export interface RequestResponse {
  /** Public property selections keyed by the endpoint's response resource names. */
  projection?: ResponseProjection;
}

/** Public property selections keyed by response resource name. */
export type ResponseProjection = Record<string, PropertySelection>;

/**
 * Includes or excludes public properties from one response resource.
 * Set exactly one of `pick` or `omit`.
 */
export type PropertySelection =
  { pick: [string, ...string[]]; omit?: never } | { omit: [string, ...string[]]; pick?: never };
