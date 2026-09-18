import fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import { serializeRequestBody, toPublicValue, toWireValue } from '../utils/casing';

describe('TypeScript API casing properties', () => {
  it('round-trips supported public values through the wire representation', () => {
    fc.assert(
      fc.property(requestValue(), (value) => {
        expect(toPublicValue(toWireValue(value))).toEqual(value);
      })
    );
  });

  it('preserves opaque custom data while serializing public field names', () => {
    fc.assert(
      fc.property(fc.dictionary(fc.string(), fc.jsonValue()), (customData) => {
        const jsonCustomData = JSON.parse(JSON.stringify(customData)) as Record<string, unknown>;
        const body = JSON.parse(
          serializeRequestBody({
            customerData: { emailAddress: 'person@example.com' },
            customData,
          })
        ) as Record<string, unknown>;

        expect(body).toEqual({
          customer_data: { email_address: 'person@example.com' },
          custom_data: jsonCustomData,
        });
      })
    );
  });

  it('serializes catalog-backed order line item references', () => {
    const body = JSON.parse(
      serializeRequestBody({
        lineItems: [
          {
            type: 'product',
            product: {
              productId: 'prod_123',
              priceId: 'pr_123',
              quantity: 1,
            },
          },
        ],
      })
    );

    expect(body).toEqual({
      line_items: [
        {
          type: 'product',
          product: {
            product_id: 'prod_123',
            price_id: 'pr_123',
            quantity: 1,
          },
        },
      ],
    });
  });
});

function requestValue() {
  return fc.record({
    firstName: fc.string(),
    pageNumber: fc.integer(),
    isActive: fc.boolean(),
    lineItems: fc.array(
      fc.record({
        productId: fc.string(),
        unitPrice: fc.integer(),
      })
    ),
    customData: fc.dictionary(fc.string(), fc.jsonValue()),
  });
}
