# Assets

Static files that the app imports. Vite gives each one a content-hashed name at build
time, so nginx can cache them for a year and a changed file always gets a new URL.

| Folder    | For                                                                                |
| --------- | ---------------------------------------------------------------------------------- |
| `icons/`  | Icon families: races, and later classes, specs, roles, factions                    |
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

### Races

- `races/<style>/<slug>-<male|female>.png`, 26 races. The race ids each one covers are in
  `src/lib/wow/races.ts`.
- Not drawn yet: `modern/bloodelf-*` (classic is used instead).
- Kept but not mapped: `classic/dracthyr-visage-*`. The API doesn't say which form a
  Dracthyr is in.

## Rules

- **Theme colours:** SVG icons that should follow the theme use `fill="currentColor"`, so
  they take colour from CSS (`--color-accent`, `--color-class-*`).
- **Size:** keep files small. Resize or compress anything over ~200 KB.
- **Licensing:** only add art we may publish on a public site. Game art falls under
  Blizzard's terms for fan sites. Per-character images (avatars, dungeon art) come as
  URLs from Soulseeker (`thumbnailUrl`, `media.avatar`, `iconUrl`) and aren't stored here.
- **`public/` is not for assets.** It holds only files that need a fixed, unhashed URL
  (`config.js`, and later `favicon` or `robots.txt`).
