/**
 * Builds src/data/bossIcons.json: each raid boss's icon on Raider.io's image server.
 *
 * Raider.io's raid data names an icon per raid but none per boss. The icons it shows for
 * bosses are the boss's "Mythic: <boss>" achievement icon, so for every boss of every raid
 * (Raider.io's public static data, the source of Soulseeker's catalogue) this:
 *   1. asks Wowhead's search for the achievement "Mythic: <boss>" and takes its icon name;
 *      Achievements often carry the boss's full title ("Mythic: Sikran, Captain of the
 *      Sureki"), so a "Mythic: …" achievement whose title or text names the boss also counts;
 *   2. keeps it only if Raider.io serves it (`cdn.raiderio.net/images/wow/icons/large/<icon>.jpg`).
 * Re-released raids (Fated, Awakened) have no achievements of their own: their bosses take
 * the original boss's icon ("Fated The Tarragrue" → "The Tarragrue").
 * Bosses with no match are listed at the end and left out (the menu then shows no icon).
 *
 * Icons already in the file are kept, so a rerun only searches for what is missing. If
 * Wowhead refuses (it rate-limits), the run stops searching and writes what it has.
 *
 * Run when a raid is added: `node scripts/boss-icons.mjs`. Review the diff, as with any asset.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const EXPANSIONS = [6, 7, 8, 9, 10, 11]; // Raider.io's ids: Legion … Midnight
const OUT = new URL('../src/data/bossIcons.json', import.meta.url);
const HEADERS = { 'User-Agent': 'Mozilla/5.0 (asset build script)' };
const pause = (ms) => new Promise((r) => setTimeout(r, ms));
const fold = (s) => s.toLowerCase().replace(/[’']/g, "'").replace(/\s+/g, ' ').trim();
/** Letters only, for loose matching: "Il'gynoth, The Heart" → "ilgynoththeheart" */
const letters = (s) => s.toLowerCase().replace(/[^a-z]/g, '');
/** "Fated Sludgefist" → "Sludgefist"; "Awakened Eranog" → "Eranog" */
const original = (name) => name.replace(/^(Fated|Awakened) /, '');

async function json(url) {
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

async function search(q) {
  const { results = [] } = await json(
    `https://www.wowhead.com/search/suggestions-template?q=${encodeURIComponent(q)}`,
  );
  await pause(300); // one search at a time, gently
  return results.filter((r) => r.type === 10 && r.icon && r.name.startsWith('Mythic: '));
}

/** The icon of the boss's "Mythic: …" achievement, or null. */
async function achievementIcon(name) {
  const exact = (await search(`Mythic: ${name}`)).find(
    (r) => fold(r.name) === fold(`Mythic: ${name}`),
  );
  if (exact) return exact.icon;
  // The boss's name before any comma or "the", matched loosely in the title or the text
  const short = letters(name.split(',')[0].replace(/^the /i, ''));
  for (const q of [`Mythic: ${name.split(',')[0]}`, name.split(',')[0]]) {
    const hit = (await search(q)).find((r) =>
      letters(`${r.name} ${r.pinDescription ?? ''}`).includes(short),
    );
    if (hit) return hit.icon;
  }
  return null;
}

async function servedByRaiderIo(icon) {
  const res = await fetch(`https://cdn.raiderio.net/images/wow/icons/large/${icon}.jpg`, {
    method: 'HEAD',
  });
  return res.ok;
}

// Icons already found are kept (and re-checked on Raider.io); only the rest are searched for
const OUT_PATH = fileURLToPath(OUT);
const known = existsSync(OUT_PATH) ? JSON.parse(readFileSync(OUT_PATH, 'utf8')) : {};
const raidsByExpansion = [];
for (const expansion of EXPANSIONS) {
  const { raids } = await json(
    `https://raider.io/api/v1/raiding/static-data?expansion_id=${expansion}`,
  );
  raidsByExpansion.push(...raids);
}

// A re-release (Fated, Awakened) repeats its original's bosses: one icon per boss name
const byName = new Map();
for (const raid of raidsByExpansion) {
  for (const boss of raid.encounters) {
    const icon = known[`${raid.slug}/${boss.slug}`];
    if (icon) byName.set(original(boss.name), icon);
  }
}

// NO_SEARCH=1: only reuse what is known (and fill re-releases), without asking Wowhead
let blocked = process.env.NO_SEARCH === '1';
for (const raid of raidsByExpansion) {
  for (const boss of raid.encounters) {
    const name = original(boss.name);
    if (byName.has(name) || blocked) continue;
    try {
      const icon = await achievementIcon(name);
      byName.set(name, icon && (await servedByRaiderIo(icon)) ? icon : null);
    } catch (error) {
      // Wowhead refused (rate limit): stop asking, keep what we have, run again later
      console.warn(`Wowhead search stopped: ${error.message}`);
      blocked = true;
    }
  }
}

const icons = {};
const missing = [];
for (const raid of raidsByExpansion) {
  for (const boss of raid.encounters) {
    const icon = byName.get(original(boss.name));
    if (icon) icons[`${raid.slug}/${boss.slug}`] = icon;
    else missing.push(`${raid.slug}/${boss.slug} (${boss.name})`);
  }
}

const sorted = Object.fromEntries(Object.entries(icons).sort(([a], [b]) => a.localeCompare(b)));
writeFileSync(OUT, `${JSON.stringify(sorted, null, 2)}\n`);
console.log(`${Object.keys(icons).length} bosses with an icon, ${missing.length} without`);
for (const m of missing) console.log(`  missing: ${m}`);
