/**
 * DTOs for the UPI Offline Mesh backend (see backend README, "API reference").
 *
 * The README gives an exact field-level JSON example only for
 * POST /api/bridge/ingest. The shapes below for /api/accounts,
 * /api/transactions, POST /api/demo/send and /api/mesh/state are
 * best-effort mappings onto the domain vocabulary the README uses
 * elsewhere (Account.java, Transaction.java, MeshPacket.java,
 * VirtualDevice.java, PaymentInstruction.java) — they have not been
 * confirmed against the real controller/DTO source.
 *
 * If the live backend uses different field names, this is the only file
 * that should need to change — every hook and component below reads
 * through these types rather than raw `fetch` responses.
 */

// ---- Account (GET /api/accounts) ----
// README: "Account.java — JPA entity. @Version = optimistic lock"
export interface AccountDto {
  id: number;
  vpa: string;
  holderName: string;
  balance: number;
  version: number;
}

// ---- Transaction (GET /api/transactions) ----
// README: "Transaction.java — Settled-tx ledger. unique idx on packetHash"
export type TransactionStatus = 'SETTLED' | 'REJECTED';

export interface TransactionDto {
  id: number;
  sender: string;
  receiver: string;
  amount: number;
  packetHash: string;
  bridgeNodeId: string;
  hopCount: number;
  status: TransactionStatus;
  settledAt: string;
}

// ---- Mesh packet wire format (documented exactly in the README) ----
// "MeshPacket { packetId, ttl, createdAt, ciphertext, hopCount, bridgeNodeId, currentNode, visitedNodes }"
export interface MeshPacketDto {
  packetId: string;
  ttl: number;
  createdAt: number | string;
  ciphertext: string;
  hopCount?: number;
  bridgeNodeId?: string;
  currentNode?: string;
  visitedNodes?: string[];
}

// ---- Virtual device (GET /api/mesh/state) ----
export interface VirtualDeviceDto {
  deviceId: string;
  name?: string;
  vpa?: string;
  online?: boolean;
  isBridge?: boolean;
  hasInternet: boolean;
  connectedNodeIds?: string[];
  packets: MeshPacketDto[];
}

export type MeshStateDto = VirtualDeviceDto[];

// ---- POST /api/demo/send ----
// README demo flow: "Choose sender, receiver, amount, PIN."
export interface SendPaymentRequest {
  sender: string;
  receiver: string;
  amount: number;
  pin: string;
}

// ---- POST /api/bridge/ingest response shape (documented exactly) ----
// Used only for typing BridgeFlushOutcome entries if /api/mesh/flush
// echoes the same per-packet outcome shape as the underlying ingest call.
export type BridgeIngestOutcome = 'SETTLED' | 'DUPLICATE_DROPPED' | 'INVALID';

export interface BridgeIngestResult {
  outcome: BridgeIngestOutcome;
  packetHash: string;
  reason: string | null;
  transactionId: number | null;
}
