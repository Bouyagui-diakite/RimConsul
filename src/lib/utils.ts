type ClassValue = string | false | null | undefined;

/** Tiny classnames helper (no deps). */
export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(" ");
}

/** Format a number with a thin space as thousands separator (FR style). */
export function formatNumber(n: number): string {
  return new Intl.NumberFormat("fr-FR").format(n);
}
