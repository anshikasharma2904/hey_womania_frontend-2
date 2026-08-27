export function formatCoOrd(text: string): string {
  if (!text) return text;
  return text.replace(/\bco[\s-]?ords?\b/gi, (match) => {
    return match.toLowerCase().endsWith('s') ? 'Co-Ords' : 'Co-Ord';
  });
}
