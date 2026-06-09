export interface XpTableRow {
  level: number;
  monster: number;
  minion: number;
  elite: number;
  solo: number;
}

/** Standard D&D 4e encounter XP by level (Monster / Minion / Elite / Solo). */
export const XP_TABLE: readonly XpTableRow[] = [
  { level: 1, monster: 100, minion: 25, elite: 200, solo: 500 },
  { level: 2, monster: 125, minion: 31, elite: 250, solo: 625 },
  { level: 3, monster: 150, minion: 38, elite: 300, solo: 750 },
  { level: 4, monster: 175, minion: 44, elite: 350, solo: 875 },
  { level: 5, monster: 200, minion: 50, elite: 400, solo: 1000 },
  { level: 6, monster: 250, minion: 63, elite: 500, solo: 1250 },
  { level: 7, monster: 300, minion: 75, elite: 600, solo: 1500 },
  { level: 8, monster: 350, minion: 88, elite: 700, solo: 1750 },
  { level: 9, monster: 400, minion: 100, elite: 800, solo: 2000 },
  { level: 10, monster: 500, minion: 125, elite: 1000, solo: 2500 },
  { level: 11, monster: 600, minion: 150, elite: 1200, solo: 3000 },
  { level: 12, monster: 700, minion: 175, elite: 1400, solo: 3500 },
  { level: 13, monster: 800, minion: 200, elite: 1600, solo: 4000 },
  { level: 14, monster: 1000, minion: 250, elite: 2000, solo: 5000 },
  { level: 15, monster: 1200, minion: 300, elite: 2400, solo: 6000 },
  { level: 16, monster: 1400, minion: 350, elite: 2800, solo: 7000 },
  { level: 17, monster: 1600, minion: 400, elite: 3200, solo: 8000 },
  { level: 18, monster: 2000, minion: 500, elite: 4000, solo: 10000 },
  { level: 19, monster: 2400, minion: 600, elite: 4800, solo: 12000 },
  { level: 20, monster: 2800, minion: 700, elite: 5600, solo: 14000 },
  { level: 21, monster: 3200, minion: 800, elite: 6400, solo: 16000 },
  { level: 22, monster: 4150, minion: 1038, elite: 8300, solo: 20750 },
  { level: 23, monster: 5100, minion: 1275, elite: 10200, solo: 25500 },
  { level: 24, monster: 6050, minion: 1513, elite: 12100, solo: 30250 },
  { level: 25, monster: 7000, minion: 1750, elite: 14000, solo: 35000 },
  { level: 26, monster: 9000, minion: 2250, elite: 18000, solo: 45000 },
  { level: 27, monster: 11000, minion: 2750, elite: 22000, solo: 55000 },
  { level: 28, monster: 13000, minion: 3250, elite: 26000, solo: 65000 },
  { level: 29, monster: 15000, minion: 3750, elite: 30000, solo: 75000 },
  { level: 30, monster: 19000, minion: 4750, elite: 38000, solo: 95000 },
  { level: 31, monster: 23000, minion: 5750, elite: 46000, solo: 115000 },
  { level: 32, monster: 27000, minion: 6750, elite: 54000, solo: 135000 },
  { level: 33, monster: 31000, minion: 7750, elite: 62000, solo: 155000 },
  { level: 34, monster: 39000, minion: 9750, elite: 78000, solo: 195000 },
  { level: 35, monster: 47000, minion: 11750, elite: 94000, solo: 235000 },
  { level: 36, monster: 55000, minion: 13750, elite: 110000, solo: 275000 },
  { level: 37, monster: 63000, minion: 15750, elite: 126000, solo: 315000 },
  { level: 38, monster: 79000, minion: 19750, elite: 158000, solo: 395000 },
  { level: 39, monster: 95000, minion: 23750, elite: 190000, solo: 475000 },
  { level: 40, monster: 111000, minion: 27750, elite: 222000, solo: 555000 },
] as const;

const XP_BY_LEVEL = new Map(XP_TABLE.map((row) => [row.level, row]));

export function getXpTableRow(level: number): XpTableRow | undefined {
  return XP_BY_LEVEL.get(Math.floor(level));
}

export function getMonsterXpForLevel(level: number): number {
  return getXpTableRow(level)?.monster ?? 0;
}
