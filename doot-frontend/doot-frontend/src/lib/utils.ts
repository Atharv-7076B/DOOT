import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge conditional class names and resolve Tailwind conflicts.
 * Use this instead of string concatenation anywhere classes are conditional.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
