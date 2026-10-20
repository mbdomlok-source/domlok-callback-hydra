import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { readdirSync } from 'node:fs';

import * as step1 from '../steps/01-callbacks.js';
import * as step2 from '../steps/02-another-head.js';
import * as step3 from '../steps/03-why-it-hurts.js';
import * as step4 from '../steps/04-promises.js';
import * as step5 from '../steps/05-async-await.js';
import * as step6 from '../steps/06-promise-all.js';
import { loadUserWithCacheAsync } from '../src/shopkart-async.js';

// Records every render and every error within `waitMs`, so a test can catch
// callbacks that fire twice, or never.
function collect(showProfile, userId, waitMs = 700) {
  const renders = [];
  const errors = [];
  showProfile(
    userId,
    (...args) => renders.push(args),
    (err) => errors.push(err),
  );
  return new Promise((resolve) => setTimeout(() => resolve({ renders, errors }), waitMs));
}

const noop = () => {};

test('callbacks: renders the profile once', async () => {
  const { renders, errors } = await collect(step1.showProfile, 'u-42');
  assert.equal(errors.length, 0);
  assert.equal(renders.length, 1);
  const [user, orders, invoice] = renders[0];
  assert.equal(user.name, 'Asha Rao');
  assert.equal(orders[0].id, 'o-1001');
  assert.equal(invoice.id, 'inv-1001');
});

test('callbacks: an error deep in the pyramid is reported once', async () => {
  const { renders, errors } = await collect(step1.showProfile, 'u-7');
  assert.equal(renders.length, 0);
  assert.equal(errors.length, 1);
  assert.match(errors[0].message, /Invoice service is down/);
});

test("Kai's extra head swallows the recommendations error", async () => {
  const { renders, errors } = await collect(step2.showProfile, 'u-9');
  assert.equal(errors.length, 0, 'the error vanished silently');
  assert.equal(renders.length, 1);
  assert.equal(renders[0][3], undefined, 'rendered with no recommendations');
});

test('a callback that fires twice renders the page twice', async () => {
  const { renders, errors } = await collect(step3.showProfileWithCache, 'u-42');
  assert.equal(errors.length, 0);
  assert.equal(renders.length, 2);
  assert.deepEqual(
    renders.map(([user]) => user.name),
    ['Asha Rao (cached)', 'Asha Rao'],
  );
});

test('a Promise settles once, even when the callback fires twice', async () => {
  const user = await loadUserWithCacheAsync('u-42');
  assert.equal(user.name, 'Asha Rao (cached)');
});

test('promises: the chain resolves to the invoice', async () => {
  const invoice = await step4.showInvoice('u-42', assert.fail, noop);
  assert.equal(invoice.id, 'inv-1001');
});

test('promises: one .catch handles a failure at any step', async () => {
  for (const [userId, message] of [['u-404', /No user/], ['u-7', /Invoice service/]]) {
    let caught;
    await step4.showInvoice(userId, (err) => (caught = err), noop);
    assert.match(caught.message, message);
  }
});

test('async/await: same result as the callback version', async () => {
  const callbacks = await collect(step1.showProfile, 'u-42');
  const awaited = await collect(step5.showProfile, 'u-42');
  assert.equal(awaited.renders.length, 1);
  assert.deepEqual(awaited.renders, callbacks.renders);
});

test('async/await: one try/catch guards every step', async () => {
  for (const [userId, message] of [['u-404', /No user/], ['u-7', /Invoice service/]]) {
    const { renders, errors } = await collect(step5.showProfile, userId);
    assert.equal(renders.length, 0);
    assert.equal(errors.length, 1);
    assert.match(errors[0].message, message);
  }
});

test('Promise.all: same profile, less waiting', async () => {
  let start = performance.now();
  const oneByOne = await step6.loadProfileOneByOne('u-42');
  const slow = performance.now() - start;

  start = performance.now();
  const together = await step6.loadProfileTogether('u-42');
  const fast = performance.now() - start;

  assert.deepEqual(together, oneByOne);
  assert.ok(fast < slow - 80, `expected Promise.all to save time (${Math.round(slow)} ms vs ${Math.round(fast)} ms)`);
});

test('Promise.all: rejects if any step fails', async () => {
  await assert.rejects(step6.loadProfileTogether('u-9'), /Recommendation service timed out/);
});

test('every step runs from the command line', () => {
  const stepsDir = fileURLToPath(new URL('../steps/', import.meta.url));
  const files = readdirSync(stepsDir).filter((f) => f.endsWith('.js')).sort();
  assert.equal(files.length, 6);
  for (const file of files) {
    const output = execFileSync(process.execPath, [stepsDir + file], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    assert.match(output, /Step|Bug/, `${file} printed its banner`);
  }
});
