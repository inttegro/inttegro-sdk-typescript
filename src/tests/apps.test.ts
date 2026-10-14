import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HttpClient } from '../http-client';
import { Apps } from '../resources/apps';

describe('Apps', () => {
  let apps: Apps;
  let httpClient: HttpClient;

  beforeEach(() => {
    httpClient = new HttpClient({ apiKey: 'test' });
    apps = new Apps(httpClient);
  });

  it('calls every apps endpoint', async () => {
    const postSpy = vi.spyOn(httpClient, 'post').mockImplementation(async (path) =>
      (path === '/apps/capabilities'
        ? { capabilities: { payments: {}, payouts: {} } }
        : { app: { id: 'app_123' } }) as never,
    );

    await apps.create({ name: 'My App' });
    await apps.lookup();
    await apps.capabilities();
    await apps.update({ alias: 'my-app' });

    expect(postSpy).toHaveBeenCalledWith('/apps/create', { name: 'My App' });
    expect(postSpy).toHaveBeenCalledWith('/apps/lookup', {});
    expect(postSpy).toHaveBeenCalledWith('/apps/capabilities', {});
    expect(postSpy).toHaveBeenCalledWith('/apps/update', { alias: 'my-app' });
  });
});
