import { OrganizerStyles, SourceConfig } from './types.ts';

// Determine a style for an organizer string based on the configured sources and a styles array.
export function getStyleForOrganizer(
  organizer: string,
  eventUrl: string | undefined,
  sourcesConfig: SourceConfig[],
  styles: OrganizerStyles[]
): OrganizerStyles {
  // Default fallback style
  const fallback: OrganizerStyles = {
    bg: 'bg-slate-50',
    text: 'text-slate-700',
    border: 'border-slate-200',
    accent: 'bg-slate-600'
  };

  if (!organizer) return fallback;

  // normalize
  const orgLower = organizer.toLowerCase();

  // Try to find by source id first
  let idx = sourcesConfig.findIndex(s => s.id.toLowerCase() === orgLower);
  if (idx >= 0) return styles[idx % styles.length] || fallback;

  // Try containing id
  idx = sourcesConfig.findIndex(s => orgLower.includes(s.id.toLowerCase()));
  if (idx >= 0) return styles[idx % styles.length] || fallback;

  // Try matching by eventUrl hostname if available
  if (eventUrl) {
    try {
      const u = new URL(eventUrl);
      const eventHost = u.hostname.toLowerCase();
      idx = sourcesConfig.findIndex(s => {
        try {
          const sh = new URL(s.url).hostname.toLowerCase();
          return sh === eventHost || eventHost.includes(sh) || sh.includes(eventHost);
        } catch {
          return false;
        }
      });
      if (idx >= 0) return styles[idx % styles.length] || fallback;
    } catch {
      // ignore
    }
  }

  // Try matching organizer text against source hostnames
  idx = sourcesConfig.findIndex(s => {
    try {
      const sh = new URL(s.url).hostname.toLowerCase();
      return orgLower.includes(sh) || sh.includes(orgLower);
    } catch {
      return false;
    }
  });
  if (idx >= 0) return styles[idx % styles.length] || fallback;

  // As last resort, pick a style deterministically by hashing the organizer string
  let hash = 0;
  for (let i = 0; i < orgLower.length; i++) {
    hash = (hash << 5) - hash + orgLower.charCodeAt(i);
    hash |= 0; // convert to 32bit int
  }
  const pick = Math.abs(hash) % styles.length;
  return styles[pick] || fallback;
}
