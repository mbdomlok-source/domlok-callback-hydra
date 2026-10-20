# The Callback Hydra

Companion code for **Domlok: The Callback Hydra**. Cut one head and two more grow back.

Shopkart's profile page needs three things in order: the user, their orders, then the invoice for the latest order. This repo starts with that written as nested callbacks (the "pyramid of doom") and untangles it, one runnable step at a time, into Promises, `async`/`await` and `Promise.all`.

Video: _link coming soon_

## Quick start

No dependencies to install. You need Node.js 20 or newer.

```bash
git clone https://github.com/<your-username>/domlok-callback-hydra.git
cd domlok-callback-hydra
npm run step:1
```

## The steps

| Step | Command | What it shows |
| --- | --- | --- |
| 1 | `npm run step:1` | The tangled code: three callbacks, each nested inside the last |
| 2 | `npm run step:2` | Kai adds recommendations: a fourth level, and a forgotten error check |
| 3 | `npm run step:3` | Why it hurts: one missing `return` crashes your code, another renders the page twice |
| 4 | `npm run step:4` | Promises: wrap each function once, then chain `.then` with one `.catch` |
| 5 | `npm run step:5` | `async`/`await`: the same steps, reading top to bottom, with one `try`/`catch` |
| 6 | `npm run step:6` | `Promise.all`: run independent steps together and compare the timings |

Each file in [`steps/`](steps) is short and commented. Read it alongside its output.

## Break things on purpose

Pass a user ID after `--` to see how each version handles failure:

| User | What happens |
| --- | --- |
| `u-42` | Everything works (the default) |
| `u-404` | No such user: fails at the first step |
| `u-7` | The invoice service is down: fails at the deepest step |
| `u-9` | The recommendation service times out |

```bash
npm run step:1 -- u-7    # callbacks: the error surfaces from three levels deep
npm run step:2 -- u-9    # Kai's version: the error disappears without a trace
npm run step:5 -- u-7    # async/await: one catch handles it
npm run step:6 -- u-9    # Promise.all rejects if any step fails
```

## How it fits together

```
src/
  shopkart-api.js     A pretend backend with old-style (err, data) callback functions
  shopkart-async.js   Each function wrapped once to return a Promise (step 4's lesson)
  render.js           Prints the profile and errors
steps/                One runnable file per step
test/                 Tests for every step: node --test
```

The fake API uses fixed delays (user 120 ms, orders 150 ms, recommendations 140 ms, invoice 100 ms), so step 6's timings come out about the same on every run: around 510 ms one after another, and around 370 ms with `Promise.all`.

## Acharya's Rule #1

> **Await, don't nest.** Flatten the flow: one path forward, one place for errors.

Use `await` in sequence when a step needs the one before it. Use `Promise.all` when steps are independent.

## Going further

- `Promise.all` rejects as soon as any step fails. If the profile should still render when recommendations fail, look at `Promise.allSettled`.
- In the browser, `fetch()` already returns a Promise, so you can `await` it directly with no wrapper.

## Tests

```bash
npm test
```

The tests check that every version renders the same profile, that errors from any level land in one place, that the buggy cache really does render twice with callbacks (and only once with a Promise), and that `Promise.all` is faster.

## License

[MIT](LICENSE) © Dhawal Mhatre · [madebydhawal.com](https://madebydhawal.com)
