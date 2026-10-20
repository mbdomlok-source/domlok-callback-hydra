/**
 * The lesson of step 4: wrap each callback function ONCE.
 * After that, the rest of your code works with Promises.
 */
import { promisify } from 'node:util';
import {
  loadUser,
  loadOrders,
  loadInvoice,
  loadRecommendations,
  loadUserWithCache,
} from './shopkart-api.js';

// Written by hand, so you can see exactly what a wrapper does.
export function loadUserAsync(userId) {
  return new Promise((resolve, reject) => {
    loadUser(userId, (err, user) => {
      if (err) reject(err);
      else resolve(user);
    });
  });
}

// Node.js ships the same wrapper as util.promisify. It works for any function
// whose last argument is an (err, data) callback. In the browser you write the
// wrapper yourself, as above, or use an API that already returns a Promise,
// like fetch().
export const loadOrdersAsync = promisify(loadOrders);
export const loadInvoiceAsync = promisify(loadInvoice);
export const loadRecommendationsAsync = promisify(loadRecommendations);

// Wrapping the buggy cache function. A Promise settles only once, so the
// second callback is ignored and nothing renders twice.
export const loadUserWithCacheAsync = promisify(loadUserWithCache);
