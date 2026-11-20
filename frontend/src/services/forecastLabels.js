export function toClockHourLabel(label, now = new Date()) {
  const match = /^\+(\d+)\s*Hr$/i.exec(String(label).trim());
  if (!match) return label;

  const hour = (now.getHours() + Number(match[1])) % 24;
  const suffix = hour < 12 ? 'AM' : 'PM';
  return `${hour % 12 || 12}${suffix}`;
}
