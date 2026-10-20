/**
 * Shopkart: a pretend backend with old-style, callback-based functions.
 *
 * Every function follows the Node.js callback convention:
 *
 *   fn(...args, callback)   →   later: callback(err, data)
 *
 * Latencies are fixed so the timings in step 6 are easy to compare.
 */

export const LATENCY_MS = Object.freeze({
  user: 120,
  orders: 150,
  invoice: 100,
  recommendations: 140,
});

// Test users:
//   u-42   everything works
//   u-7    the invoice service fails (an error at the deepest level)
//   u-9    the recommendation service fails
//   u-404  no such user (an error at the first level)
const USERS = {
  'u-42': { id: 'u-42', name: 'Asha Rao' },
  'u-7': { id: 'u-7', name: 'Vikram Shah' },
  'u-9': { id: 'u-9', name: 'Meera Iyer' },
};

const ORDERS = {
  'u-42': [
    { id: 'o-1001', total: 2499 },
    { id: 'o-0998', total: 799 },
  ],
  'u-7': [{ id: 'o-0700', total: 1299 }],
  'u-9': [{ id: 'o-0901', total: 349 }],
};

const INVOICES = {
  'o-1001': { id: 'inv-1001', orderId: 'o-1001', amount: 2499, currency: 'INR' },
  'o-0901': { id: 'inv-0901', orderId: 'o-0901', amount: 349, currency: 'INR' },
};

const RECOMMENDATIONS = {
  'u-42': ['Mechanical keyboard', 'USB-C hub', 'Desk lamp'],
  'u-7': ['Noise-cancelling headphones'],
};

function later(ms, fn) {
  setTimeout(fn, ms);
}

export function loadUser(userId, callback) {
  later(LATENCY_MS.user, () => {
    const user = USERS[userId];
    if (!user) return callback(new Error(`No user with id "${userId}".`));
    callback(null, user);
  });
}

export function loadOrders(userId, callback) {
  later(LATENCY_MS.orders, () => {
    const orders = ORDERS[userId];
    if (!orders || orders.length === 0) {
      return callback(new Error(`No orders found for user "${userId}".`));
    }
    callback(null, orders);
  });
}

export function loadInvoice(orderId, callback) {
  later(LATENCY_MS.invoice, () => {
    const invoice = INVOICES[orderId];
    if (!invoice) return callback(new Error(`Invoice service is down for order "${orderId}".`));
    callback(null, invoice);
  });
}

export function loadRecommendations(userId, callback) {
  later(LATENCY_MS.recommendations, () => {
    const recs = RECOMMENDATIONS[userId];
    if (!recs) return callback(new Error(`Recommendation service timed out for user "${userId}".`));
    callback(null, recs);
  });
}

/**
 * BUGGY ON PURPOSE (used in steps 3 and 4).
 *
 * It answers from a cache first, then fetches a fresh copy. Its author forgot
 * a `return`, so for cached users the callback runs TWICE. Your code is
 * correct, but you handed control to this function and it broke the deal.
 */
const userCache = new Map([['u-42', { id: 'u-42', name: 'Asha Rao (cached)' }]]);

export function loadUserWithCache(userId, callback) {
  if (userCache.has(userId)) {
    later(0, () => callback(null, userCache.get(userId)));
    // missing: return;
  }
  loadUser(userId, callback);
}
