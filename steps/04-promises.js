// Step 4 · The first untangling: Promises
//
// A Promise stands for a value that will arrive later. It is pending, then
// either fulfilled (handled by .then) or rejected (handled by .catch), and it
// settles only once. Wrap each callback function once (see
// src/shopkart-async.js) and the steps chain top to bottom.
//
// Run: npm run step:4            (try: npm run step:4 -- u-404)
import {
  loadUserAsync,
  loadOrdersAsync,
  loadInvoiceAsync,
  loadUserWithCacheAsync,
} from '../src/shopkart-async.js';
import { showError, banner } from '../src/render.js';
import { isMain } from '../src/is-main.js';

export function showInvoice(userId, onError = showError, log = console.log) {
  return loadUserAsync(userId)
    .then((user) => loadOrdersAsync(user.id))
    .then((orders) => loadInvoiceAsync(orders[0].id))
    .then((invoice) => {
      // Flat and readable, and one .catch covers every step.
      // But `user` and `orders` are stuck inside the earlier .then calls,
      // so we can't render the full profile here. Step 5 fixes that.
      log(invoice);
      return invoice;
    })
    .catch(onError);
}

if (isMain(import.meta.url)) {
  const userId = process.argv[2] ?? 'u-42';
  banner(`Step 4 · A Promise chain (user ${userId})`);
  await showInvoice(userId);

  banner('A Promise settles once (user u-42, the buggy cache from step 3)');
  const user = await loadUserWithCacheAsync('u-42');
  console.log(`  Got "${user.name}". The second callback was ignored.`);
}
