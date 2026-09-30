import { Router, type IRouter, type Response } from "express";
import type { HeritageSite } from "@workspace/api-zod";
import { getIndiaHeritage } from "../services/heritage";

const router: IRouter = Router();
const unavailableMessage =
  "Heritage data is temporarily unavailable. Please try again.";

async function sendRecords(
  res: Response,
  select: (records: HeritageSite[]) => HeritageSite[] = (records) => records,
) {
  try {
    const records = await getIndiaHeritage();
    res.json(select(records));
  } catch {
    res.status(503).json({ error: unavailableMessage });
  }
}

router.get("/heritage", async (_req, res) => {
  await sendRecords(res);
});

router.get("/heritage/india", async (_req, res) => {
  await sendRecords(res);
});

router.get("/heritage/search", async (req, res) => {
  const query = typeof req.query.q === "string" ? req.query.q.trim() : "";
  if (!query) {
    res.status(400).json({ error: "A search query is required." });
    return;
  }

  const normalizedQuery = query.toLocaleLowerCase();
  await sendRecords(res, (records) =>
    records.filter((record) =>
      [
        record.name,
        record.country,
        record.state ?? "",
        record.region ?? "",
        record.category ?? "",
      ].some((value) => value.toLocaleLowerCase().includes(normalizedQuery)),
    ),
  );
});

router.get("/heritage/region/:region", async (req, res) => {
  const region = decodeURIComponent(req.params.region).toLocaleLowerCase();
  await sendRecords(res, (records) =>
    records.filter((record) =>
      (record.region ?? "").toLocaleLowerCase().includes(region),
    ),
  );
});

router.get("/heritage/:id", async (req, res) => {
  try {
    const records = await getIndiaHeritage();
    const record = records.find((item) => item.id === req.params.id);
    if (!record) {
      res.status(404).json({ error: "Heritage record not found." });
      return;
    }
    res.json(record);
  } catch {
    res.status(503).json({ error: unavailableMessage });
  }
});

export default router;