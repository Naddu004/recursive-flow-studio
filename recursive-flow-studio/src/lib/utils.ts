import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function safeStringify(value: any): string {
  if (value === undefined) return 'undefined';
  if (value === null) return 'null';
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value);
  } catch (e) {
    return String(value);
  }
}

export const DESIGN_TOKENS = {
  background: {
    primary: "#0B1220",
    secondary: "#111827",
    card: "#1F2937",
  },
  border: "#374151",
  text: {
    primary: "#F9FAFB",
    secondary: "#9CA3AF",
  },
  accent: {
    blue: "#3B82F6",
    purple: "#8B5CF6",
    emerald: "#10B981",
    amber: "#F59E0B",
    red: "#EF4444",
    cyan: "#06B6D4",
  }
};
