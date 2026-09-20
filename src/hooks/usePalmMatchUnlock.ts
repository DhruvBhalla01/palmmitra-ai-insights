import { useState, useEffect, useCallback } from 'react';
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

interface RazorpayOptions {
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
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, handler: () => void) => void;
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export type PalmMatchPlanType = 'palmmatch149' | 'unlimited999';

interface UsePalmMatchUnlockResult {
  isUnlocked: boolean;
  isLoading: boolean;
  isProcessing: boolean;
  initiatePayment: (plan: PalmMatchPlanType) => Promise<void>;
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

export function usePalmMatchUnlock(
  reportId: string | undefined,
  userEmail: string
): UsePalmMatchUnlockResult {
  const { toast } = useToast();
  const { currency: selectedCurrency, countryCode } = useCurrency();
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const checkUnlockStatus = useCallback(async () => {
    if (!reportId) { setIsLoading(false); return; }
    try {
      const { data, error } = await supabase.functions.invoke('get-palmmatch-status', {
        body: { report_id: reportId, email: userEmail || '' },
      });
      if (!error && data?.success) {
        setIsUnlocked(data.isUnlocked ?? false);
      }
    } catch {
      // silent — report may not exist yet
    } finally {
      setIsLoading(false);
    }
  }, [reportId, userEmail]);

  useEffect(() => { checkUnlockStatus(); }, [checkUnlockStatus]);

  const initiatePayment = useCallback(async (plan: PalmMatchPlanType) => {
    if (!userEmail) {
      toast({ title: 'Email Required', description: 'Please provide your email.', variant: 'destructive' });
      return;
    }
    setIsProcessing(true);
    const product = plan === 'palmmatch149' ? PRODUCTS.palmmatch : PRODUCTS.insight;
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
        { body: {
          user_email: userEmail,
          palmmatch_report_id: reportId,
          plan,
          country_code: countryCode,
          analytics_context: getServerCorrelationContext(),
        } }
      );

      if (orderError || !orderData?.success) {
        throw new Error(orderData?.error || 'Failed to create order');
      }

      const { order_id, amount, currency, payment_id, key_id } = orderData;
      const serverCommerce = { ...commerce, amount: amount / 100, currency };

      if (!window.Razorpay) await loadRazorpayScript();

      const options: RazorpayOptions = {
        key: key_id,
        amount,
        currency,
        name: 'PalmMitra',
        description: plan === 'palmmatch149' ? 'PalmMatch Compatibility Report' : 'PalmMitra Monthly Plan',
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
            const completionProperties = { ...serverCommerce, checkout_step: 'server_verified' };
            analytics.track('checkout_completed', completionProperties);
            posthog.capture('checkout_completed', completionProperties);

            toast({
              title: 'Payment Successful!',
              description: plan === 'palmmatch149'
                ? 'Your compatibility report is fully unlocked!'
                : 'Monthly plan activated — unlimited readings await!',
            });

            window.dispatchEvent(new CustomEvent('palmMatchPaymentSuccess', { detail: { plan } }));
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
            toast({ title: 'Verification Failed', description: 'Please contact support if your amount was deducted.', variant: 'destructive' });
          }
        },
        prefill: { email: userEmail },
        theme: { color: '#D4AF37' },
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
            toast({ title: 'Payment Cancelled', description: 'You can try again anytime.' });
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
        toast({ title: 'Payment Failed', description: 'Please try again or use a different payment method.', variant: 'destructive' });
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
      toast({ title: 'Payment Error', description: error instanceof Error ? error.message : 'Something went wrong', variant: 'destructive' });
      setIsProcessing(false);
    }
  }, [reportId, userEmail, toast, selectedCurrency, countryCode]);

  return { isUnlocked, isLoading, isProcessing, initiatePayment };
}
