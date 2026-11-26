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
  - races: `raceIconUrl(race, gender, { style, faction })` in `src/lib/wow/races.ts`, or the
    `<RaceIcon race gender faction />` component. Race portraits are framed in faction
    colours, so a race both factions play has one file per faction:
    `<name>-<gender>-<faction>` (`pandaren-male-horde`);
  - a new family: `styledAssetUrl(family, style, name)` in `src/lib/assets.ts`, wrapped
    in a mapper from API data.

### Size

- **Source files: 128x128,** square. That is 2x the largest display size, so icons
  stay sharp on high-density screens. Shrink larger art to fit, centred on a transparent
  square. Don't enlarge smaller art: classic icons (56–66 px) stay as drawn.
- **Display sizes are shared by every family:** 24, 40 and 64 px (`src/styles/iconSizes.ts`).
  `<GameIcon>` draws every family in the same square box, so a file that isn't square is
  shown whole and centred. Round art that carries its own frame (classes, specs, hero
  talents, races) uses `shape="round"`: a circle with no box border or background.

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
- Every race has a portrait in both styles. A future gap would fall back to the other style;
  list it in `KNOWN_MISSING` in `races.test.ts`.
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

### Expansions

`icons/expansions/<name>.png`, one look, 128 px: each expansion's logo, trimmed, shrunk to fit
and centred on a transparent square (the logos are wide, so most are 50–62 px tall). Names:
`vanilla`, `tbc`, `wotlk`, `cataclysm`, `mop`, `wod`, `legion`, `bfa`, `shadowlands`,
`dragonflight`, `tww`, `midnight`, `tlt` (The Last Titan) and `forever`. Read them by path:
`iconUrl('expansions/tww')`.

### Raid difficulty

`icons/difficulty/<normal|heroic|mythic>.png` (128 px) and `icons/difficulty/svg/<…>.svg`:
the Raid icon's dragon coiled around a dark well holding the difficulty's skull. The dragon's
metal rises with the difficulty: bronze (normal, plain skull), silver (heroic, fanged skull),
gold (mythic, fanged skull with red eyes).

- The SVGs are posterised traces of the PNGs (fixed dragon and skull colours). Only the well
  behind the skull is `currentColor` (the faction accent) under a dark gradient, so inline
  them; as an `<img>` the well falls back to black. Gradient ids are `rw-diff-<difficulty>-well`.
- The SVGs live in `svg/` because `iconUrl` keys files by path without extension: a `.png`
  and `.svg` of the same name in one folder would clash.
- Read them by path: `iconUrl('difficulty/mythic')` or `iconUrl('difficulty/svg/mythic')`.

### PvP brackets

- `pvp/brackets/<bracket>.png`, one look, 128 px, named by Soulseeker's bracket slug (`2v2`,
  `3v3`, `rbg`, `shuffle`, `blitz`), so an icon is looked up straight from the bracket. Game
  art in the role icons' round frame, zoomed out to fit the circle whole, its background
  continued to the rim.
- `2v2.png`: two crossed golden axes on dark red, in the DPS frame.
- `3v3.png`: three golden swords on purple, in the DPS frame; the blades, cut by the source's
  bottom edge, are continued down to the rim.
- `rbg.png`: a charging rider with a banner in silhouette on magenta, fitted to the circle
  (the scene leaves through the rim), in the DPS frame.
- `blitz.png`: the same scene as `rbg` in orange, made the same way.
- `shuffle.png`: a classic orange-guarded sword with a glowing coin (cut from a model
  render, set upright), on a dark red field in the DPS frame.
- Read them by path with `iconUrl('pvp/brackets/2v2')`.
- SVG versions in `pvp/brackets/svg/<bracket>.svg` (a subfolder, because `iconUrl` keys by
  path without extension): single-colour `currentColor` drawings without the round frame,
  detail from a lighter shade (`fill-opacity`) and cut-out gaps, like the nav icons. `2v2`
  two crossed battle axes; `3v3` three swords pointing down; `shuffle` the classic sword,
  upright; `rbg` the charging flag carrier traced from the RBG/Blitz art; `blitz` the same
  carrier with a stopwatch behind it. Mask ids are `rw-<bracket>-…`.

### Specs and hero talents

Both have one look and are grouped by class, in a folder named after the class in kebab
case (`death-knight`, `demon-hunter`):

```
icons/specs/<class>/<spec slug>.png           specs/hunter/beastmastery.png
icons/hero-talents/<class>/<tree>.png         hero-talents/druid/elunes-chosen.png
```

- **Specs:** 40 (spirit-link's `SPECIALIZATIONS`), named by Soulseeker's slug. They are 56 px round PNGs (the art kept at its original
  size) with the class's rim, like the class and hero talent icons. Use `specIconUrl(spec, cls?)` or `<SpecIcon spec cls />`
  (`src/lib/wow/specs.ts`).
- **Hero talents:** 41 trees, 128 px, round, with the class's rim. The file is the tree name in kebab case without
  apostrophes (`San'layn` → `sanlayn`). Use `heroTreeIconUrl(tree)` or
  `<HeroTalentIcon tree />` (`src/lib/wow/heroTalents.ts`).

### Style switch

`icons/styles/<classic|modern>-<horde|alliance>.png`, 128 px, for the header switch between
the two asset styles. Each shows three icons of its style together, as they are (no filters):
Horde a monk class icon, a male Blood Elf portrait and the Horde emblem; Alliance a mage class
icon, a female Gnome portrait and the Alliance emblem. Pick the pair by the user's faction.
Read them by path: `iconUrl('styles/modern-horde')`.

### Navigation

`icons/nav/<name>.svg`, one look: monochrome SVG icons for navigation buttons, coloured by
the faction accent. Every shape is `fill="currentColor"`; detail comes from cut-outs and
lower opacity (`fill-opacity`) only, never from a second colour, so the icon follows the
accent in both factions. No frame, no text.

- `home.svg`: a hall with the hearthstone swirl (traced from the game's housing icon) in
  the doorway.
- `search.svg`: a magnifying glass; the glass is a lighter shade with a highlight cut out.
- `leaderboards.svg`: the logo's podium (1st solid with a star cut out and a crown above;
  2nd and 3rd in lighter shades).
- `stats.svg`: a line graph (L axes, rising line with data points, area under it in a lighter
  shade).
- `rating.svg`: the stats line graph ending in a star instead of a last data point.
- `mplus-characters.svg`: Mythic+ All Characters. A warrior silhouette (traced from the user's
  art, its highlights cut out) with a sword, a trophy on the ground between his feet (a gleam
  and a star cut out, a gap from the legs).
- `mplus-runs.svg`: Mythic+ Runs. The keystone pentagram: a pentagon with a rune in a node at
  each corner, two rune rings (thin rings, the runes as lighter dashes) and the hourglass
  medallion with diamond points in the middle.
- `mplus-class-roles.svg`: Mythic+ Classes & Roles. The same group: the paladin class icon on
  top, the Healer, Melee DPS and Tank role icons below, all traced from the art by tone (the
  healer's cross by how pale it is, so its shaded lower arm stays solid).
- `mplus-specs.svg`: Mythic+ Specs. A class and its specs: the warrior class icon in a large
  node on top, Arms, Fury and Protection below in a shallow arc (no connecting lines, so the
  icons are as large as the square allows; at the menu's 22 px the lines made them too small to
  recognise). Each icon is traced from the game art by tone (light solid, mid tones lighter,
  dark empty).
- `spec-representation.svg`: a bar chart on the stats axes, five columns tallest to
  shortest, rounded solid tops over lighter bodies.
- `hall-of-fame.svg`: a red carpet in perspective (lighter, its trims solid) up three steps
  to a pedestal with a trophy (star and gleam cut out), stanchions with sagging ropes on both
  sides.
- `compositions.svg`: Compositions. Five role icons packed in a quincunx (Tank and Healer on
  top, Melee DPS in the middle and lower left, Ranged DPS lower right), each traced from its
  role icon by tone.
- `cutoffs.svg`: a straight rising line on the stats axes (area under it lighter) ending at
  an open treasure chest full of gold (lid open, coins, lighter wood, hasp and lock) with two
  sparkles.
- `flavour-of-the-month.svg`: the most popular specs right now. A calendar page (lighter)
  with a flame on it as the dates and a small rising trend arrow in the header band as the
  month (kept apart from the band by a gap).
- `tier-list.svg`: a tier list. Five rows, each a label tile (S, A, B, C, D cut out) followed
  by round ability icons (solid rim, lighter face).
- `archives.svg`: an old tome for previous seasons (spine and hourglass cut out, the page
  block in a lighter shade, a bookmark ribbon).
- `character.svg`: the Lich King's helm, traced from the Wrath of the Lich King silhouette.
- `gear.svg`: Frostmourne, traced from a render (skull crossguard, jagged blade, the rune channel
  cut out and four runes engraved above it).
- `talents.svg`: a modern talent tree (square active, round passive and a split octagonal
  choice node; chosen talents solid, the rest lighter).
- `copy.svg`: two sheets (the back one lighter, the front one solid), for copy actions.
- `external.svg`: a window frame (lighter) with a solid arrow leaving it, for links that open
  an external site in a new tab.
- `refresh.svg`: two curved arrows chasing each other round a circle.
- `scroll-top.svg`: a solid arrow pointing up at a lighter bar (the top of the page).
- `page-first.svg`, `page-prev.svg`, `page-next.svg`, `page-last.svg`: pagination. A
  chevron (previous, next), or a chevron pointing at a bar (first, last).
- `bosses.svg`: Illidan's silhouette (horns, spread wings), traced from a sticker. **The one
  exception to the single-colour rule:** his warglaives (`#85bb6f`) and fel tattoos and eyes
  (`#abdaa4`) have fixed fel-green fills, so they stay green in both factions; only the body
  follows the accent. As a CSS mask it would lose the green, so inline it.
- `guild-alliance.svg`, `guild-horde.svg`: a guild tabard with the faction's emblem, traced
  from `factions/classic/`; pick the file by faction. The cloth (lighter) and emblem follow
  the accent; the tabard border and the emblem's metal (Alliance: gold lion on an accent
  field; Horde: the symbol edged in silver) use `var(--color-trim)` when inlined, falling back
  to palette gold/silver 500. Also an exception to the single-colour rule: inline them.
- Colour them with the accent either inline (`color: var(--color-accent)`, e.g. through an
  SVG-as-component import) or as a CSS mask:
  `mask: url(…) center / contain no-repeat; background: var(--color-accent)`.
- Draw on a 64×64 `viewBox` with shapes that still read at 24 px. Give mask or gradient
  ids a `rw-<icon>-` prefix so inlined icons never clash.

### Game modes

`icons/game-modes/<mode>.png`, one look, 128 px: `pvp`, `pve`, `mplus` and `raid`.
Navigation icons that switch the site between game modes, so they have no round frame: the
art's own shape with its label ("PvP", "PvE", "Mythic+", "Raid") underneath in light gold
(Georgia Bold, dark outline; a long label is shrunk to fit the width). PvP is
`pvp/ranked/rankedpvp_07.png`; PvE is a shield with fist, warhammer and pauldron; Mythic+ is
the keystone banner (hourglass orb), its cloth recoloured to the PvE shield's off-white and
its gems to sapphire. Raid is the same banner with a boss skull in a red orb, a gold dragon
coiled round it, and the three strips in role colours with gold role marks: healer cross on
green (left), tank shield on blue (middle), DPS swords on red (right).
Read them by path with `iconUrl('game-modes/pvp')`.

### Places

`icons/places/place-<1|2|3>.png`, one look, 128 px: badges for the top three (e.g. top
guilds). A crowned, studded medallion with the embossed place number, a laurel wreath, a
crimson ribbon with stars (3, 2, 1) and a light burst. 1st is palette gold with rubies, 2nd
palette silver with sapphires, 3rd bronze (not in the palette: `#c27a3c` family) with
emeralds. Read them by path with `iconUrl('places/place-1')`.

### Info

`icons/info/<name>.png`, one look, 128 px: informational icons in the role icons' round frame
(stone and copper rings, a coloured field).

- `item-level.png`: a sword in a plate gauntlet with a green up-arrow (game art), in the
  healer frame. The arrowhead's right half and the stem's end were completed to fit the
  circle.
- `deaths.png`: a human skull (game art, `inv_misc_bone_humanskull_02`), in the DPS frame.
- `vantus-rune.png`: the glowing Vantus rune (game art), in the DPS frame.
- `embellishments.png`: a rolled hide with a red ribbon and three gold quality stars (game
  art), in the tank frame; the art is zoomed out and its teal background continued to the rim.
- `enchants.png`: a glowing enchanting scroll (game art), in the DPS frame; fitted to the
  circle, the scroll leaves through the rim as it leaves the original image.
- `tier-set.png`: a tier set as a bust: helm (game art) in front of the two pauldrons
  (emblems facing in, blades out), on a dark blue field in the tank frame.
- `unknown.png`: the game's red 3D question mark, for anything unknown, in the DPS frame;
  zoomed out to fit the circle, the top of its arc (cut by the source's edge) completed.
- `gems.png`: a sack spilling coloured gems (600 px art, fits the circle whole), in the tank
  frame.
- The art of `deaths` and `vantus-rune` is zoomed out so the whole image fits the circle;
  its background fades into a dark fill in its own tone, and the subject is kept intact.

Read them by path with `iconUrl('info/item-level')`.

### Roles

`icons/roles/<role>.png`, one look, 128 px: `tank`, `healer`, `dps`, plus `dps-melee`
(crossed daggers) and `dps-ranged` (bow and arrow). The two DPS variants were built from
`dps.png`'s frame, background and glow; their full-size art is with the originals. Use
`roleIconUrl(role, subRole?)`, `specRoleIconUrl(spec, cls?)`, or
`<RoleIcon role subRole />` / `<RoleIcon spec cls />` (`src/lib/wow/roles.ts`). `dps` is
for a damage dealer whose melee/ranged split is unknown. `all` (a green flag on a teal field,
in the tank frame) stands for every role, e.g. a "show all roles" filter; it isn't a role in
`roles.ts` yet, so read it by path with `iconUrl('roles/all')`.

### Classes

- `classes/<style>/<slug>.png`, 13 classes. The slug is Soulseeker's (`deathknight`,
  `demonhunter`). Ids and names are in `src/lib/wow/classes.ts`.
- Use `classIconUrl(cls, { style })` or `<ClassIcon cls />`. Class colours come from
  `classColorVar(cls)`.
- Both styles are round, transparent PNGs. Modern: 88 px, a gold frame with corner
  ornaments. Classic: 128 px, a metal rim tinted in the class colour.

- **Modern class files pad the art:** an 88 px canvas with the round icon 63 px wide in the
  middle (every class). `<ClassIcon>` scales them by `CLASS_ICON_ART_FILL` so they fill the
  same circle as other icons. If the files are re-cut to fill their canvas, set the modern
  value to `1`.

## Logo

`images/logo/`, the Rankwarden brand: a gold laurel wreath around a silver/gold/bronze
podium, crown above, a Horde-red and Alliance-blue ribbon, in the palette's gold, silver,
horde and alliance colours.

- `rankwarden-logo.svg`: emblem + "RANKWARDEN" wordmark (RANK in gold, WARDEN in silver).
  The wordmark is outlined (Georgia Bold paths), so it renders the same everywhere.
  Used by `<AppHeader>`.
- `rankwarden-emblem.svg`: the emblem alone, for square places.
- Favicons are copies in `public/`: `favicon.svg`, `favicon.ico` (16/32/48 px) and
  `apple-touch-icon.png` (180 px on the app background, as iOS shows no transparency).
  Regenerate them from the emblem when it changes.

## Rules

- **Theme colours:** SVG icons that should follow the theme use `fill="currentColor"`, so
  they take colour from CSS (`--color-accent`, `--color-class-*`).
- **Size:** keep files small. Resize or compress anything over ~200 KB.
- **Licensing:** only add art we may publish on a public site. Game art falls under
  Blizzard's terms for fan sites. Per-character images (avatars, dungeon art) come as
  URLs from Soulseeker (`thumbnailUrl`, `media.avatar`, `iconUrl`) and aren't stored here.
- **`public/` is not for assets.** It holds only files that need a fixed, unhashed URL
  (`config.js`, and later `favicon` or `robots.txt`).
