import { resolveEnemyPresentation } from "./actor-presentation.js";
import type { XpEntry } from "./xp-calculator.js";

export function enemyCount(entry: XpEntry): number {
  return Math.max(1, Math.floor(entry.count ?? 1));
}

export function resolveEnemyName(entry: XpEntry): string {
  if (entry.name?.trim()) return entry.name.trim();
  const actor = game.actors?.get(entry.actorId);
  if (actor?.name?.trim()) return actor.name.trim();
  const presentation = resolveEnemyPresentation(entry);
  return presentation?.name?.trim() ?? entry.actorId;
}

export function getEnemyGroupKey(entry: XpEntry): string {
  const name = resolveEnemyName(entry).toLowerCase();
  const xp = Math.max(0, Math.floor(entry.xp));
  return `${name}|${xp}`;
}

export function withEnemyCount(entry: XpEntry, count: number): XpEntry {
  return { ...entry, count: Math.max(1, Math.floor(count)) };
}

export function groupEnemyEntries(entries: XpEntry[]): XpEntry[] {
  const groups = new Map<string, XpEntry>();

  for (const entry of entries) {
    const key = getEnemyGroupKey(entry);
    const existing = groups.get(key);
    if (!existing) {
      groups.set(key, withEnemyCount(entry, enemyCount(entry)));
      continue;
    }

    groups.set(
      key,
      withEnemyCount(
        {
          ...existing,
          img: existing.img ?? entry.img,
          subtitle: existing.subtitle ?? entry.subtitle,
        },
        enemyCount(existing) + enemyCount(entry)
      )
    );
  }

  return [...groups.values()];
}

export function mergeEnemyEntry(entries: XpEntry[], incoming: XpEntry): XpEntry[] {
  return groupEnemyEntries([...entries, withEnemyCount(incoming, 1)]);
}

export function updateEnemyEntry(
  entries: XpEntry[],
  entryId: string,
  patch: Partial<Pick<XpEntry, "count" | "xp">>
): XpEntry[] {
  const next = entries.map((entry) => {
    if (entry.id !== entryId) return entry;
    const updated: XpEntry = { ...entry };
    if (patch.count != null) {
      updated.count = Math.max(1, Math.floor(patch.count));
    }
    if (patch.xp != null) {
      updated.xp = Math.max(0, Math.floor(patch.xp));
    }
    return updated;
  });
  return groupEnemyEntries(next);
}
