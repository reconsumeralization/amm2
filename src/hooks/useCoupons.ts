import { useState, useCallback } from 'react';

export interface CouponValidation {
  valid: boolean;
  coupon?: {
    id: string;
    code: string;
    discountType: 'percent' | 'fixed' | 'free_shipping';
    amount: number;
    currency?: string;
    minimumPurchase?: number;
    maximumDiscount?: number;
    description?: string;
  };
  error?: string;
}

export interface UseCouponsReturn {
  validateCoupon: (code: string, tenantId?: string) => Promise<CouponValidation>;
  applyCoupon: (coupon: CouponValidation['coupon'], subtotal: number) => {
    discountAmount: number;
    finalAmount: number;
    discountDescription: string;
  };
  isValidating: boolean;
  lastValidation: CouponValidation | null;
}

export function useCoupons(): UseCouponsReturn {
  const [isValidating, setIsValidating] = useState(false);
  const [lastValidation, setLastValidation] = useState<CouponValidation | null>(null);

  const validateCoupon = useCallback(async (
    code: string,
    tenantId?: string
  ): Promise<CouponValidation> => {
    if (!code.trim()) {
      const result = { valid: false, error: 'Please enter a coupon code' };
      setLastValidation(result);
      return result;
    }

    setIsValidating(true);

    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          tenantId
        }),
      });

      const result: CouponValidation = await response.json();
      setLastValidation(result);
      return result;

    } catch (error) {
      const result = {
        valid: false,
        error: 'Unable to validate coupon. Please try again.'
      };
      setLastValidation(result);
      return result;
    } finally {
      setIsValidating(false);
    }
  }, []);

  const applyCoupon = useCallback((
    coupon: CouponValidation['coupon'],
    subtotal: number
  ) => {
    if (!coupon) {
      return {
        discountAmount: 0,
        finalAmount: subtotal,
        discountDescription: ''
      };
    }

    let discountAmount = 0;
    let discountDescription = '';

    // Check minimum purchase requirement
    if (coupon.minimumPurchase && subtotal < coupon.minimumPurchase) {
      return {
        discountAmount: 0,
        finalAmount: subtotal,
        discountDescription: `Minimum purchase of $${(coupon.minimumPurchase / 100).toFixed(2)} required`
      };
    }

    // Calculate discount based on type
    switch (coupon.discountType) {
      case 'percent':
        discountAmount = Math.round(subtotal * (coupon.amount / 100));
        discountDescription = `${coupon.amount}% off`;
        break;

      case 'fixed':
        discountAmount = coupon.amount;
        discountDescription = `$${coupon.amount / 100} off`;
        break;

      case 'free_shipping':
        // This would typically be handled separately from subtotal
        discountDescription = 'Free shipping';
        break;

      default:
        discountDescription = 'Invalid coupon type';
    }

    // Apply maximum discount limit for percentage discounts
    if (coupon.discountType === 'percent' && coupon.maximumDiscount) {
      discountAmount = Math.min(discountAmount, coupon.maximumDiscount);
      discountDescription += ` (max $${coupon.maximumDiscount / 100})`;
    }

    // Ensure discount doesn't exceed subtotal
    discountAmount = Math.min(discountAmount, subtotal);

    const finalAmount = subtotal - discountAmount;

    return {
      discountAmount,
      finalAmount,
      discountDescription
    };
  }, []);

  return {
    validateCoupon,
    applyCoupon,
    isValidating,
    lastValidation
  };
}
