import { describe, it, expect } from 'vitest';
import { isPlayerEndedEvent, getPlayerProgressSeconds } from '@/lib/episodes';

describe('isPlayerEndedEvent', () => {
  it('matches an "event" field containing ended/finish/complete', () => {
    expect(isPlayerEndedEvent({ event: 'kdEnded' })).toBe(true);
    expect(isPlayerEndedEvent({ event: 'finish' })).toBe(true);
    expect(isPlayerEndedEvent({ event: 'video_complete' })).toBe(true);
  });

  it('matches a "type" field containing ended/finish/complete', () => {
    expect(isPlayerEndedEvent({ type: 'player_end' })).toBe(false);
    expect(isPlayerEndedEvent({ type: 'ended' })).toBe(true);
  });

  it('rejects non-matching or missing payloads', () => {
    expect(isPlayerEndedEvent({ event: 'kdPlay' })).toBe(false);
    expect(isPlayerEndedEvent(null)).toBe(false);
    expect(isPlayerEndedEvent(undefined)).toBe(false);
    expect(isPlayerEndedEvent('ended')).toBe(false);
    expect(isPlayerEndedEvent({})).toBe(false);
  });
});

describe('getPlayerProgressSeconds', () => {
  it('reads currentTime as the position in seconds', () => {
    expect(getPlayerProgressSeconds({ currentTime: 120 })).toBe(120);
    expect(getPlayerProgressSeconds({ currentTime: '540' })).toBe(540);
  });

  it('falls back to the position field', () => {
    expect(getPlayerProgressSeconds({ position: 90.5 })).toBe(90.5);
  });

  it('returns null when no position is reported', () => {
    expect(getPlayerProgressSeconds({ event: 'kdPlay' })).toBe(null);
    expect(getPlayerProgressSeconds({ event: 'kdPause' })).toBe(null);
    expect(getPlayerProgressSeconds({ event: 'kdEnded', duration: 3600 })).toBe(null);
    expect(getPlayerProgressSeconds(null)).toBe(null);
    expect(getPlayerProgressSeconds({ currentTime: 'abc' })).toBe(null);
  });
});
