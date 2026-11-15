-- Reserves the pieces of orders placed before automatic reservation that are
-- still awaiting approval (pending + authorized, inventoryHold NULL), and marks
-- those orders held so later capture, cancel, and expiry settle them.
--
-- Run once, after the code that understands inventoryHold is live. Safe to rerun:
-- adopted orders are no longer NULL. Conservative: an order is adopted only when
-- every line can be covered for all open legacy orders at once, so two legacy
-- orders for one rug are both left alone. Variant lines are left alone. The
-- final SELECT lists the orders a person still has to settle by hand.

BEGIN;

CREATE TEMP TABLE legacy_lines ON COMMIT DROP AS
SELECT o.id AS order_id, li."productId" AS product_id, li.quantity, li.variant ->> 'id' AS variant_id
FROM "OrderRecord" o
JOIN "OrderLineItemRecord" li ON li."orderId" = o.id
WHERE o."inventoryHold" IS NULL
  AND o.status = 'pending'
  AND o."paymentStatus" = 'authorized';

-- Same row lock the checkout takes, so a live order cannot reserve these meanwhile.
SELECT id FROM "CatalogProduct"
WHERE id IN (SELECT product_id FROM legacy_lines)
ORDER BY id
FOR UPDATE;

CREATE TEMP TABLE coverable_products ON COMMIT DROP AS
SELECT demand.product_id
FROM (
  SELECT product_id, SUM(quantity) AS quantity, bool_or(variant_id IS NOT NULL) AS has_variant
  FROM legacy_lines
  GROUP BY product_id
) demand
JOIN "CatalogProduct" p ON p.id = demand.product_id
WHERE p.status = 'active'
  AND NOT demand.has_variant
  AND (
    (p.type = 'rug' AND demand.quantity = 1)
    OR (p.type <> 'rug' AND COALESCE(p.inventory, 0) >= demand.quantity)
  );

CREATE TEMP TABLE adoptable_orders ON COMMIT DROP AS
SELECT order_id
FROM legacy_lines
GROUP BY order_id
HAVING bool_and(product_id IN (SELECT product_id FROM coverable_products));

UPDATE "CatalogProduct" p
SET status = 'reserved'
WHERE p.type = 'rug'
  AND p.id IN (SELECT product_id FROM legacy_lines WHERE order_id IN (SELECT order_id FROM adoptable_orders));

UPDATE "CatalogProduct" p
SET inventory = p.inventory - taken.quantity
FROM (
  SELECT product_id, SUM(quantity) AS quantity
  FROM legacy_lines
  WHERE order_id IN (SELECT order_id FROM adoptable_orders)
  GROUP BY product_id
) taken
WHERE p.id = taken.product_id
  AND p.type <> 'rug';

UPDATE "OrderRecord"
SET "inventoryHold" = 'held'
WHERE id IN (SELECT order_id FROM adoptable_orders);

SELECT o."orderNumber" AS settle_by_hand, o."placedAt"
FROM "OrderRecord" o
WHERE o.id IN (SELECT order_id FROM legacy_lines)
  AND o.id NOT IN (SELECT order_id FROM adoptable_orders)
ORDER BY o."placedAt";

COMMIT;
