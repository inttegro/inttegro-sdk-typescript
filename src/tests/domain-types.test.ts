import { describe, expect, it } from 'vitest';
import {
  bankAccounts,
  Currencies,
  MobileMoneyNetworks,
  OtpStatuses,
  PaymentNextActionTypes,
  PaymentStatuses,
  ProductTypes,
  RefundReasons,
  UploadRequestStatuses,
  wallets,
} from '../index';
import type {
  AddProductPriceRequest,
  CatalogPrice,
  CatalogPriceParams,
  FileLinkCreateRequest,
  PriceParams,
  UpdatePaymentMethodRequest,
} from '../index';

describe('domain constants', () => {
  it('exposes exact wire values through the public package', () => {
    expect(ProductTypes.Digital).toBe('digital');
    expect(Currencies.GHS).toBe('ghs');
    expect(MobileMoneyNetworks.MTN).toBe('mtn');
    expect(MobileMoneyNetworks.Telecel).toBe('telecel');
    expect(PaymentNextActionTypes.AuthorizePayment).toBe('authorize_payment');
    expect(PaymentNextActionTypes.RequestConfirmation).toBe('request_confirmation');
    expect(PaymentStatuses.RequiresAction).toBe('requires_action');
    expect(RefundReasons.RequestedByCustomer).toBe('requested_by_customer');
    expect(UploadRequestStatuses.Pending).toBe('pending');
    expect(OtpStatuses.PendingVerification).toBe('pending_verification');
    expect(wallets.WalletTypes.MobileMoney).toBe('mobile_money');
    expect(bankAccounts.BankAccountTypes.GhanaBankAccount).toBe('ghana_bank_account');
  });

  it('organizes financial-account variants into wallet and bank-account modules', () => {
    const wallet: wallets.WalletConfig = {
      type: wallets.WalletTypes.MobileMoney,
      mobileMoney: { accountNumber: '233200000000', network: 'mtn' },
    };
    const bankAccount: bankAccounts.BankAccountConfig = {
      type: bankAccounts.BankAccountTypes.GhanaBankAccount,
      ghanaBankAccount: { number: '0123456789' },
    };

    expect(wallet.mobileMoney?.network).toBe('mtn');
    expect(bankAccount.ghanaBankAccount?.number).toBe('0123456789');
  });

  it('keeps inline prices flat and catalog price amounts nested', () => {
    const price: PriceParams = { currency: Currencies.GHS, value: 3005 };
    const catalogPrice: CatalogPriceParams = {
      type: 'fixed_amount',
      fixedAmount: price,
      label: 'Retail',
    };
    // @ts-expect-error legacy amount-only catalog prices are no longer accepted
    const legacyCatalogPrice: CatalogPriceParams = { amount: price };

    expect(JSON.stringify(price)).toBe('{"currency":"ghs","value":3005}');
    expect(catalogPrice).toEqual({
      type: 'fixed_amount',
      fixedAmount: price,
      label: 'Retail',
    });
    expect(legacyCatalogPrice).toEqual({ amount: price });

    const productPrice: AddProductPriceRequest = {
      productId: 'prod_123',
      type: 'fixed_amount',
      fixedAmount: price,
    };
    expect(productPrice).toEqual({
      productId: 'prod_123',
      type: 'fixed_amount',
      fixedAmount: price,
    });

    const returned: CatalogPrice = {
      id: 'pr_123',
      active: true,
      type: 'fixed_amount',
      fixedAmount: price,
      nominal: price,
      productId: 'prod_123',
      createdAt: '2026-09-02T12:00:00Z',
    };
    expect(returned.productId).toBe('prod_123');

    const customerSelected: CatalogPriceParams = {
      type: 'customer_selected_amount',
      productId: 'prod_123',
      customerSelectedAmount: {
        currency: Currencies.GHS,
        minimum: 500,
        suggestedAmounts: [{ id: 'supporter', value: 1000, recommended: true }],
      },
    };
    expect(customerSelected.customerSelectedAmount.suggestedAmounts?.[0]?.id).toBe('supporter');
  });

  it('uses request-specific file-link access and payment-method owner patches', () => {
    const fileLink: FileLinkCreateRequest = {
      fileId: 'file_123',
      access: { allowDownload: true, allowedIpRanges: ['192.0.2.0/24'] },
      expiresAt: new Date('2030-07-06T12:30:00Z'),
    };
    const paymentMethod: UpdatePaymentMethodRequest = {
      paymentMethodId: 'pm_123',
      owner: { address: { line1: '1 High Street', region: 'Greater Accra' } },
    };

    expect(fileLink.access?.allowDownload).toBe(true);
    expect(paymentMethod.owner?.address?.region).toBe('Greater Accra');
  });
});
