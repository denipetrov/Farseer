/**
 * A full month of FOTM history while Rankwarden's database holds only a few days (the user,
 * 2026-11-27). Loaded only when the FOTM page's localhost toggle is on (`lib/devMocks.ts`),
 * in dev builds.
 *
 * It keeps the real answer's window and its newest day, and walks every spec's count back
 * from that day over the 31 days (±10% a day, seeded per board so a reload looks the same),
 * leaving one day out so the chart's gap shows. Each spec's hero talent split drifts too.
 */
import type { SpecRepresentationHistory } from '../pvp';

export function mockFotmHistory(
  real: SpecRepresentationHistory,
  seedKey: string,
): SpecRepresentationHistory {
  const base = real.days.at(-1);
  if (!base) return real;
  let seed = [...seedKey].reduce((n, c) => (n * 31 + c.charCodeAt(0)) % 2147483647, 7) || 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  const key = (s: { class: string; spec: string }) => `${s.class}-${s.spec}`;
  const counts = new Map(base.specs.map((s) => [key(s), s.count]));
  // Each hero tree's weight within its spec, drifting too, so the hero lines move as well
  const weights = new Map(
    base.specs.flatMap((s) => s.heroTalents.map((h) => [`${key(s)}-${h.id}`, h.count || 1])),
  );
  const days: SpecRepresentationHistory['days'] = [];
  // Walk back from the newest day: today is real, each earlier day drifts from the next
  for (let i = 0; i <= 30; i++) {
    const d = new Date(`${real.to}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() - i);
    const date = d.toISOString().slice(0, 10);
    if (i > 0) {
      for (const [k, c] of counts) {
        counts.set(k, Math.max(0, Math.round(c * (0.9 + rnd() * 0.2) + (rnd() - 0.5) * 6)));
      }
      for (const [k, w] of weights) weights.set(k, Math.max(0.5, w * (0.85 + rnd() * 0.3)));
    }
    if (i === 12) continue; // a missed day
    const specs = base.specs
      .map((s) => {
        const count = counts.get(key(s)) ?? 0;
        // The spec's players split over its trees by their weights
        const ws = s.heroTalents.map((h) => weights.get(`${key(s)}-${h.id}`) ?? 1);
        const sum = ws.reduce((n, w) => n + w, 0) || 1;
        const heroTalents = s.heroTalents.map((h, j) => {
          const c = Math.round((count * ws[j]!) / sum);
          return { ...h, count: c, share: count ? c / count : 0 };
        });
        return {
          ...s,
          count,
          heroTalents,
          heroTalentsClassified: heroTalents.reduce((n, h) => n + h.count, 0),
        };
      })
      .sort((a, b) => b.count - a.count);
    const classified = specs.reduce((n, s) => n + s.count, 0);
    days.push({
      ...base,
      date,
      computedAt: `${date}T10:00:00.000Z`,
      classified,
      total: Math.max(base.total, classified),
      specs: specs.map((s) => ({ ...s, share: classified ? s.count / classified : 0 })),
    });
  }
  return { ...real, days: days.reverse() };
}
