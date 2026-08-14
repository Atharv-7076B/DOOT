/** Format a number as Indian Rupees, e.g. formatCurrency(4200) -> "₹4,200" */
export function formatCurrency(amount: number = 0): string {
  const val = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  return `₹${val.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

/** Format a signed currency delta, e.g. formatCurrencyDelta(500) -> "+₹500" */
export function formatCurrencyDelta(amount: number): string {
  const sign = amount > 0 ? '+' : amount < 0 ? '−' : '';
  return `${sign}${formatCurrency(Math.abs(amount))}`;
}

/** Shorten a hex hash/id for display: truncateHash("a3f9e2b1c4d5") -> "a3f9e2b1…c4d5" */
export function truncateHash(hash: string, headLength = 8, tailLength = 4): string {
  if (hash.length <= headLength + tailLength) return hash;
  return `${hash.slice(0, headLength)}…${hash.slice(-tailLength)}`;
}

/** Generate a random lowercase hex string of a given length (for simulated packet ids/hashes). */
export function randomHex(length: number): string {
  const chars = '0123456789abcdef';
  let out = '';
  for (let i = 0; i < length; i += 1) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

/** Format a Date as a compact HH:MM:SS timestamp for logs/tables. */
export function formatTimestamp(date: Date): string {
  return date.toLocaleTimeString('en-IN', { hour12: false });
}

/** Format seconds remaining as "8.0s" for countdowns. */
export function formatCountdown(seconds: number): string {
  return `${Math.max(0, seconds).toFixed(1)}s`;
}
