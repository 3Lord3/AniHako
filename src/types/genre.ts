export interface GenreResponse {
  title: string;
  href: string;
  value: number;
  group_id: number;
}

export type TagResponse = GenreResponse;
