export * from './anime';
export * from './user';
export * from './list';
export * from './review';
export * from './genre';
export * from './common';

export function normalizeAnimeCatalogItem(item: any): any {
  return {
    ...item,
    title: item.title,
    year: item.year,
  };
}
