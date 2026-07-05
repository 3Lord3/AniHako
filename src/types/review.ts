import type { AnimeCatalogItem } from './anime';

export interface ReviewAuthor {
  id: number;
  nickname: string;
  avatars: {
    big?: string;
    full?: string;
    small?: string;
  };
}

export interface ReviewLikes {
  likes: number;
  dislikes: number;
  vote: 1 | 0 | -1;
}

export interface ReviewResponse {
  anime_id: number;
  type: 'approved' | 'waiting' | 'declined';
  review_id: number;
  avatar?: {
    big?: string;
    full?: string;
    small?: string;
  };
  user_roles?: string[];
  user_id?: number;
  total_likes?: number;
  nickname?: string;
  views?: number;
  update_date?: number;
  rating?: {
    average?: number;
    category?: Record<string, number>;
  };
  published_by?: number;
  commentable?: boolean;
  create_date?: number;
  check_comment?: string;
  likes?: ReviewLikes;
  author: ReviewAuthor;
  anime?: AnimeCatalogItem;
  comments_count?: number;
  text_preview?: string;
  text_html?: string;
}

export interface YummyAnimeReview {
  anime_id: number;
  type: 'approved' | 'waiting' | 'declined';
  review_id: number;
  avatar?: {
    big: string;
    full: string;
    small: string;
  };
  user_roles?: string[];
  user_id?: number;
  total_likes?: number;
  nickname?: string;
  views: number;
  update_date: number;
  rating: {
    average: number;
    category: Record<string, number>;
  };
  published_by?: number;
  commentable: boolean;
  create_date: number;
  check_comment?: string;
  likes: {
    likes: number;
    dislikes: number;
    vote: number;
  };
  author: {
    id: number;
    nickname: string;
    avatars: {
      big: string;
      full: string;
      small: string;
    };
  };
  anime: AnimeCatalogItem;
  comments_count?: number;
  text_preview?: string;
}

export interface YummyAnimeReviewsResponse {
  reviews: YummyAnimeReview[];
  can_add: boolean;
}
