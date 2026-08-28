export const ALL_YEARS_RANGE = ['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016', '2015', '2010', '2005', '2000', '1990'];

export const RATING_OPTIONS = [
  { value: 9, label: '9+' },
  { value: 8, label: '8+' },
  { value: 7, label: '7+' },
  { value: 6, label: '6+' },
  { value: 5, label: '5+' },
];

export const ROLE_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  'admin': 'destructive',
  'moderator': 'secondary',
  'redactor': 'default',
  'user': 'outline',
};
