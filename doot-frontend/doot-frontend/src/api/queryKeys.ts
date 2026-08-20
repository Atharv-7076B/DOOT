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
  packets: {
    all: ['packets'] as const,
    list: () => [...queryKeys.packets.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.packets.all, 'detail', id] as const,
  },
} as const;
