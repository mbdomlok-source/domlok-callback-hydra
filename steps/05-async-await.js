// Step 5 · The final form: async/await
//
// The same steps as step 1, now reading top to bottom. `await` pauses this
// function until the Promise settles; the rest of the program keeps running.
// Every variable stays in scope, and one try/catch guards every step.
//
// Note: `await` only works inside an `async` function, or at the top level of
// an ES module.
//
// Run: npm run step:5            (try: npm run step:5 -- u-7)
import { loadUserAsync, loadOrdersAsync, loadInvoiceAsync } from '../src/shopkart-async.js';
import { renderProfile, showError, banner } from '../src/render.js';
import { isMain } from '../src/is-main.js';

export async function showProfile(userId, render = renderProfile, onError = showError) {
  try {
    const user = await loadUserAsync(userId);
    const orders = await loadOrdersAsync(user.id);
    const invoice = await loadInvoiceAsync(orders[0].id);
    render(user, orders, invoice);
  } catch (err) {
    onError(err);
  }
}

if (isMain(import.meta.url)) {
  const userId = process.argv[2] ?? 'u-42';
  banner(`Step 5 · async/await (user ${userId})`);
  await showProfile(userId);
}
