export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    last: number;
    page: number;
    items: number;
  };
}
