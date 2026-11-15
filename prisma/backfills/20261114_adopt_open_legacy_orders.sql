-- Gives orders placed before automatic reservation (inventoryHold NULL) the
-- stock they should hold: pending + authorized orders reserve their pieces
-- (hold "held"), paid orders not yet shipped mark them sold (hold "sold"). Later
-- capture, cancel, and expiry then settle them like any new order.
--
-- Dry run unless apply is true: everything below runs, prints what it would do,
-- and rolls back. Apply with:
--   psql "$DATABASE_URL" -v apply=1 -f prisma/backfills/20261114_adopt_open_legacy_orders.sql
--
-- Run after the code that understands inventoryHold is live, and before setting
-- CRON_SECRET. Safe to rerun: adopted orders are no longer NULL. Conservative:
-- an order is adopted only when every line can be covered for all legacy orders
-- at once, so two legacy orders for one rug are both left alone, and variant
-- lines are left alone. The output lists adopted orders, every product it
-- changed (before and after), and the orders a person still has to settle. If
-- the studio already took a legacy order's units out of stock by hand, settle
-- that order by hand instead: this script cannot tell and would take them again.
-- Hold expiries (OrderRecord.holdExpiresAt) are filled in by the daily cron,
-- which reads them from Stripe.

\set ON_ERROR_STOP on

BEGIN;

-- Orders first, then products: the same lock order checkout and order
-- transitions use, so a concurrent cancel or webhook waits instead of racing.
SELECT COUNT(*) AS legacy_orders_locked FROM (
  SELECT id FROM "OrderRecord"
  WHERE "inventoryHold" IS NULL
    AND ((status = 'pending' AND "paymentStatus" = 'authorized')
      OR (status IN ('paid', 'processing') AND "paymentStatus" = 'paid'))
  ORDER BY id
  FOR UPDATE
) locked_orders;

CREATE TEMP TABLE legacy_lines ON COMMIT DROP AS
SELECT o.id AS order_id, o."orderNumber" AS order_number, (o."paymentStatus" = 'paid') AS captured,
       li."productId" AS product_id, li.quantity, li.variant ->> 'id' AS variant_id
FROM "OrderRecord" o
JOIN "OrderLineItemRecord" li ON li."orderId" = o.id
WHERE o."inventoryHold" IS NULL
  AND ((o.status = 'pending' AND o."paymentStatus" = 'authorized')
    OR (o.status IN ('paid', 'processing') AND o."paymentStatus" = 'paid'));

SELECT COUNT(*) AS products_locked FROM (
  SELECT id FROM "CatalogProduct"
  WHERE id IN (SELECT product_id FROM legacy_lines)
  ORDER BY id
  FOR UPDATE
) locked_products;

CREATE TEMP TABLE product_before ON COMMIT DROP AS
SELECT id, name, status, inventory FROM "CatalogProduct"
WHERE id IN (SELECT product_id FROM legacy_lines);

-- One-of-one pieces (rugs, true one-offs) are tracked by status; the rest by count.
CREATE TEMP TABLE coverable_products ON COMMIT DROP AS
SELECT demand.product_id, (p.type = 'rug' OR p."uniquenessTier" IS NOT DISTINCT FROM 'True one-off') AS one_of_one
FROM (
  SELECT product_id, SUM(quantity) AS quantity, bool_or(variant_id IS NOT NULL) AS has_variant
  FROM legacy_lines
  GROUP BY product_id
) demand
JOIN "CatalogProduct" p ON p.id = demand.product_id
WHERE p.status = 'active'
  AND NOT demand.has_variant
  AND (
    ((p.type = 'rug' OR p."uniquenessTier" IS NOT DISTINCT FROM 'True one-off') AND demand.quantity = 1)
    OR (p.type <> 'rug' AND p."uniquenessTier" IS DISTINCT FROM 'True one-off'
        AND COALESCE(p.inventory, 0) >= demand.quantity)
  );

CREATE TEMP TABLE adoptable_orders ON COMMIT DROP AS
SELECT order_id, bool_and(captured) AS captured
FROM legacy_lines
GROUP BY order_id
HAVING bool_and(product_id IN (SELECT product_id FROM coverable_products));

UPDATE "CatalogProduct" p
SET status = CASE WHEN a.captured THEN 'sold' ELSE 'reserved' END,
    "heldByOrderId" = a.order_id,
    "soldAt" = CASE WHEN a.captured THEN COALESCE(p."soldAt", now()) ELSE p."soldAt" END
FROM legacy_lines l
JOIN adoptable_orders a ON a.order_id = l.order_id
JOIN coverable_products c ON c.product_id = l.product_id AND c.one_of_one
WHERE p.id = l.product_id
  AND p.status = 'active';

UPDATE "CatalogProduct" p
SET inventory = p.inventory - taken.quantity
FROM (
  SELECT l.product_id, SUM(l.quantity) AS quantity
  FROM legacy_lines l
  JOIN coverable_products c ON c.product_id = l.product_id AND NOT c.one_of_one
  WHERE l.order_id IN (SELECT order_id FROM adoptable_orders)
  GROUP BY l.product_id
) taken
WHERE p.id = taken.product_id
  AND p.status = 'active'
  AND p.inventory >= taken.quantity;

UPDATE "OrderRecord" o
SET "inventoryHold" = CASE WHEN o."paymentStatus" = 'paid' THEN 'sold'::"InventoryHold" ELSE 'held'::"InventoryHold" END
FROM adoptable_orders a
WHERE o.id = a.order_id
  AND o."inventoryHold" IS NULL
  AND ((o.status = 'pending' AND o."paymentStatus" = 'authorized')
    OR (o.status IN ('paid', 'processing') AND o."paymentStatus" = 'paid'));

SELECT 'adopted:' || l.order_number || ' as ' || CASE WHEN a.captured THEN 'sold' ELSE 'held' END AS adopted
FROM adoptable_orders a
JOIN (SELECT DISTINCT order_id, order_number FROM legacy_lines) l ON l.order_id = a.order_id
ORDER BY l.order_number;

SELECT 'changed:' || b.name || ' status ' || b.status || ' -> ' || p.status
       || ', inventory ' || COALESCE(b.inventory::text, '-') || ' -> ' || COALESCE(p.inventory::text, '-') AS changed
FROM product_before b
JOIN "CatalogProduct" p ON p.id = b.id
WHERE (b.status, b.inventory) IS DISTINCT FROM (p.status, p.inventory)
ORDER BY b.name;

-- Paid, unshipped orders whose piece was still on sale: the double-sale risk.
-- Adopted ones are now sold; any others also appear under settle-by-hand.
SELECT 'paid-unshipped:' || l.order_number || ' ' || b.name || ' was ' || b.status AS paid_unshipped
FROM legacy_lines l
JOIN product_before b ON b.id = l.product_id
WHERE l.captured AND b.status = 'active'
ORDER BY l.order_number;

SELECT 'settle-by-hand:' || o."orderNumber" AS settle_by_hand
FROM "OrderRecord" o
WHERE o.id IN (SELECT order_id FROM legacy_lines)
  AND o.id NOT IN (SELECT order_id FROM adoptable_orders)
ORDER BY o."placedAt";

\if :{?apply}
\else
\set apply false
\endif

\if :apply
COMMIT;
\else
ROLLBACK;
\echo 'Dry run: nothing was changed. Rerun with -v apply=1 to commit.'
\endif
