// The import guard. This is the test that turns "the core is pure" from a
// claim into something that fails the build if it stops being true. It
// reads every .js file under src/core/ from disk — no bundler, no
// transpilation — and checks two things: that none of them reaches outside
// the core for a model, a framework, or the DOM, and (the anti-vacuous
// half) that the guard actually looked at all seven modules it's supposed
// to be watching. Without the second check, this test would pass trivially
// if src/core/ were ever renamed or emptied.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CORE_DIR = path.join(__dirname, '..', 'src', 'core');

const EXPECTED_MODULES = [
  'dihedral.js',
  'rng.js',
  'hash.js',
  'eightfold.js',
  'grains.js',
  'sim.js',
  'index.js',
];

const FORBIDDEN_IMPORT = /from\s+['"](three|react|react-dom|@react-three\/[^'"]+|node:[^'"]+)['"]/;
const FORBIDDEN_REFERENCES = [
  'window.',
  'document.',
  'fetch(',
  'Math.random',
  'Date.now',
  'performance.',
];

function coreFiles() {
  return readdirSync(CORE_DIR).filter((f) => f.endsWith('.js'));
}

test('test_core_imports_no_three_no_react_no_dom', () => {
  const files = coreFiles();
  assert.ok(files.length > 0, 'no files found under src/core/ — guard cannot run vacuously');

  for (const file of files) {
    const full = path.join(CORE_DIR, file);
    const contents = readFileSync(full, 'utf8');

    assert.ok(
      !FORBIDDEN_IMPORT.test(contents),
      `${file} imports from a forbidden module (three, react, react-dom, @react-three/*, or a node: builtin)`
    );

    for (const needle of FORBIDDEN_REFERENCES) {
      assert.ok(
        !contents.includes(needle),
        `${file} references forbidden "${needle}" — the core must not touch a clock, a random global, or the DOM`
      );
    }
  }
});

test('test_guard_sees_all_seven_core_modules', () => {
  const files = coreFiles().sort();
  const expected = [...EXPECTED_MODULES].sort();
  assert.deepEqual(
    files,
    expected,
    'src/core/ does not contain exactly the seven expected modules — the guard above could be passing vacuously'
  );
});
