import { execFileSync } from "node:child_process";
import { chromium } from "playwright";
import { PrismaClient } from "@prisma/client";

const base = "http://localhost:3021";
const outDir = "/tmp/stripe-e2e";
const stripeBin = `${process.env.HOME}/.local/bin/stripe`;
const prisma = new PrismaClient();

function stripeCli(args) {
  return execFileSync(stripeBin, args, { encoding: "utf8" });
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForOrder(checkoutSessionIdHint, { tries = 20, delayMs = 1500 } = {}) {
  for (let i = 0; i < tries; i += 1) {
    const order = await prisma.orderRecord.findFirst({
      where: checkoutSessionIdHint ? { checkoutSessionId: checkoutSessionIdHint } : {},
      orderBy: { placedAt: "desc" },
    });
    if (order) return order;
    await sleep(delayMs);
  }
  return null;
}

async function waitForOrderState(orderId, predicate, { tries = 20, delayMs = 1500 } = {}) {
  for (let i = 0; i < tries; i += 1) {
    const order = await prisma.orderRecord.findUnique({ where: { id: orderId } });
    if (order && predicate(order)) return order;
    await sleep(delayMs);
  }
  return prisma.orderRecord.findUnique({ where: { id: orderId } });
}

async function dismissCookies(page) {
  const decline = await page.$("text=Decline");
  if (decline) await decline.click().catch(() => {});
  await page.waitForTimeout(200);
}

async function runCheckout(browser, { productPath, label }) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  await page.goto(`${base}${productPath}`, { waitUntil: "networkidle" });
  await dismissCookies(page);
  await page.getByRole("button", { name: /Reserve this piece/ }).first().click();
  await page.waitForURL("**/checkout", { timeout: 15000 });
  await page.screenshot({ path: `${outDir}/${label}-1-checkout-start.png` });

  await page.getByRole("link", { name: "Start checkout" }).click();
  await page.waitForURL("**/checkout/information", { timeout: 15000 });

  await page.getByLabel("Email address").fill("test-buyer@example.com");
  await page.getByLabel("Full name").fill("Test Buyer");
  await page.getByLabel("Address line 1").fill("123 Test Street");
  await page.getByLabel("City").fill("Los Angeles");
  await page.getByLabel("State").selectOption("California");
  await page.getByLabel("ZIP code").fill("90001");
  await page.waitForTimeout(800);

  for (let attempt = 0; attempt < 3; attempt += 1) {
    await page.getByRole("button", { name: "Continue to shipping" }).click();
    try {
      await page.waitForURL("**/checkout/shipping", { timeout: 5000 });
      break;
    } catch {
      await page.waitForTimeout(1000);
    }
  }
  await page.waitForURL("**/checkout/shipping", { timeout: 5000 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${outDir}/${label}-2-shipping.png` });

  for (let attempt = 0; attempt < 3; attempt += 1) {
    await page.getByRole("button", { name: "Continue to payment review" }).click();
    try {
      await page.waitForURL("**/checkout/payment", { timeout: 5000 });
      break;
    } catch {
      await page.waitForTimeout(1000);
    }
  }
  await page.waitForURL("**/checkout/payment", { timeout: 5000 });
  await page.waitForTimeout(500);

  await page.getByRole("button", { name: /Continue to secure payment/ }).click();
  await page.waitForURL("https://checkout.stripe.com/**", { timeout: 30000 });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${outDir}/${label}-3-stripe.png` });

  // Stripe hosted checkout: ensure the Card accordion is open, then fill.
  const cardField = page.locator("#cardNumber");
  if (!(await cardField.isVisible().catch(() => false))) {
    await page.dispatchEvent('[data-testid="card-accordion-item-button"]', "click");
    await page.waitForTimeout(2000);
  }
  await page.fill("#cardNumber", "4242424242424242");
  await page.fill("#cardExpiry", "12 / 30");
  await page.fill("#cardCvc", "123");
  await page.fill("#billingName", "Test Buyer");
  const zip = await page.$("#billingPostalCode");
  if (zip) await zip.fill("90001");
  await page.screenshot({ path: `${outDir}/${label}-4-stripe-filled.png` });
  await page.click(".SubmitButton");

  await page.waitForURL("**/checkout/success**", { timeout: 60000 });
  const successUrl = page.url();
  await page.screenshot({ path: `${outDir}/${label}-5-success.png` });
  await page.close();

  const sessionId = new URL(successUrl).searchParams.get("session_id");
  return { successUrl, sessionId };
}

const browser = await chromium.launch();

// ---- Order A: pillow $96 -> $50 shipping -> capture path ----
console.log("ORDER A: pillow, sub-$150, capture path");
const orderA = await runCheckout(browser, {
  productPath: "/shop/pillows/hearth-stripe-pillow",
  label: "a",
});
console.log("A success URL:", orderA.successUrl);

const recordA = await waitForOrder(orderA.sessionId);
if (!recordA) throw new Error("Order A was not persisted by the webhook");
console.log("A persisted:", {
  orderNumber: recordA.orderNumber,
  status: recordA.status,
  paymentStatus: recordA.paymentStatus,
  subtotal: String(recordA.subtotalUsd),
  shipping: String(recordA.shippingUsd),
  total: String(recordA.totalUsd),
  paymentIntentId: recordA.paymentIntentId,
});

const piA = stripeCli(["payment_intents", "retrieve", recordA.paymentIntentId]);
const piAParsed = JSON.parse(piA);
console.log("A payment intent:", {
  status: piAParsed.status,
  amount: piAParsed.amount,
  capture_method: piAParsed.capture_method,
});

console.log("A capturing...");
stripeCli(["payment_intents", "capture", recordA.paymentIntentId]);
const capturedA = await waitForOrderState(
  recordA.id,
  (order) => order.paymentStatus === "paid",
);
console.log("A after capture:", {
  status: capturedA.status,
  paymentStatus: capturedA.paymentStatus,
});

// ---- Order B: rug $1500 -> free shipping -> cancel path ----
console.log("\nORDER B: rug, over-$150, cancel path");
const orderB = await runCheckout(browser, {
  productPath: "/shop/rugs/beni-ourain/beni",
  label: "b",
});
console.log("B success URL:", orderB.successUrl);

const recordB = await waitForOrder(orderB.sessionId);
if (!recordB) throw new Error("Order B was not persisted by the webhook");
console.log("B persisted:", {
  orderNumber: recordB.orderNumber,
  status: recordB.status,
  paymentStatus: recordB.paymentStatus,
  subtotal: String(recordB.subtotalUsd),
  shipping: String(recordB.shippingUsd),
  total: String(recordB.totalUsd),
  paymentIntentId: recordB.paymentIntentId,
});

console.log("B canceling (releasing the hold)...");
stripeCli(["payment_intents", "cancel", recordB.paymentIntentId]);
const cancelledB = await waitForOrderState(
  recordB.id,
  (order) => order.status === "cancelled",
);
console.log("B after cancel:", {
  status: cancelledB.status,
  paymentStatus: cancelledB.paymentStatus,
});

await browser.close();
await prisma.$disconnect();
console.log("\nE2E COMPLETE");
