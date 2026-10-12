import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const workflow = readFileSync(
  new URL("../.github/workflows/deploy-worker.yml", import.meta.url),
  "utf8",
).replaceAll("\r\n", "\n");

test("D1 without the application channels table receives the base schema before migrations", () => {
  const checkStart = workflow.indexOf("      - name: Check D1 schema initialization\n");
  const initStart = workflow.indexOf("      - name: Initialize D1 schema when empty\n");
  const migrationsStart = workflow.indexOf("      - name: Prepare D1 migrations\n");

  assert.ok(checkStart > 0);
  assert.ok(initStart > checkStart);
  assert.ok(migrationsStart > initStart);

  const checkStep = workflow.slice(checkStart, initStart);
  assert.match(checkStep, /sqlite_master/);
  assert.match(checkStep, /channels/);
  assert.match(checkStep, /GITHUB_OUTPUT/);

  const initStep = workflow.slice(initStart, migrationsStart);
  assert.match(initStep, /steps\.ensure_resources\.outputs\.d1_created == 'true' \|\| steps\.check_d1\.outputs\.d1_initialized == 'false'/);
  assert.match(initStep, /worker\/schema\.sql/);
});
