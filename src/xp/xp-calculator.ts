export interface XpEntry {
  /** Unique row id (combatant id, or generated for manual adds). */
  id: string;
  actorId: string;
  xp: number;
  /** Enemy stack size when grouped (default 1). */
  count?: number;
  /** Set for compendium (or other non-world) actors so rows can render without game.actors. */
  uuid?: string;
  name?: string;
  img?: string;
  subtitle?: string;
}

export function createEnemyEntry(
  actorId: string,
  xp: number,
  id?: string,
  extras: Pick<XpEntry, "uuid" | "name" | "img" | "subtitle"> = {}
): XpEntry {
  return {
    id: id ?? `enemy-${actorId}-${globalThis.crypto?.randomUUID?.() ?? Date.now()}`,
    actorId,
    xp,
    ...extras,
  };
}

export function createRecipientEntry(actorId: string, xp = 0): XpEntry {
  return { id: actorId, actorId, xp };
}

export function calcEnemyTotal(enemies: XpEntry[]): number {
  return enemies.reduce((sum, e) => {
    const count = Math.max(1, Math.floor(e.count ?? 1));
    return sum + count * Math.max(0, Math.floor(e.xp));
  }, 0);
}

export function calcTotalXp(
  enemies: XpEntry[],
  bonusXp: number,
  skillChallengeXp = 0
): number {
  return (
    calcEnemyTotal(enemies) +
    Math.max(0, Math.floor(bonusXp)) +
    Math.max(0, Math.floor(skillChallengeXp))
  );
}

export function calcPerMemberXp(totalXp: number, recipientCount: number): number {
  if (recipientCount <= 0) return 0;
  return Math.floor(totalXp / recipientCount);
}

export function redistributeRecipients(recipients: XpEntry[], perMember: number): XpEntry[] {
  const xp = Math.max(0, Math.floor(perMember));
  return recipients.map((r) => ({ ...r, xp }));
}

export function syncXpState(
  enemies: XpEntry[],
  recipients: XpEntry[],
  bonusXp: number,
  skillChallengeXp = 0
): { totalXp: number; perMemberXp: number; recipients: XpEntry[] } {
  const totalXp = calcTotalXp(enemies, bonusXp, skillChallengeXp);
  const perMemberXp = calcPerMemberXp(totalXp, recipients.length);
  return {
    totalXp,
    perMemberXp,
    recipients: redistributeRecipients(recipients, perMemberXp),
  };
}
