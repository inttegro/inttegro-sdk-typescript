import { HttpClient } from '../http-client';
import {
  ArchiveFinancialAccountRequest,
  ConnectFinancialAccountRequest,
  CreateFinancialAccountRequest,
  FinancialAccount,
  FinancialAccountPage,
  LookupFinancialAccountRequest,
  PageFinancialAccountsRequest,
  ReconnectFinancialAccountRequest,
  ResourceSearchPage,
  ResourceSearchRequest,
  ToggleFinancialAccountRequest,
  UpdateFinancialAccountRequest,
  VerifyFinancialAccountRequest,
} from '../types';
import { throwIfValidationErrors, validateRequired } from '../utils/validation';

/**
 * Financial Accounts resource for wallets/bank accounts
 */
export class FinancialAccounts {
  constructor(private httpClient: HttpClient) {}

  async create(request: CreateFinancialAccountRequest): Promise<FinancialAccount> {
    const errors = validateRequired(request as unknown as Record<string, unknown>, [
      'label',
      'type',
      'reference',
      'currency',
      'owner',
    ]);
    throwIfValidationErrors(errors);

    return this.httpClient.postResource<FinancialAccount>(
      '/financial_accounts/create',
      'account',
      request
    );
  }

  async lookup(request: LookupFinancialAccountRequest): Promise<FinancialAccount> {
    const errors = validateRequired(request as unknown as Record<string, unknown>, ['account_id']);
    throwIfValidationErrors(errors);

    return this.httpClient.postResource<FinancialAccount>(
      '/financial_accounts/lookup',
      'account',
      request
    );
  }

  async archive(request: ArchiveFinancialAccountRequest): Promise<FinancialAccount> {
    return this.httpClient.postResource<FinancialAccount>(
      '/financial_accounts/archive',
      'account',
      request
    );
  }

  async page(request: PageFinancialAccountsRequest): Promise<FinancialAccountPage> {
    return this.httpClient.postResource<FinancialAccountPage>(
      '/financial_accounts/page',
      'page',
      request
    );
  }

  async search(request: ResourceSearchRequest): Promise<ResourceSearchPage> {
    return this.httpClient.postResource<ResourceSearchPage>(
      '/financial_accounts/search',
      'search',
      request
    );
  }

  async verify(request: VerifyFinancialAccountRequest): Promise<FinancialAccount> {
    return this.httpClient.postResource<FinancialAccount>(
      '/financial_accounts/verify',
      'account',
      request
    );
  }

  async update(request: UpdateFinancialAccountRequest): Promise<FinancialAccount> {
    const errors = validateRequired(request as unknown as Record<string, unknown>, ['account_id']);
    throwIfValidationErrors(errors);

    return this.httpClient.postResource<FinancialAccount>(
      '/financial_accounts/update',
      'account',
      request
    );
  }

  async enablePush(request: ToggleFinancialAccountRequest): Promise<FinancialAccount> {
    const errors = validateRequired(request as unknown as Record<string, unknown>, ['account_id']);
    throwIfValidationErrors(errors);

    return this.httpClient.postResource<FinancialAccount>(
      '/financial_accounts/enable_push',
      'account',
      request
    );
  }

  async disablePush(request: ToggleFinancialAccountRequest): Promise<FinancialAccount> {
    const errors = validateRequired(request as unknown as Record<string, unknown>, ['account_id']);
    throwIfValidationErrors(errors);

    return this.httpClient.postResource<FinancialAccount>(
      '/financial_accounts/disable_push',
      'account',
      request
    );
  }

  async enablePull(request: ToggleFinancialAccountRequest): Promise<FinancialAccount> {
    const errors = validateRequired(request as unknown as Record<string, unknown>, ['account_id']);
    throwIfValidationErrors(errors);

    return this.httpClient.postResource<FinancialAccount>(
      '/financial_accounts/enable_pull',
      'account',
      request
    );
  }

  async disablePull(request: ToggleFinancialAccountRequest): Promise<FinancialAccount> {
    const errors = validateRequired(request as unknown as Record<string, unknown>, ['account_id']);
    throwIfValidationErrors(errors);

    return this.httpClient.postResource<FinancialAccount>(
      '/financial_accounts/disable_pull',
      'account',
      request
    );
  }

  async disconnect(request: ToggleFinancialAccountRequest): Promise<FinancialAccount> {
    const errors = validateRequired(request as unknown as Record<string, unknown>, ['account_id']);
    throwIfValidationErrors(errors);

    return this.httpClient.postResource<FinancialAccount>(
      '/financial_accounts/disconnect',
      'account',
      request
    );
  }

  async reconnect(request: ReconnectFinancialAccountRequest): Promise<FinancialAccount> {
    const errors = validateRequired(request as unknown as Record<string, unknown>, ['account_id']);
    throwIfValidationErrors(errors);

    return this.httpClient.postResource<FinancialAccount>(
      '/financial_accounts/reconnect',
      'account',
      request
    );
  }

  async connect(request: ConnectFinancialAccountRequest): Promise<FinancialAccount> {
    const errors = validateRequired(request as unknown as Record<string, unknown>, [
      'label',
      'type',
      'reference',
      'currency',
      'owner',
    ]);
    throwIfValidationErrors(errors);

    return this.httpClient.postResource<FinancialAccount>(
      '/financial_accounts/connect',
      'account',
      request
    );
  }
}
