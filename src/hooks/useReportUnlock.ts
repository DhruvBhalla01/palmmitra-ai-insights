import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  prefill: {
    email: string;
  };
  theme: {
    color: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
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

interface UseReportUnlockResult {
  isUnlocked: boolean;
  hasSubscription: boolean;
  isLoading: boolean;
  isProcessing: boolean;
  checkUnlockStatus: () => Promise<void>;
  initiatePayment: (plan: 'report99' | 'unlimited999') => Promise<void>;
}

export function useReportUnlock(
  reportId: string | undefined,
  userEmail: string
): UseReportUnlockResult {
  const { toast } = useToast();
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
      // Use secure edge function to check unlock status
      const { data, error } = await supabase.functions.invoke('get-unlock-status', {
        body: {
          user_email: userEmail,
          report_id: reportId,
        },
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

  const initiatePayment = useCallback(async (plan: 'report99' | 'unlimited999') => {
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
        description: 'Unable to identify the report to unlock.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Step 1: Create order via backend
      const { data: orderData, error: orderError } = await supabase.functions.invoke(
        'create-razorpay-order',
        {
          body: {
            user_email: userEmail,
            report_id: plan === 'report99' ? reportId : undefined,
            plan,
          },
        }
      );

      if (orderError || !orderData?.success) {
        throw new Error(orderData?.error || 'Failed to create order');
      }

      const { order_id, amount, currency, payment_id, key_id } = orderData;

      // Step 2: Load Razorpay SDK if not loaded
      if (!window.Razorpay) {
        await loadRazorpayScript();
      }

      // Step 3: Open Razorpay checkout
      const options: RazorpayOptions = {
        key: key_id,
        amount,
        currency,
        name: 'PalmMitra',
        description: plan === 'report99' 
          ? 'Detailed Palm Reading Report' 
          : 'Unlimited Palm Readings - Lifetime',
        order_id,
        handler: async (response: RazorpayResponse) => {
          try {
            // Step 4: Verify payment via backend
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

            // Success!
            setIsUnlocked(true);
            if (verifyData.subscription) {
              setHasSubscription(true);
            }

            toast({
              title: '🎉 Payment Successful!',
              description: plan === 'report99'
                ? 'Your report is now unlocked!'
                : 'You now have unlimited access to all reports!',
            });

            // Trigger custom event for UI update
            window.dispatchEvent(new CustomEvent('paymentSuccess', { 
              detail: { plan, subscription: verifyData.subscription } 
            }));

          } catch (error) {
            console.error('Payment verification error:', error);
            toast({
              title: 'Verification Failed',
              description: 'Please contact support if amount was deducted.',
              variant: 'destructive',
            });
          }
        },
        prefill: {
          email: userEmail,
        },
        theme: {
          color: '#D4AF37', // Gold theme
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            toast({
              title: 'Payment Cancelled',
              description: 'You can try again anytime.',
            });
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', () => {
        setIsProcessing(false);
        toast({
          title: 'Payment Failed',
          description: 'Please try again or use a different payment method.',
          variant: 'destructive',
        });
      });
      razorpay.open();

    } catch (error) {
      console.error('Payment initiation error:', error);
      toast({
        title: 'Payment Error',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
      setIsProcessing(false);
    }
  }, [reportId, userEmail, toast]);

  return {
    isUnlocked,
    hasSubscription,
    isLoading,
    isProcessing,
    checkUnlockStatus,
    initiatePayment,
  };
}

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay'));
    document.body.appendChild(script);
  });
}
