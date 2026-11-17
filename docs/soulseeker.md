# Using Soulseeker from Farseer

Farseer is the front end that Soulseeker serves; in production that is `https://rankwarden.gg`.
Soulseeker's API is at `https://api.rankwarden.gg`, or `http://localhost:3001` when you run it locally.

The [Soulseeker Handbook](https://claude.ai/artifact/NinpdHpweHpZmjF6N5kmxv) is the
reference for every endpoint, parameter and response. Soulseeker's `SKILLS.md` has the
details. This page covers only what the front end has to get right.

## Origins (CORS)

Soulseeker accepts token requests only from origins listed in its `CORS_ORIGINS`. Any
other origin gets **403 "origin not allowed"**.

| Where                            | Farseer origin                                                | Allowed by Soulseeker                       |
| -------------------------------- | ------------------------------------------------------------- | ------------------------------------------- |
| Local                            | `http://localhost:5173` (the Vite dev server; keep this port) | yes, by default                             |
| Production                       | `https://rankwarden.gg`                                       | yes                                         |
| Anything else (previews, `www.`) |                                                               | add it to Soulseeker's `CORS_ORIGINS` first |

## Tokens

Every call needs a token, except `/health*` and `/oidc/*`.

1. To get a token pair, send `POST {api}/oidc/token` with a form-encoded body:
   `grant_type=urn:soulseeker:grant-type:anonymous` and `client_id=soulseeker-web`.
2. Send `Authorization: Bearer <access_token>` on every call. The access token lasts **600 s**.
3. To renew, send `grant_type=refresh_token` with `client_id=soulseeker-web` and the
   `refresh_token`. The refresh token **rotates on every use**, and using an old one
   revokes the whole session. Run only one refresh at a time and share it between
   requests, so that two requests never refresh in parallel.
4. Logout is `POST {api}/oidc/token/revocation`.

| Answer                      | Front-end action                                                                                                   |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| 401 `invalid_token`         | Refresh once, then retry. If the refresh fails, start a new anonymous grant.                                       |
| 429 + `Retry-After`         | Back off. Limits are 120 per minute per session and 600 per minute per IP. Token issuance is 10 per minute per IP. |
| 503 + `Retry-After`         | Soulseeker's upstream budget is used up and nothing is cached. Show "try again shortly".                           |
| 400 `{ message, issues[] }` | Bug in our query parameters. `issues` lists each bad field.                                                        |

## Conventions that shape the UI

- **Regions.** PvP boards accept `us eu kr tw world`. The PvP character page accepts `us eu kr tw`. PvE characters and guilds also accept `cn`. Mythic+ and raid boards default to `world`.
- **Slugs.** Class and spec are lowercase letters only (`deathknight`, `beastmastery`), and a spec always comes with its class. Raids, seasons and dungeons use Raider.io slugs, and `current` is a valid value.
- **Paging.** Send `page` (starts at 1) and `pageSize` (default 50, max 100). Answers include `total` and `totalPages`.
- **Stale data.** Character and guild pages may answer with `"stale": true`. Show it, don't hide it.
- **Shares differ by endpoint.** PvP `share` is 0–1. PvE `percent` and `rolePercent` are 0–100.
- **`isFullyCovered: false`** on the Mythic+ leaderboard means the score is a partial sum. Flag it in the UI.
- **`forceRefresh=true`** on character and guild pages works at most once every 5 minutes per character or guild.

## Swagger

When you run Soulseeker locally, `http://localhost:3001/docs` lists every route, generated from the same schemas that validate requests.
