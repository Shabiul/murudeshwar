export function formatDate(dateStr, opts = {}) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...opts,
  });
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** How long someone has worked in the organisation */
export function getOrgTenure(joinedAt) {
  if (!joinedAt) return 'Unknown';
  const start = new Date(joinedAt);
  const now = new Date();
  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();
  let days = now.getDate() - start.getDate();

  if (days < 0) {
    months -= 1;
    days += 30;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const parts = [];
  if (years > 0) parts.push(`${years} yr${years > 1 ? 's' : ''}`);
  if (months > 0) parts.push(`${months} mo`);
  if (parts.length === 0) {
    const totalDays = Math.max(1, Math.floor((now - start) / 86400000));
    return `${totalDays} day${totalDays > 1 ? 's' : ''}`;
  }
  return parts.join(' ');
}

export function getTotalExperience(priorYears, joinedAt) {
  const prior = Number(priorYears) || 0;
  if (!joinedAt) return prior > 0 ? `${prior}+ yrs total` : '—';

  const start = new Date(joinedAt);
  const now = new Date();
  const orgYears =
    (now - start) / (365.25 * 24 * 60 * 60 * 1000);
  const total = prior + orgYears;

  if (total < 1) return '< 1 yr total';
  return `~${Math.floor(total)} yr${Math.floor(total) !== 1 ? 's' : ''} total exp.`;
}

export function isToday(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const today = new Date();
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
}

export function initials(name = '') {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}
