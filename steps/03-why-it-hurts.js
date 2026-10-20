// Step 3 · Why it hurts
//
// Two bugs that are easy to write with callbacks and hard to spot. Both come
// from one missing `return`.
//
// Run: npm run step:3
import { loadUser, loadUserWithCache, loadOrders, loadInvoice } from '../src/shopkart-api.js';
import { renderProfile, showError, banner } from '../src/render.js';
import { isMain } from '../src/is-main.js';

// Bug 1: a forgotten `return` in YOUR code.
// The error is reported, then the code carries on with `user` undefined.
export function showProfileMissingReturn(userId, render = renderProfile, onError = showError) {
  loadUser(userId, function (err, user) {
    if (err) onError(err); // ← missing `return`
    loadOrders(user.id, function (err, orders) {
      if (err) return onError(err);
      loadInvoice(orders[0].id, function (err, invoice) {
        if (err) return onError(err);
        render(user, orders, invoice);
      });
    });
  });
}

// Bug 2: you hand over control.
// This pyramid is correct, but loadUserWithCache forgot a `return` inside the
// library. It calls us back twice, so the profile renders twice.
export function showProfileWithCache(userId, render = renderProfile, onError = showError) {
  loadUserWithCache(userId, function (err, user) {
    if (err) return onError(err);
    loadOrders(user.id, function (err, orders) {
      if (err) return onError(err);
      loadInvoice(orders[0].id, function (err, invoice) {
        if (err) return onError(err);
        render(user, orders, invoice);
      });
    });
  });
}

if (isMain(import.meta.url)) {
  banner('Bug 1 · A forgotten return in your code (user u-404)');

  process.once('uncaughtException', (crash) => {
    console.error(`  ...and then it kept going and crashed: ${crash.name}: ${crash.message}`);

    banner('Bug 2 · A callback that fires twice (user u-42)');
    showProfileWithCache('u-42');
  });

  showProfileMissingReturn('u-404');
}
