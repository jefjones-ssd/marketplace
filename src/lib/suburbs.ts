export const SUBURBS = [
  'Muizenberg',
  'Kalk Bay',
  'St James',
  'Fish Hoek',
  "Simon's Town",
  'Noordhoek',
  'Kommetjie',
  'Glencairn',
  'Lakeside',
  'Marina da Gama',
] as const;

export type Suburb = (typeof SUBURBS)[number];