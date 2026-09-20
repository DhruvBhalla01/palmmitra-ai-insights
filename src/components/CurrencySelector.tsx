import { CURRENCIES, CURRENCY_LABELS, type Currency } from '@/config/pricing';
import { useCurrency } from '@/hooks/useCurrency';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function CurrencySelector({ compact = false }: { compact?: boolean }) {
  const { currency, setCurrency } = useCurrency();
  return (
    <Select value={currency} onValueChange={(value) => setCurrency(value as Currency)}>
      <SelectTrigger aria-label="Currency" className={compact ? 'h-9 w-[102px] rounded-xl border-accent/25 bg-background/60' : 'h-10 w-[118px] rounded-xl border-accent/25 bg-background/60'}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {CURRENCIES.map((code) => <SelectItem key={code} value={code}>{CURRENCY_LABELS[code]}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}