import { test } from 'node:test';
import assert from 'node:assert/strict';
import { describeReplayResult } from '../src/app/replayMessage.js';

// R-03 (.crew/RED-TEAM.md ATTACK 13): app/App.jsx's replay() used to call
// setLiveMessage("Replayed. The print is unchanged.") unconditionally,
// without ever comparing the print before and after replay. This test
// exercises the extracted comparison in isolation.

test('test_replay_message_reports_unchanged_only_when_prints_actually_match', () => {
  assert.equal(
    describeReplayResult('2eb58635', '2eb58635'),
    'Replayed. The print is unchanged.'
  );
});

test('test_replay_message_does_not_hardcode_unchanged_when_prints_differ', () => {
  // This is the bug: a hardcoded "unchanged" string would pass this input
  // through unexamined. The fix must produce a different message and must
  // not claim "unchanged" when the prints disagree.
  const message = describeReplayResult('2eb58635', 'c47fa515');
  assert.notEqual(message, 'Replayed. The print is unchanged.');
  assert.match(message, /2eb58635/);
  assert.match(message, /c47fa515/);
});

test('test_replay_message_is_a_pure_function_of_its_two_prints', () => {
  // Same inputs, called twice, independently — no hidden state, no clock.
  const a = describeReplayResult('11111111', '22222222');
  const b = describeReplayResult('11111111', '22222222');
  assert.equal(a, b);
});
