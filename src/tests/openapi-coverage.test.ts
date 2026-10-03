import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';

const HTTP_METHODS = new Set(['get', 'post', 'put', 'patch', 'delete', 'options', 'head']);
const EXTERNALLY_SUPPLIED_CAPABILITY_URL_PATHS = new Set([
  '/file_links/open',
  '/upload_requests/upload',
]);
const CLIENT_CHECKOUT_PATHS = new Set([
  '/checkout/lookup',
  '/checkout/select_amount',
  '/checkout/pay',
  '/checkout/request_confirmation',
  '/checkout/confirm_payment',
]);
const PLATFORM_MANAGED_PATHS = new Set(['/sessions/new']);

interface OpenAPIDocument {
  paths?: Record<string, Record<string, unknown>>;
}

describe('OpenAPI coverage', () => {
  it('has explicit SDK coverage for every public OpenAPI path', () => {
    const specPath = resolve(
      process.cwd(),
      process.env.INTTEGRO_OPENAPI_SPEC || '../../openapi/commerce.yml'
    );

    expect(existsSync(specPath), `OpenAPI spec was not found at ${specPath}`).toBe(true);

    const spec = parse(readFileSync(specPath, 'utf8')) as OpenAPIDocument;
    const openApiPaths = Object.entries(spec.paths || {})
      .filter(([, pathItem]) => Object.keys(pathItem).some((method) => HTTP_METHODS.has(method)))
      .map(([path]) => path)
      .sort();

    const sdkPaths = collectSdkResourcePaths();
    const missingPaths = openApiPaths.filter(
      (path) =>
        !sdkPaths.has(path) &&
        !EXTERNALLY_SUPPLIED_CAPABILITY_URL_PATHS.has(path) &&
        !CLIENT_CHECKOUT_PATHS.has(path) &&
        !PLATFORM_MANAGED_PATHS.has(path)
    );

    expect(
      missingPaths,
      [
        `TypeScript SDK is missing explicit coverage for ${missingPaths.length} OpenAPI path(s) from ${specPath}:`,
        ...missingPaths.map((path) => `  - ${path}`),
        'Add a resource method with an explicit path literal, or document a true non-SDK path exception.',
      ].join('\n')
    ).toEqual([]);
  });
});

function collectSdkResourcePaths(): Set<string> {
  const resourcesDir = resolve(process.cwd(), 'src/resources');
  const pathLiterals = new Set<string>();
  const pathPattern = /['"`](\/[a-zA-Z0-9_./{}:-]+)['"`]/g;

  for (const entry of readdirSync(resourcesDir, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.ts')) continue;

    const source = stripComments(readFileSync(resolve(resourcesDir, entry.name), 'utf8'));
    for (const match of source.matchAll(pathPattern)) {
      pathLiterals.add(match[1]);
    }
  }

  return pathLiterals;
}

function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
}
