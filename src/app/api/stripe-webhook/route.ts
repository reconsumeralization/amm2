import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
// import Stripe from 'stripe'; // Temporarily disabled to prevent build issues
import { getPayload } from 'payload';
import config from '../../../payload.config';
import { handleAPIError, createErrorResponse, validateEnvironmentVariables } from '@/lib/api-error-handler';
import { getSettingsWithFallback } from '@/lib/settings-initializer';

// Temporarily disabled stripe integration to prevent build issues
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: '2022-08-01',
// });

// const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  // Stripe integration is temporarily disabled to prevent build issues
  return NextResponse.json({
    error: 'Stripe webhook is temporarily disabled',
    message: 'This endpoint is currently unavailable due to build configuration issues.'
  }, { status: 503 });
}

// Temporarily disabled stripe functions to prevent build issues
/*
All stripe webhook handler functions have been disabled to prevent build issues.
They will be re-enabled once the stripe dependency is properly configured.
*/
