import { HttpClient } from '../http-client';
import { App, AppCapabilities, CreateAppRequest, UpdateAppRequest } from '../types';

/** Application management endpoints. */
export class Apps {
  constructor(private httpClient: HttpClient) {}

  async create(request: CreateAppRequest): Promise<App> {
    return this.httpClient.postResource<App>('/apps/create', 'app', request);
  }

  async lookup(): Promise<App> {
    return this.httpClient.postResource<App>('/apps/lookup', 'app', {});
  }

  async capabilities(): Promise<AppCapabilities> {
    return this.httpClient.postResource<AppCapabilities>('/apps/capabilities', 'capabilities', {});
  }

  async update(request: UpdateAppRequest): Promise<App> {
    return this.httpClient.postResource<App>('/apps/update', 'app', request);
  }
}
