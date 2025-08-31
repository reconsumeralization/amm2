'use client';

import React, { useState } from 'react';
import { useCoupons } from '../hooks/useCoupons';

interface CouponInputProps {
  subtotal: number;
  onCouponApplied: (discount: number, description: string) => void;
  onCouponRemoved: () => void;
  tenantId?: string;
}

export function CouponInput({
  subtotal,
  onCouponApplied,
  onCouponRemoved,
  tenantId
}: CouponInputProps) {
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const { validateCoupon, applyCoupon, isValidating, lastValidation } = useCoupons();

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    const validation = await validateCoupon(couponCode, tenantId);

    if (validation.valid && validation.coupon) {
      const application = applyCoupon(validation.coupon, subtotal);
      setAppliedCoupon(validation.coupon);
      onCouponApplied(application.discountAmount, application.discountDescription);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    onCouponRemoved();
  };

  return (
    <div className="coupon-input border rounded-lg p-4 bg-gray-50">
      <h3 className="text-lg font-medium mb-3">Have a coupon?</h3>

      {!appliedCoupon ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            placeholder="Enter coupon code"
            className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isValidating}
          />
          <button
            onClick={handleApplyCoupon}
            disabled={isValidating || !couponCode.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isValidating ? 'Validating...' : 'Apply'}
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-md p-3">
          <div>
            <p className="font-medium text-green-800">
              Coupon applied: {appliedCoupon.code}
            </p>
            <p className="text-sm text-green-600">
              {appliedCoupon.description}
            </p>
          </div>
          <button
            onClick={handleRemoveCoupon}
            className="text-red-600 hover:text-red-800 font-medium"
          >
            Remove
          </button>
        </div>
      )}

      {lastValidation && !lastValidation.valid && (
        <div className="mt-2 text-red-600 text-sm">
          {lastValidation.error}
        </div>
      )}

      {appliedCoupon && (
        <div className="mt-2 text-green-600 text-sm">
          {applyCoupon(appliedCoupon, subtotal).discountDescription}
        </div>
      )}
    </div>
  );
}
