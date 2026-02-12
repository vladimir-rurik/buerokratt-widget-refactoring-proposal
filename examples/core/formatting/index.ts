// core/formatting/index.ts

/**
 * Format ISO date to local time string
 */
export function formatTime(iso: string, locale = 'et-EE'): string {
  try {
    return new Date(iso).toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

/**
 * Format ISO date to local date string
 */
export function formatDate(iso: string, locale = 'et-EE'): string {
  try {
    return new Date(iso).toLocaleDateString(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

/**
 * Format relative time (e.g., "5 minutes ago")
 */
export function formatRelativeTime(iso: string, locale = 'et'): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diffSeconds = Math.floor((now - then) / 1000);

  const translations: Record<string, (n: number) => string> = {
    et: (n) => (n === 1 ? `${n} minuti tagasi` : `${n} minutit tagasi`),
    en: (n) => (n === 1 ? `${n} minute ago` : `${n} minutes ago`),
  };

  const t = translations[locale] ?? translations.en;

  if (diffSeconds < 60) return locale === 'et' ? 'Just nüüd' : 'Just now';
  if (diffSeconds < 3600) return t(Math.floor(diffSeconds / 60));
  if (diffSeconds < 86400) return t(Math.floor(diffSeconds / 3600));

  return formatDate(iso);
}
