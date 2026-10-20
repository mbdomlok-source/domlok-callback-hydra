// Step 2 · Kai feeds the Hydra another head
//
// Kai adds recommendations "the same way": one more step means one more level
// of nesting. He also forgot one error check, so when the recommendation
// service fails, the error vanishes silently.
//
// Run: npm run step:2            (then try: npm run step:2 -- u-9)
import { loadUser, loadOrders, loadInvoice, loadRecommendations } from '../src/shopkart-api.js';
import { renderProfile, showError, banner } from '../src/render.js';
import { isMain } from '../src/is-main.js';

export function showProfile(userId, render = renderProfile, onError = showError) {
  loadUser(userId, function (err, user) {
    if (err) return onError(err);
    loadOrders(user.id, function (err, orders) {
      if (err) return onError(err);
      loadInvoice(orders[0].id, function (err, invoice) {
        if (err) return onError(err);
        loadRecommendations(user.id, function (err, recs) {
          // Missing: if (err) return onError(err);
          render(user, orders, invoice, recs);
        });
      });
    });
  });
}

if (isMain(import.meta.url)) {
  const userId = process.argv[2] ?? 'u-42';
  banner(`Step 2 · Four levels deep (user ${userId})`);
  showProfile(userId);
}
