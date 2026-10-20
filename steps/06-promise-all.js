// Step 6 · Run them together: Promise.all
//
// Recommendations only need `user.id`, so there's no reason to wait for the
// orders first. Use `await` in sequence when a step needs the one before it,
// and Promise.all when steps are independent. If any one fails, Promise.all
// rejects and lands in your catch.
//
// Run: npm run step:6            (try: npm run step:6 -- u-9)
import {
  loadUserAsync,
  loadOrdersAsync,
  loadInvoiceAsync,
  loadRecommendationsAsync,
} from '../src/shopkart-async.js';
import { renderProfile, showError, banner } from '../src/render.js';
import { isMain } from '../src/is-main.js';

export async function loadProfileOneByOne(userId) {
  const user = await loadUserAsync(userId);
  const orders = await loadOrdersAsync(user.id);
  const recs = await loadRecommendationsAsync(user.id);
  const invoice = await loadInvoiceAsync(orders[0].id);
  return { user, orders, invoice, recs };
}

export async function loadProfileTogether(userId) {
  const user = await loadUserAsync(userId);
  const [orders, recs] = await Promise.all([
    loadOrdersAsync(user.id),
    loadRecommendationsAsync(user.id),
  ]);
  const invoice = await loadInvoiceAsync(orders[0].id);
  return { user, orders, invoice, recs };
}

async function timed(load, userId) {
  const start = performance.now();
  const profile = await load(userId);
  return [profile, Math.round(performance.now() - start)];
}

if (isMain(import.meta.url)) {
  const userId = process.argv[2] ?? 'u-42';
  banner(`Step 6 · Promise.all (user ${userId})`);
  try {
    const [profile, slow] = await timed(loadProfileOneByOne, userId);
    const [, fast] = await timed(loadProfileTogether, userId);
    renderProfile(profile.user, profile.orders, profile.invoice, profile.recs);
    console.log(`\n  One after another: ${slow} ms`);
    console.log(`  With Promise.all:  ${fast} ms (${slow - fast} ms faster)`);
  } catch (err) {
    showError(err);
  }
}
