/**
 * Translate between the idiomatic TypeScript API and Inttegro's JSON wire format.
 *
 * The fields listed here contain user-defined or otherwise opaque maps. Their
 * field names are translated, but their contents must be passed through exactly
 * as supplied by the caller or returned by the API.
 */
const OPAQUE_FIELDS = new Set([
  'customData',
  'destinations',
  'details',
  'headers',
  'jsonLd',
  'mandate',
  'metadata',
  'variables',
]);

/** Fields declared as `format: date-time` by the Commerce contract. */
const TEMPORAL_FIELDS = new Set([
  'after',
  'archivedAt',
  'asOf',
  'at',
  'attemptedAt',
  'availableAt',
  'canceledAt',
  'checkedAt',
  'claimedAt',
  'completedAt',
  'createdAfter',
  'createdAt',
  'createdBefore',
  'deletedAt',
  'deliveredAt',
  'disconnectedAt',
  'dueAt',
  'enabledAt',
  'executeAfter',
  'executedAt',
  'expectedAt',
  'expiredAt',
  'expiresAt',
  'expiresOn',
  'failedAt',
  'fulfilledAt',
  'inactiveAt',
  'includesTransactionsBefore',
  'initializedAt',
  'initiatedAt',
  'issuedAt',
  'lastAccessedAt',
  'lastAttemptedAt',
  'lastEmailEventAt',
  'lastIndexedAt',
  'lastUsedAt',
  'occurredAt',
  'observedAt',
  'paidAt',
  'paymentDueAt',
  'processingAt',
  'publishedAt',
  'queuedAt',
  'reviewedAt',
  'revokedAt',
  'scheduledAt',
  'sealedAt',
  'sendAfter',
  'sentAt',
  'succeededAt',
  'suppliedAt',
  'suppressedAt',
  'tokenSentAt',
  'updatedAt',
  'uploadingAt',
  'validUntil',
  'verifiedAt',
]);

export function toCamelCase(value: string): string {
  return value.replace(/_([a-z0-9])/g, (_, character: string) => character.toUpperCase());
}

export function toSnakeCase(value: string): string {
  return value.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase();
}

export function toPublicValue<T>(value: T): T {
  return transformObject(value, toCamelCase, true) as T;
}

export function toWireValue<T>(value: T): T {
  return transformObject(value, toSnakeCase, false) as T;
}

export function serializeRequestBody(value: unknown): string {
  return JSON.stringify(toWireValue(value));
}

function transformObject(
  value: unknown,
  transformKey: (key: string) => string,
  decodeTimestamps: boolean
): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => transformObject(item, transformKey, decodeTimestamps));
  }

  if (!isPlainObject(value)) {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, child]) => {
      const publicKey = toCamelCase(key);
      const transformedKey = transformKey(key);
      const transformedChild = OPAQUE_FIELDS.has(publicKey)
        ? child
        : decodeTimestamps && TEMPORAL_FIELDS.has(publicKey) && typeof child === 'string'
          ? parseTimestamp(child, key)
          : transformObject(child, transformKey, decodeTimestamps);
      return [transformedKey, transformedChild];
    })
  );
}

function parseTimestamp(value: string, field: string): Date {
  if (!/(?:Z|[+-]\d{2}:\d{2})$/.test(value)) {
    throw new TypeError(`Inttegro returned a ${field} timestamp without a UTC offset: ${value}`);
  }
  const timestamp = new Date(value);
  if (Number.isNaN(timestamp.getTime())) {
    throw new TypeError(`Inttegro returned an invalid ${field} timestamp: ${value}`);
  }
  return timestamp;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object') return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}
