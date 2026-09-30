# BharatQuest

BharatQuest is an Expo mobile adventure prototype for exploring UNESCO World
Heritage sites in India through a map, source-backed records, missions, and
two mini-games.

## Replit workflows

- `artifacts/api-server: API Server` runs the shared Express API.
- `artifacts/bharatquest: expo` runs the Expo app.
- Check the mobile TypeScript project with
  `pnpm --filter @workspace/bharatquest run typecheck`.

## Heritage data

The API reads the UNESCO World Heritage DataHub `whc001` dataset, filters on
the `India` State Party field, normalizes its published site fields, and
persists the latest successful response in PostgreSQL's `heritage_cache` table.
The normalizer accepts UNESCO's current schema (`states_names` as text and
`coordinates` as a `[latitude, longitude]` array) as well as the older shapes.
An optional `UNESCO_API_KEY` environment variable is forwarded as an API-key
authorization header when the DataHub requires authenticated requests.
If UNESCO is unreachable, the service serves that database cache. If both are
unavailable, the API responds with a clear error instead of sample records.

Every app record identifies UNESCO as its source. Missing descriptions,
coordinates, dates, image credits, and other source fields remain unavailable.
The DataHub State Party field is not treated as an Indian administrative state.
Search, region filters, detail lookup, and category matching use the cached
records.

The illustrated game-world artwork and the schematic SVG map are conceptual.
Only UNESCO-provided coordinates place site markers; generated artwork is not
presented as a documentary image of a specific site. When UNESCO supplies an
image and attribution fields, the app displays those credits in the site story.

## Player progress and scope

XP, discoveries, achievements, mission progress, and demo preferences are
stored locally with AsyncStorage. XP and card rarity are game metadata, not
UNESCO classifications. “Near Me” requests location only after the player taps
the control; coordinates stay in memory for the current screen and are not sent
to the API or saved.

The reminder setting is a local preference only; this prototype does not send
push notifications. Regional languages and the features marked “Coming Soon”
are not implemented. AI is not used.