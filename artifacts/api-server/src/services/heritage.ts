import { heritageCache } from "@workspace/db";
import { eq } from "drizzle-orm";
import type { HeritageSite as HeritageRecord } from "@workspace/api-zod";
import { db } from "@workspace/db";
import { logger } from "../lib/logger";

const DATASET_URL = "https://data.unesco.org/explore/dataset/whc001/";
const API_URL =
  "https://data.unesco.org/api/explore/v2.1/catalog/datasets/whc001/records";
const UNESCO_API_KEY = process.env.UNESCO_API_KEY?.trim() || null;
const CACHE_KEY = "unesco-india";
const SELECTED_FIELDS = [
  "id_no",
  "name_en",
  "description_en",
  "short_description_en",
  "states_names",
  "region",
  "coordinates",
  "category",
  "date_inscribed",
  "criteria_txt",
  "main_image_url",
  "main_image_author",
  "main_image_copyright",
  "main_image_caption_en",
  "components_list",
].join(",");

interface UnescoRecord {
  id_no?: number | string | null;
  name_en?: string | null;
  description_en?: string | null;
  short_description_en?: string | null;
  // UNESCO currently exposes `states_names` as a text field and
  // `coordinates` as a [latitude, longitude] geo-point array. Keep support
  // for the older shapes as well so the normalizer is resilient to schema
  // changes in the upstream DataHub.
  states_names?: string | string[] | null;
  region?: string | null;
  coordinates:
    | [number, number]
    | { lat?: number | null; lon?: number | null }
    | null
    | undefined;
  category?: string | null;
  date_inscribed?: string | null;
  criteria_txt?: string | null;
  main_image_url?: string | null;
  main_image_author?: string | null;
  main_image_copyright?: string | null;
  main_image_caption_en?: string | null;
  components_list?: string | null;
}

function textOrNull(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function finiteNumberOrNull(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function hasIndiaStateParty(value: string | string[] | null | undefined): boolean {
  const values = Array.isArray(value) ? value : value ? [value] : [];

  return values
    .flatMap((item) => item.split(/[;,]/))
    .some((item) => item.trim() === "India");
}

function normalizeRecord(record: UnescoRecord): HeritageRecord | null {
  const id = record.id_no == null ? "" : String(record.id_no).trim();
  const name = textOrNull(record.name_en);
  if (!id || !name || !hasIndiaStateParty(record.states_names)) {
    return null;
  }

  const yearText = textOrNull(record.date_inscribed);
  const parsedYear = yearText ? Number.parseInt(yearText, 10) : Number.NaN;
  const coordinates = record.coordinates;
  const latitude = Array.isArray(coordinates)
    ? finiteNumberOrNull(coordinates[0])
    : finiteNumberOrNull(coordinates?.lat);
  const longitude = Array.isArray(coordinates)
    ? finiteNumberOrNull(coordinates[1])
    : finiteNumberOrNull(coordinates?.lon);

  return {
    id,
    name,
    description: textOrNull(record.description_en),
    shortDescription: textOrNull(record.short_description_en),
    country: "India",
    // UNESCO's `states_names` field lists State Parties, not Indian
    // administrative states. Leave state unavailable instead of guessing.
    state: null,
    region: textOrNull(record.region),
    latitude,
    longitude,
    category: textOrNull(record.category),
    yearInscribed: Number.isFinite(parsedYear) ? parsedYear : null,
    criteria: textOrNull(record.criteria_txt),
    imageUrl: textOrNull(record.main_image_url),
    imageAuthor: textOrNull(record.main_image_author),
    imageCopyright: textOrNull(record.main_image_copyright),
    imageCaption: textOrNull(record.main_image_caption_en),
    components: textOrNull(record.components_list),
    sourceName: "UNESCO World Heritage DataHub",
    sourceUrl: DATASET_URL,
    sourceType: "UNESCO",
  };
}

function isHeritageRecord(value: unknown): value is HeritageRecord {
  if (!value || typeof value !== "object") return false;
  const record = value as Partial<HeritageRecord>;
  return (
    typeof record.id === "string" &&
    typeof record.name === "string" &&
    record.country === "India" &&
    record.sourceName === "UNESCO World Heritage DataHub" &&
    record.sourceUrl === DATASET_URL &&
    record.sourceType === "UNESCO"
  );
}

async function readDatabaseCache(): Promise<HeritageRecord[]> {
  const rows = await db
    .select({ payload: heritageCache.payload })
    .from(heritageCache)
    .where(eq(heritageCache.cacheKey, CACHE_KEY))
    .limit(1);
  const payload = rows[0]?.payload;

  return Array.isArray(payload) ? payload.filter(isHeritageRecord) : [];
}

async function writeDatabaseCache(records: HeritageRecord[]): Promise<void> {
  await db
    .insert(heritageCache)
    .values({ cacheKey: CACHE_KEY, payload: records, fetchedAt: new Date() })
    .onConflictDoUpdate({
      target: heritageCache.cacheKey,
      set: { payload: records, fetchedAt: new Date() },
    });
}

async function fetchFromUnesco(): Promise<HeritageRecord[]> {
  const url = new URL(API_URL);
  url.searchParams.set("where", "states_names='India'");
  url.searchParams.set("limit", "100");
  url.searchParams.set("order_by", "name_en");
  url.searchParams.set("select", SELECTED_FIELDS);

  const headers: HeadersInit = { Accept: "application/json" };
  if (UNESCO_API_KEY) {
    headers.Authorization = `Apikey ${UNESCO_API_KEY}`;
  }

  const response = await fetch(url, {
    headers,
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    throw new Error(`UNESCO returned HTTP ${response.status}`);
  }

  const body: unknown = await response.json();
  if (!body || typeof body !== "object" || !("results" in body)) {
    throw new Error("UNESCO returned an unexpected response.");
  }

  const results = (body as { results?: unknown }).results;
  if (!Array.isArray(results)) {
    throw new Error("UNESCO did not return a records list.");
  }

  const normalized = results
    .map((record) => normalizeRecord(record as UnescoRecord))
    .filter((record): record is HeritageRecord => record !== null);

  if (normalized.length === 0) {
    throw new Error("UNESCO returned no valid India records.");
  }

  return normalized;
}

let cachedRecords: HeritageRecord[] | null = null;
let loadPromise: Promise<HeritageRecord[]> | null = null;

async function initializeCache(): Promise<HeritageRecord[]> {
  let previousRecords: HeritageRecord[] = [];

  try {
    previousRecords = await readDatabaseCache();
  } catch (error) {
    logger.warn({ error }, "Unable to read UNESCO cache from PostgreSQL");
  }

  try {
    const records = await fetchFromUnesco();
    try {
      await writeDatabaseCache(records);
    } catch (error) {
      logger.warn({ error }, "Unable to save UNESCO records to PostgreSQL");
    }
    logger.info({ count: records.length }, "Loaded Indian UNESCO records");
    return records;
  } catch (error) {
    if (previousRecords.length > 0) {
      logger.warn(
        { error, cachedCount: previousRecords.length },
        "UNESCO is unavailable; serving the PostgreSQL cache",
      );
      return previousRecords;
    }
    throw error;
  }
}

export function getIndiaHeritage(): Promise<HeritageRecord[]> {
  if (cachedRecords) return Promise.resolve(cachedRecords);
  if (!loadPromise) {
    loadPromise = initializeCache()
      .then((records) => {
        cachedRecords = records;
        return records;
      })
      .catch((error: unknown) => {
        loadPromise = null;
        throw error;
      });
  }
  return loadPromise;
}

// Warm and refresh the persistent cache as the API server starts. Requests can
// still use the same promise and receive a clear 503 if both sources are down.
void getIndiaHeritage().catch((error: unknown) => {
  logger.warn({ error }, "UNESCO data unavailable during startup");
});