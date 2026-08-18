import { describe, it, expect } from 'vitest';
import { isPlayerEndedEvent } from '@/lib/episodes';

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
