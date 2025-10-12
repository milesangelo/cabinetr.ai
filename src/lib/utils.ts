import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Parse a ratio input into a percentage number (0-100)
// Accepts formats like "16.67%", "1/6", "0.1667", or "16.67"
export function parseRatio(input: string): number | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Percentage with % sign
  if (trimmed.endsWith("%")) {
    const num = parseFloat(trimmed.slice(0, -1));
    return isFinite(num) ? num : null;
  }

  // Fraction a/b
  if (trimmed.includes("/")) {
    const [a, b] = trimmed.split("/");
    const num = parseFloat(a);
    const den = parseFloat(b);
    if (!isFinite(num) || !isFinite(den) || den === 0) return null;
    return (num / den) * 100;
  }

  // Plain number: if <= 1 treat as fraction, else as percent
  const val = parseFloat(trimmed);
  if (!isFinite(val)) return null;
  return val <= 1 ? val * 100 : val;
}

// Normalize ratios to sum to exactly 100 (preserve relative proportions)
export function normalizeRatios(ratios: number[]): number[] {
  const positive = ratios.map((r) => (r < 0 ? 0 : r));
  const sum = positive.reduce((a, b) => a + b, 0);
  if (sum === 0) {
    const even = 100 / (positive.length || 1);
    return positive.map(() => even);
  }
  // Distribute rounding error to ensure sum=100 with two decimals
  const scaled = positive.map((r) => (r / sum) * 100);
  const rounded = scaled.map((r) => Math.round(r * 100) / 100);
  const diff = Math.round((100 - rounded.reduce((a, b) => a + b, 0)) * 100) / 100;
  // Adjust last element to fix sum exactly
  if (rounded.length > 0) {
    rounded[rounded.length - 1] = Math.round((rounded[rounded.length - 1] + diff) * 100) / 100;
  }
  return rounded;
}

export function validateRatios(ratios: number[], tolerance = 0.5): boolean {
  if (!ratios.length) return false;
  const sum = ratios.reduce((a, b) => a + b, 0);
  return Math.abs(sum - 100) <= tolerance && ratios.every((r) => r >= 0);
}
