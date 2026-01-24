export function formatDateISO(date) {
  if (!date) return null;

  // se já vier como string YYYY-MM-DD
  if (typeof date === 'string') {
    return date;
  }

  // se for Date
  if (date instanceof Date) {
    return date.toISOString().split('T')[0];
  }

  // fallback
  return new Date(date).toISOString().split('T')[0];
}
