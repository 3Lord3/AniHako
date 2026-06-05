import { describe, it, expect } from 'vitest';
import type { YummyUser } from '@/types/user';

describe('types/user', () => {
  describe('User interface', () => {
    it('accepts valid user object', () => {
      const user: YummyUser = {
        id: 1,
        nickname: 'testuser',
        email: 'test@example.com',
      };
      expect(user.id).toBe(1);
      expect(user.nickname).toBe('testuser');
    });

    it('accepts user with optional fields', () => {
      const user: YummyUser = {
        id: 1,
        nickname: 'testuser',
        email: 'test@example.com',
        about: 'About text',
        banned: false,
        sex: 1,
        roles: ['user', 'moderator'],
      };
      expect(user.sex).toBe(1);
      expect(user.roles).toContain('moderator');
    });

    it('accepts user with linked accounts', () => {
      const user: YummyUser = {
        id: 1,
        nickname: 'testuser',
        ids: {
          shikimori: { id: 123, nickname: 'shiki_user' },
          vk: 456789,
          tg_nickname: 'telegram_user',
        },
      };
      expect(user.ids?.shikimori?.id).toBe(123);
    });

    it('accepts user with avatars', () => {
      const user: YummyUser = {
        id: 1,
        nickname: 'testuser',
        avatars: {
          big: '/avatars/big.jpg',
          full: '/avatars/full.jpg',
          small: '/avatars/small.jpg',
        },
      };
      expect(user.avatars?.big).toBe('/avatars/big.jpg');
    });
  });

  describe('AuthTokens interface', () => {
    it('accepts tokens with refresh_token', () => {
      const tokens = {
        access_token: 'access123',
        refresh_token: 'refresh456',
      };
      expect(tokens.access_token).toBe('access123');
      expect(tokens.refresh_token).toBe('refresh456');
    });

    it('accepts tokens without refresh_token', () => {
      const tokens = {
        access_token: 'access123',
      };
      expect(tokens.access_token).toBe('access123');
    });
  });
});