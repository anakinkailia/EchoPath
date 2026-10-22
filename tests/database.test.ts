// Execute the actual migration in embedded PostgreSQL. Hosted gateway behavior still requires Supabase smoke tests.
// @vitest-environment node
import { PGlite } from "@electric-sql/pglite";
import { readdir, readFile } from "node:fs/promises";
import { afterAll, beforeAll, expect, it } from "vitest";
import { demoExperiences } from "../src/data";
const db = new PGlite();
beforeAll(async () => {
  await db.exec(
    "create role anon; create role authenticated; create role service_role bypassrls;",
  );
  // Apply every migration in order, as `supabase db push` would.
  for (const file of (await readdir("supabase/migrations")).sort()) {
    const migration = await readFile(`supabase/migrations/${file}`, "utf8");
    // PGlite has core gen_random_uuid; pgcrypto is a hosted extension unavailable in this embedded build.
    await db.exec(
      migration.replace("create extension if not exists pgcrypto;", ""),
    );
  }
  for (let i = 0; i < 2; i++) {
    const {
      insights: _insights,
      model_version: _model,
      provenance: _provenance,
      id: _id,
      ...value
    } = demoExperiences[i];
    void [_insights, _model, _provenance, _id];
    const record = { ...value, status: i ? "pending" : "published" };
    const keys = Object.keys(record);
    await db.query(
      `insert into public.experiences (${keys.join(",")}) values (${keys.map((_, i) => "$" + (i + 1)).join(",")})`,
      Object.values(record),
    );
  }
}, 30000);
afterAll(async () => {
  await db.close();
});
it("public readers can see only published consented records", async () => {
  await db.exec("set role anon");
  try {
    const { rows } = await db.query(
      "select role_title from public.experiences",
    );
    expect(rows).toHaveLength(1);
    expect(rows[0]).toEqual({ role_title: "Business Analytics Intern" });
  } finally {
    await db.exec("reset role");
  }
});
it("public users cannot publish, edit or delete submissions or access private tables", async () => {
  await db.exec("set role anon");
  try {
    for (const sql of [
      "update public.experiences set status='published'",
      "delete from public.experiences",
      "insert into public.experiences(role_title) values('bad')",
      "select * from public.feedback",
      "select * from public.roadmaps",
      "select * from public.roadmap_tasks",
      "select public.consume_request('abuse',100)",
    ]) {
      await expect(db.exec(sql)).rejects.toThrow(/permission denied/);
    }
  } finally {
    await db.exec("reset role");
  }
});
it("backend rate limiting counts atomically and rejects over quota", async () => {
  const first = await db.query<{ allowed: boolean }>(
    "select public.consume_request('bucket',2) as allowed",
  );
  const second = await db.query<{ allowed: boolean }>(
    "select public.consume_request('bucket',2) as allowed",
  );
  const third = await db.query<{ allowed: boolean }>(
    "select public.consume_request('bucket',2) as allowed",
  );
  expect([
    first.rows[0].allowed,
    second.rows[0].allowed,
    third.rows[0].allowed,
  ]).toEqual([true, true, false]);
});
