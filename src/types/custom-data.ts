export const MAX_CUSTOM_DATA_KEY_BYTES = 256;
export const MAX_CUSTOM_DATA_BYTES = 25 * 1024;

/** Validated merchant-defined string data attached to an API resource. */
export type CustomData = Readonly<Record<string, string>>;

/** One JSON-compatible value. */
export type JSONValue =
  string | number | boolean | null | readonly JSONValue[] | Readonly<{ [key: string]: JSONValue }>;

/** Input data whose values the API normalizes to strings. */
export type CustomDataInput = Readonly<Record<string, JSONValue>>;

/** Merge operations for custom data. A null value removes the corresponding key. */
export type CustomDataPatch = Readonly<Record<string, JSONValue>>;

/** Deliberately extensible JSON object whose keys are defined by an integration. */
export type JSONData = Readonly<Record<string, JSONValue>>;

export function createCustomData(values: Record<string, string> = {}): CustomData {
  validateCustomData(values);
  return Object.freeze({ ...values });
}

export function createCustomDataInput(values: Record<string, JSONValue> = {}): CustomDataInput {
  const normalized = freezeJSONRecord(values);
  validateCustomData(normalized);
  return normalized;
}

export function createCustomDataPatch(changes: Record<string, JSONValue> = {}): CustomDataPatch {
  const normalized = freezeJSONRecord(changes);
  validateCustomData(normalized);
  return normalized;
}

export function createJSONData(values: Record<string, JSONValue> = {}): JSONData {
  return freezeJSONRecord(values);
}

export class CustomDataBuilder {
  readonly #values: Record<string, string> = {};

  set(key: string, value: string): this {
    const previous = this.#values[key];
    const existed = Object.prototype.hasOwnProperty.call(this.#values, key);
    this.#values[key] = value;
    try {
      validateCustomData(this.#values);
    } catch (error) {
      if (existed) this.#values[key] = previous;
      else delete this.#values[key];
      throw error;
    }
    return this;
  }

  remove(key: string): this {
    delete this.#values[key];
    return this;
  }

  build(): CustomData {
    return createCustomData(this.#values);
  }
}

export class CustomDataPatchBuilder {
  readonly #changes: Record<string, JSONValue> = {};

  set(key: string, value: Exclude<JSONValue, null>): this {
    if (value === null || value === undefined) {
      throw new TypeError('Use unset() to remove a custom-data key');
    }
    return this.#change(key, value);
  }

  unset(key: string): this {
    return this.#change(key, null);
  }

  removeChange(key: string): this {
    delete this.#changes[key];
    return this;
  }

  build(): CustomDataPatch {
    return createCustomDataPatch(this.#changes);
  }

  #change(key: string, value: JSONValue): this {
    const previous = this.#changes[key];
    const existed = Object.prototype.hasOwnProperty.call(this.#changes, key);
    this.#changes[key] = value;
    try {
      validateCustomData(this.#changes);
    } catch (error) {
      if (existed) this.#changes[key] = previous;
      else delete this.#changes[key];
      throw error;
    }
    return this;
  }
}

function freezeJSONRecord(values: Record<string, JSONValue>): Readonly<Record<string, JSONValue>> {
  return Object.freeze(
    Object.fromEntries(Object.entries(values).map(([key, value]) => [key, freezeJSONValue(value)]))
  );
}

function freezeJSONValue(value: JSONValue): JSONValue {
  if (Array.isArray(value)) return Object.freeze(value.map(freezeJSONValue));
  if (value !== null && typeof value === 'object') {
    return freezeJSONRecord(value as Record<string, JSONValue>);
  }
  if (typeof value === 'number' && !Number.isFinite(value)) {
    throw new TypeError('JSON numbers must be finite');
  }
  return value;
}

function validateCustomData(values: Record<string, unknown>): void {
  for (const key of Object.keys(values)) {
    if (new TextEncoder().encode(key).byteLength > MAX_CUSTOM_DATA_KEY_BYTES) {
      throw new RangeError(`Custom-data key exceeds ${MAX_CUSTOM_DATA_KEY_BYTES} UTF-8 bytes`);
    }
  }
  if (new TextEncoder().encode(JSON.stringify(values)).byteLength > MAX_CUSTOM_DATA_BYTES) {
    throw new RangeError(`Custom data exceeds ${MAX_CUSTOM_DATA_BYTES} encoded bytes`);
  }
}
