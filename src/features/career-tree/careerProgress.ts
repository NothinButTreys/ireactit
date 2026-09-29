import type { Experience } from '@/content/types';

/** Scroll progress (0–1) → how many tree nodes are mounted. The first node is always mounted. */
export function mountedCount(progress: number, total: number): number {
  if (total <= 0) return 0;
  const p = Math.min(1, Math.max(0, progress));
  return Math.min(total, Math.max(1, Math.ceil(p * total)));
}

export function careerYears(roles: readonly Pick<Experience, 'start'>[], currentYear: number): number {
  const first = Math.min(...roles.map((role) => Number(role.start.slice(0, 4))));
  return currentYear - first;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatMonth(yearMonth: string): string {
  const [year, month] = yearMonth.split('-');
  return `${MONTHS[Number(month) - 1]} ${year}`;
}

export function formatRange(start: string, end: string | null): string {
  return `${formatMonth(start)} – ${end ? formatMonth(end) : 'present'}`;
}
