export const queryKeys = {
  accounts: {
    all: ['accounts'] as const,
    list: () => [...queryKeys.accounts.all, 'list'] as const,
  },
  transactions: {
    all: ['transactions'] as const,
    list: () => [...queryKeys.transactions.all, 'list'] as const,
  },
  mesh: {
    all: ['mesh'] as const,
    state: () => [...queryKeys.mesh.all, 'state'] as const,
  },
} as const;
