import { AccountCard } from '@/features/accounts/components/AccountCard';
import type { AccountDto } from '@/types/api';

interface AccountsGridProps {
  accounts: AccountDto[];
  maxBalance: number;
}

export function AccountsGrid({ accounts, maxBalance }: AccountsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {accounts.map((account) => (
        <AccountCard key={account.id} account={account} maxBalance={maxBalance} />
      ))}
    </div>
  );
}
