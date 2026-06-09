import type { Actor } from "../foundry-globals.js";
import type { XpEntry } from "./xp-calculator.js";

export function readActorXp(actor: Actor): number {
  const details = actor.system?.details as { exp?: number } | undefined;
  return Math.max(0, Math.floor(Number(details?.exp ?? 0)));
}

export function readMonsterXpValue(actor: Actor): number {
  return readActorXp(actor);
}

export function resolvePolymorphedActor(actor: Actor): Actor {
  if (!actor.isPolymorphed) return actor;
  const originalId = actor.getFlag(game.system?.id ?? "dnd4e", "originalActor");
  if (typeof originalId === "string") {
    const original = game.actors.get(originalId);
    if (original) return original;
  }
  return actor;
}

export async function applyXpRewards(recipients: XpEntry[]): Promise<number> {
  if (!game.user?.isGM) return 0;

  let applied = 0;
  for (const entry of recipients) {
    if (entry.xp <= 0) continue;
    const actor = game.actors.get(entry.actorId);
    if (!actor) continue;
    const current = readActorXp(actor);
    await actor.update({ "system.details.exp": current + Math.floor(entry.xp) });
    applied += 1;
  }
  return applied;
}

export async function revertXpRewards(
  recipients: Array<{ actorId: string; xp: number }>
): Promise<number> {
  if (!game.user?.isGM) return 0;

  let reverted = 0;
  for (const entry of recipients) {
    if (entry.xp <= 0) continue;
    const actor = game.actors.get(entry.actorId);
    if (!actor) continue;
    const current = readActorXp(actor);
    const next = Math.max(0, current - Math.floor(entry.xp));
    await actor.update({ "system.details.exp": next });
    reverted += 1;
  }
  return reverted;
}
