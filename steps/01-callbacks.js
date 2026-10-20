// Step 1 · The tangled code
//
// Shopkart's profile page needs three things, in order: the user, then their
// orders, then the invoice for the latest order. With callbacks, each step
// waits INSIDE the one before, so the code drifts right: the pyramid of doom.
//
// Run: npm run step:1            (try: npm run step:1 -- u-7)
import { loadUser, loadOrders, loadInvoice } from '../src/shopkart-api.js';
import { renderProfile, showError, banner } from '../src/render.js';
import { isMain } from '../src/is-main.js';

export function showProfile(userId, render = renderProfile, onError = showError) {
  loadUser(userId, function (err, user) {
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
  const userId = process.argv[2] ?? 'u-42';
  banner(`Step 1 · Callbacks (user ${userId})`);
  showProfile(userId);
}
