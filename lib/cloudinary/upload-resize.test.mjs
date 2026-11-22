import assert from "node:assert/strict";
import { test } from "node:test";
import { computeTargetSize, shouldSkipResize } from "./upload-resize.mjs";

test("computes bounded landscape, portrait and square dimensions without upscaling", () => {
  assert.deepEqual(computeTargetSize(5200, 2600, 2600), { width: 2600, height: 1300 });
  assert.deepEqual(computeTargetSize(2600, 5200, 2600), { width: 1300, height: 2600 });
  assert.deepEqual(computeTargetSize(4000, 4000, 2600), { width: 2600, height: 2600 });
  assert.deepEqual(computeTargetSize(1200, 800, 2600), { width: 1200, height: 800 });
});

test("handles exactly max edge and one-pixel dimensions", () => {
  assert.deepEqual(computeTargetSize(2600, 1700, 2600), { width: 2600, height: 1700 });
  assert.deepEqual(computeTargetSize(5201, 1, 2600), { width: 2600, height: 1 });
  assert.deepEqual(computeTargetSize(1, 5201, 2600), { width: 1, height: 2600 });
});

test("invalid dimensions safely produce zero target dimensions", () => {
  assert.deepEqual(computeTargetSize(0, 100, 2600), { width: 0, height: 0 });
  assert.deepEqual(computeTargetSize(Number.NaN, 100, 2600), { width: 0, height: 0 });
  assert.deepEqual(computeTargetSize(100, 100, Number.NaN), { width: 0, height: 0 });
});

test("skips unsupported types and small files already within the limit", () => {
  assert.equal(shouldSkipResize({ type: "image/gif", width: 5000, height: 3000, size: 2_000_000 }), true);
  assert.equal(shouldSkipResize({ type: "image/png", width: 1200, height: 800, size: 599 * 1024 }), true);
  assert.equal(shouldSkipResize({ type: "image/jpeg", width: 2600, height: 2600, size: 599 * 1024 }), true);
  assert.equal(shouldSkipResize({ type: "image/webp", width: 2601, height: 1000, size: 100_000 }), false);
  assert.equal(shouldSkipResize({ type: "image/png", width: 1000, height: 1000, size: 600 * 1024 }), false);
});
