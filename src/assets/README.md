# Assets

Static files that the app imports. Vite gives each one a content-hashed name at build
time, so nginx can cache them for a year and a changed file always gets a new URL.

| Folder    | For                                                                                |
| --------- | ---------------------------------------------------------------------------------- |
| `icons/`  | Icon families: races, classes, and later specs, roles, factions                    |
| `images/` | Larger graphics: backgrounds, banners, logos (WebP/AVIF for photos, SVG for logos) |
| `fonts/`  | Self-hosted web fonts (`.woff2` only)                                              |

## Icon families have two styles

Every icon family comes in a **modern** and a **classic** look. The user picks one
(preference `assetStyle`, default `modern`), and the whole UI follows it.

```
icons/<family>/<style>/<name>.<png|svg|webp>
icons/races/modern/nightelf-female.png
icons/races/classic/nightelf-female.png
```

- **Name files after the API slug** in lowercase, without separators, as Soulseeker
  spells them (`nightelf`, `darkirondwarf`, `deathknight`). Add a variant after a
  hyphen: `<slug>-<gender>`.
- **Use the same name in both styles where you can.** A name that differs in one style
  (Pandaren is `panda` in modern) is declared in that family's mapper (`iconName`).
- **A file missing from one style is fine.** It falls back to the other style. Each
  family's tests list such gaps (`KNOWN_MISSING`) and fail if a file is misnamed or a gap
  appears that isn't listed.
- **Never import icon files directly.** Go through the family's mapper so the user's style applies:
  - races: `raceIconUrl(race, gender, { style })` in `src/lib/wow/races.ts`, or the
    `<RaceIcon race gender />` component;
  - a new family: `styledAssetUrl(family, style, name)` in `src/lib/assets.ts`, wrapped
    in a mapper from API data.

### Size

- **Source files: 128x128,** square. That is 2x the largest display size, so icons
  stay sharp on high-density screens. Shrink larger art to fit, centred on a transparent
  square. Don't enlarge smaller art: classic icons (56–66 px) stay as drawn.
- **Display sizes are shared by every family:** 24, 40 and 64 px (`src/styles/iconSizes.ts`).
  `<GameIcon>` draws every family in the same square box, so a file that isn't square is
  shown whole and centred.

### Factions

- `factions/<style>/{alliance,horde}.png`, the faction emblems, in both styles. Use
  `factionIconUrl(faction, { style })` or `<FactionIcon faction />`
  (`src/lib/wow/factions.ts`).
- The faction colours in `src/styles/palette.ts` are sampled from the **classic** emblems:
  blue/red for the accent, gold/silver for the trim. Re-sample the palette if they change.
  The modern emblems differ: the Alliance lion is all gold, and the Horde red is crimson
  (`#860019`).

### Races

- `races/<style>/<slug>-<male|female>.png`, 26 races. The race ids each one covers are in
  `src/lib/wow/races.ts`.
- Not drawn yet: `modern/bloodelf-*` (classic is used instead).
- Kept but not mapped: `classic/dracthyr-visage-*`. The API doesn't say which form a
  Dracthyr is in.

### Race crests

Crests have **one look** (no modern/classic) and are grouped by faction:

```
icons/races/crests/<alliance|horde>/<name>-crest.png
```

- Each faction folder holds a crest for every race that faction can play: 15 each. Races
  both factions play (Pandaren, Dracthyr, Earthen, Haranir) are in both folders, with
  identical art today.
- `<name>` is the race slug, except `forsaken` (Undead), `darkiron` (Dark Iron Dwarf) and
  `zandalari` (Zandalari Troll). These are declared as `crestName` in
  `src/lib/wow/races.ts`.
- Use `raceCrestUrl(race, faction?)` or `<RaceCrest race faction />`. Tests fail on a
  missing or misnamed crest.

### PvP honor badges

- `pvp/honor/pvptier-<tier>.png`, 33 tiers, one look (no modern/classic), already 128 px.
- `HONOR_BADGES` in `src/lib/wow/honor.ts` gives the lowest honor level for each tier (5 →
  tier 1 … 500 → tier 21). Below level 5 there is no badge. Use `honorBadgeUrl(honor)` or
  `<HonorBadge honor />`.
- Tiers 22–33 have no known threshold yet and are never shown. They are listed in
  `UNMAPPED_TIERS` in `honor.test.ts`.

### PvP ranks

- `pvp/ranked/rankedpvp_0<1-8>.png`, one look, 128 px: Unranked, Combatant, Challenger,
  Rival, Duelist, Elite, Gladiator/Legend, Rank 1.
- `src/lib/wow/pvpRank.ts` maps both `pvpHistory` titles and current ratings to them. Use
  `<PvpRankIcon rank />`.

### Classes

- `classes/<style>/<slug>.<png|jpg>`, 13 classes. The slug is Soulseeker's (`deathknight`,
  `demonhunter`). Ids and names are in `src/lib/wow/classes.ts`.
- Use `classIconUrl(cls, { style })` or `<ClassIcon cls />`. Class colours come from
  `classColorVar(cls)`.
- Modern icons are 128 px transparent PNGs. Classic icons are 56 px JPEGs, kept at their
  original size because enlarging them adds no detail.

## Rules

- **Theme colours:** SVG icons that should follow the theme use `fill="currentColor"`, so
  they take colour from CSS (`--color-accent`, `--color-class-*`).
- **Size:** keep files small. Resize or compress anything over ~200 KB.
- **Licensing:** only add art we may publish on a public site. Game art falls under
  Blizzard's terms for fan sites. Per-character images (avatars, dungeon art) come as
  URLs from Soulseeker (`thumbnailUrl`, `media.avatar`, `iconUrl`) and aren't stored here.
- **`public/` is not for assets.** It holds only files that need a fixed, unhashed URL
  (`config.js`, and later `favicon` or `robots.txt`).
