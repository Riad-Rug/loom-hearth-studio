import assert from "node:assert/strict";
import { test } from "node:test";
import { withDefaultDelivery } from "./default-delivery.mjs";

test("adds default delivery to raw Cloudinary URLs", () => {
  assert.equal(
    withDefaultDelivery("https://res.cloudinary.com/demo/image/upload/rug.jpg"),
    "https://res.cloudinary.com/demo/image/upload/w_1920,c_limit,q_auto,f_auto/rug.jpg",
  );
});

test("inserts transforms before a version segment", () => {
  assert.equal(
    withDefaultDelivery("https://res.cloudinary.com/demo/image/upload/v123/folder/rug.jpg"),
    "https://res.cloudinary.com/demo/image/upload/w_1920,c_limit,q_auto,f_auto/v123/folder/rug.jpg",
  );
});

test("preserves transformed, non-Cloudinary and relative URLs", () => {
  const transformed = "https://res.cloudinary.com/demo/image/upload/c_fill,w_400/rug.jpg";
  assert.equal(withDefaultDelivery(transformed), transformed);
  assert.equal(withDefaultDelivery("https://example.com/rug.jpg"), "https://example.com/rug.jpg");
  assert.equal(withDefaultDelivery("/rug.jpg"), "/rug.jpg");
});

test("is idempotent and preserves query strings and extensions", () => {
  const raw = "https://res.cloudinary.com/demo/image/upload/v123/rug.png?foo=bar";
  const once = withDefaultDelivery(raw);
  assert.equal(withDefaultDelivery(once), once);
  assert.ok(once.endsWith("v123/rug.png?foo=bar"));
});

test("withDefaultDelivery honours a requested width", () => {
  assert.equal(
    withDefaultDelivery("https://res.cloudinary.com/demo/image/upload/a.jpg", 800),
    "https://res.cloudinary.com/demo/image/upload/w_800,c_limit,q_auto,f_auto/a.jpg",
  );
});
