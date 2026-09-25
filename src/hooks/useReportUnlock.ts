import { useState, useEffect, useCallback, useRef, createElement } from 'react';
import { ToastAction, type ToastActionElement } from '@/components/ui/toast';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { analytics, getServerCorrelationContext, trackApiError } from '@/lib/analytics';
import { PRODUCTS } from '@/config/pricing';
import posthog from '@/lib/posthog';
import { useCurrency } from '@/hooks/useCurrency';

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill: { email: string };
  theme: { color: string };
  modal?: { ondismiss?: () => void };
  config?: Record<string, unknown>;
}

export interface RazorpayInstance {
  open: () => void;
  on: (event: string, handler: () => void) => void;
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export type PlanType = 'report99' | 'monthly299' | 'unlimited999';

interface UseReportUnlockResult {
  isUnlocked: boolean;
  hasSubscription: boolean;
  isLoading: boolean;
  isProcessing: boolean;
  checkUnlockStatus: () => Promise<void>;
  initiatePayment: (plan: PlanType) => Promise<void>;
}

export function useReportUnlock(
  reportId: string | undefined,
  userEmail: string
): UseReportUnlockResult {
  const { toast } = useToast();
  const { currency: selectedCurrency, countryCode } = useCurrency();
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const checkUnlockStatus = useCallback(async () => {
    if (!userEmail) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('get-unlock-status', {
        body: { user_email: userEmail, report_id: reportId },
      });

      if (error) {
        console.error('Error checking unlock status:', error);
        setIsLoading(false);
        return;
      }

      if (data?.success) {
        setHasSubscription(data.hasSubscription || false);
        setIsUnlocked(data.isUnlocked || false);
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error checking unlock status:', error);
      setIsLoading(false);
    }
  }, [reportId, userEmail]);

  useEffect(() => {
    checkUnlockStatus();
  }, [checkUnlockStatus]);

  const retryRef = useRef<(() => void) | null>(null);
  const retryAction = () => createElement(ToastAction, { altText: 'Try payment again', onClick: () => retryRef.current?.() }, 'Try again') as unknown as ToastActionElement;
  const initiatePayment = useCallback(async (plan: PlanType) => {
    retryRef.current = () => { void initiatePaymentRef.current?.(plan); };
    if (!userEmail) {
      toast({
        title: 'Email Required',
        description: 'Please provide your email to proceed with payment.',
        variant: 'destructive',
      });
      return;
    }

    if (plan === 'report99' && !reportId) {
      toast({
        title: 'Report Not Found',
        description: 'Unable to identify the report to unlock. Please refresh the page.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    const product = plan === 'unlimited999' ? PRODUCTS.elite : PRODUCTS.insight;
    const commerce = {
      plan_id: product.id,
      plan_name: product.name,
      amount: product.prices[selectedCurrency].major,
      currency: selectedCurrency,
    } as const;
    const orderProperties = { ...commerce, checkout_step: 'create_order' };
    analytics.track('checkout_payment_initiated', orderProperties);
    posthog.capture('checkout_payment_initiated', orderProperties);

    try {
      const { data: orderData, error: orderError } = await supabase.functions.invoke(
        'create-razorpay-order',
        {
          body: {
            user_email: userEmail,
            report_id: plan === 'report99' ? reportId : undefined,
            plan,
            country_code: countryCode,
            analytics_context: getServerCorrelationContext(),
          },
        }
      );

      if (orderError || !orderData?.success) {
        throw new Error(orderData?.error || 'Failed to create order');
      }

      const { order_id, amount, currency, payment_id, key_id, description } = orderData;
      const serverCommerce = { ...commerce, amount: amount / 100, currency };

      if (!window.Razorpay) {
        await loadRazorpayScript();
      }

      const planDescriptions: Record<PlanType, string> = {
        report99:     'PalmMitra Insight — Full Palm Reading',
        monthly299:   'PalmMitra Monthly Plan',
        unlimited999: 'PalmMitra Elite — Lifetime Access',
      };

      const options: RazorpayOptions = {
        key: key_id,
        amount,
        currency,
        name: 'PalmMitra',
        description: description || planDescriptions[plan],
        order_id,
        handler: async (response: RazorpayResponse) => {
          try {
            const providerSuccessProperties = { ...serverCommerce, checkout_step: 'provider_callback' };
            analytics.track('checkout_payment_success', providerSuccessProperties);
            posthog.capture('checkout_payment_success', providerSuccessProperties);
            const { data: verifyData, error: verifyError } = await supabase.functions.invoke(
              'verify-razorpay-payment',
              {
                body: {
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                  payment_id,
                },
              }
            );

            if (verifyError || !verifyData?.success) {
              throw new Error(verifyData?.error || 'Payment verification failed');
            }

            setIsUnlocked(true);
            setIsProcessing(false);
            if (verifyData.subscription) {
              setHasSubscription(true);
            }
            const completionProperties = { ...serverCommerce, checkout_step: 'server_verified' };
            analytics.track('checkout_completed', completionProperties);
            posthog.capture('checkout_completed', completionProperties);

            const successMessage =
              plan === 'report99'      ? 'Your Insight report is now fully unlocked!' :
              plan === 'unlimited999'  ? 'PalmMitra Elite activated — unlimited readings, forever!' :
                                         'Monthly plan activated — unlimited readings await!';

            toast({
              title: '🎉 Payment Successful!',
              description: successMessage,
            });

            window.dispatchEvent(new CustomEvent('paymentSuccess', {
              detail: { plan, subscription: verifyData.subscription },
            }));

          } catch (error) {
            console.error('Payment verification error:', error);
            setIsProcessing(false);
            const failureProperties = {
              ...commerce,
              checkout_step: 'verification',
              error_category: 'provider_error',
            };
            analytics.track('checkout_payment_failed', failureProperties);
            posthog.capture('checkout_payment_failed', failureProperties);
            trackApiError('verify-razorpay-payment', error);
            toast({
              title: 'Verification Failed',
              description: 'Please contact support if your amount was deducted.',
              variant: 'destructive',
            });
          }
        },
        prefill: { email: userEmail },
        theme: { color: '#D4AF37' },
        // UPI first — most Indian buyers pay via UPI apps
        config: currency !== 'INR' ? undefined : {
          display: {
            blocks: { upi: { name: 'Pay via UPI', instruments: [{ method: 'upi' }] } },
            sequence: ['block.upi'],
            preferences: { show_default_blocks: true },
          },
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            const cancellationProperties = {
              ...commerce,
              checkout_step: 'provider_modal',
              error_category: 'user_cancelled',
            };
            analytics.track('checkout_payment_cancelled', cancellationProperties);
            posthog.capture('checkout_payment_cancelled', cancellationProperties);
            window.dispatchEvent(new CustomEvent('paymentRecovery', { detail: { reason: 'cancelled', plan } }));
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', () => {
        setIsProcessing(false);
        const failureProperties = {
          ...commerce,
          checkout_step: 'provider_payment',
          error_category: 'provider_error',
          payment_provider: 'razorpay',
        };
        analytics.track('checkout_payment_failed', failureProperties);
        posthog.capture('checkout_payment_failed', failureProperties);
        window.dispatchEvent(new CustomEvent('paymentRecovery', { detail: { reason: 'failed', plan } }));
      });
      razorpay.open();
      const redirectProperties = {
        ...commerce,
        checkout_step: 'provider_modal',
        payment_provider: 'razorpay',
      };
      analytics.track('checkout_payment_redirected', redirectProperties);
      posthog.capture('checkout_payment_redirected', redirectProperties);

    } catch (error) {
      console.error('Payment initiation error:', error);
      const failureProperties = {
        ...commerce,
        checkout_step: 'create_order',
        error_category: 'network_error',
        payment_provider: 'razorpay',
      };
      analytics.track('checkout_payment_failed', failureProperties);
      posthog.capture('checkout_payment_failed', failureProperties);
      trackApiError('create-razorpay-order', error);
      toast({
        title: 'Payment Error',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
      setIsProcessing(false);
    }
  }, [reportId, userEmail, toast, selectedCurrency, countryCode]);

  const initiatePaymentRef = useRef(initiatePayment);
  initiatePaymentRef.current = initiatePayment;

  return { isUnlocked, hasSubscription, isLoading, isProcessing, checkUnlockStatus, initiatePayment };
}

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) { resolve(); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay'));
    document.body.appendChild(script);
  });
}
