import { pathToFileURL } from 'node:url';

// True when the file was run directly (`node steps/01-callbacks.js`),
// false when it was imported (by the tests).
export function isMain(moduleUrl) {
  return Boolean(process.argv[1]) && moduleUrl === pathToFileURL(process.argv[1]).href;
}
