export interface GenreResponse {
  title: string;
  href: string;
  value: number;
  group_id: number;
}

export interface TagResponse extends GenreResponse {}
