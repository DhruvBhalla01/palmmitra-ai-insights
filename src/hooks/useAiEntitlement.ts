import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AiEntitlement {
  free_questions_remaining: number;
  pack_questions_remaining: number;
  subscription_plan: 'ai_elite_monthly' | 'ai_elite_annual' | null;
  subscription_expires_at: string | null;
  subscription_month_usage: number;
  monthly_quota: number;
  has_active_subscription: boolean;
  total_remaining: number;
}

async function fetchEntitlement(reportId: string, userEmail: string): Promise<AiEntitlement> {
  const { data, error } = await supabase.functions.invoke('ai-entitlement', {
    method: 'POST',
    body: { reportId, userEmail },
  });
  if (error) throw error;
  return data as AiEntitlement;
}

export function useAiEntitlement(reportId: string | undefined, userEmail: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['ai-entitlement', reportId, userEmail],
    queryFn: () => fetchEntitlement(reportId!, userEmail!),
    enabled: enabled && !!reportId && !!userEmail,
    staleTime: 15_000,
  });
}

export function useInvalidateEntitlement() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ['ai-entitlement'] });
}
