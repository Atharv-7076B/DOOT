import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { AccountDto } from '@/types/api';
import type { SendPaymentFormErrors, SendPaymentFormValues } from '@/lib/validation';

interface SendPaymentFormProps {
  accounts: AccountDto[];
  form: SendPaymentFormValues;
  errors: SendPaymentFormErrors;
  setField: (field: keyof SendPaymentFormValues, value: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  disabled?: boolean;
}

export function SendPaymentForm({
  accounts,
  form,
  errors,
  setField,
  onSubmit,
  isSubmitting,
  disabled,
}: SendPaymentFormProps) {
  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      noValidate
    >
      <div>
        <Label htmlFor="sender-select">Sender</Label>
        <Select value={form.sender} onValueChange={(value) => setField('sender', value)} disabled={disabled}>
          <SelectTrigger id="sender-select" aria-invalid={Boolean(errors.sender)} aria-describedby={errors.sender ? 'sender-error' : undefined}>
            <SelectValue placeholder="Choose sender account" />
          </SelectTrigger>
          <SelectContent>
            {accounts.map((account) => (
              <SelectItem key={account.id} value={account.vpa}>
                {account.holderName} · {account.vpa}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.sender ? (
          <p id="sender-error" role="alert" className="mt-1.5 text-xs text-mesh-red">
            {errors.sender}
          </p>
        ) : null}
      </div>

      <div>
        <Label htmlFor="receiver-select">Receiver</Label>
        <Select value={form.receiver} onValueChange={(value) => setField('receiver', value)} disabled={disabled}>
          <SelectTrigger id="receiver-select" aria-invalid={Boolean(errors.receiver)} aria-describedby={errors.receiver ? 'receiver-error' : undefined}>
            <SelectValue placeholder="Choose receiver account" />
          </SelectTrigger>
          <SelectContent>
            {accounts.map((account) => (
              <SelectItem key={account.id} value={account.vpa}>
                {account.holderName} · {account.vpa}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.receiver ? (
          <p id="receiver-error" role="alert" className="mt-1.5 text-xs text-mesh-red">
            {errors.receiver}
          </p>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="amount-input">Amount (₹)</Label>
          <Input
            id="amount-input"
            inputMode="decimal"
            placeholder="500"
            value={form.amount}
            onChange={(event) => setField('amount', event.target.value)}
            aria-invalid={Boolean(errors.amount)}
            aria-describedby={errors.amount ? 'amount-error' : undefined}
            disabled={disabled}
          />
          {errors.amount ? (
            <p id="amount-error" role="alert" className="mt-1.5 text-xs text-mesh-red">
              {errors.amount}
            </p>
          ) : null}
        </div>

        <div>
          <Label htmlFor="pin-input">PIN</Label>
          <Input
            id="pin-input"
            type="password"
            inputMode="numeric"
            placeholder="••••"
            value={form.pin}
            onChange={(event) => setField('pin', event.target.value)}
            aria-invalid={Boolean(errors.pin)}
            aria-describedby={errors.pin ? 'pin-error' : undefined}
            disabled={disabled}
          />
          {errors.pin ? (
            <p id="pin-error" role="alert" className="mt-1.5 text-xs text-mesh-red">
              {errors.pin}
            </p>
          ) : null}
        </div>
      </div>

      <Button type="submit" disabled={disabled || isSubmitting} className="mt-1">
        <Send className="h-4 w-4" aria-hidden="true" />
        {isSubmitting ? 'Encrypting & injecting…' : 'Inject into Mesh'}
      </Button>
    </form>
  );
}
