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

export interface ActorXpUpdate {
  _id: string;
  "system.details.exp": number;
}

export function buildXpApplyUpdates(recipients: Array<{ actorId: string; xp: number }>): ActorXpUpdate[] {
  const updates: ActorXpUpdate[] = [];

  for (const entry of recipients) {
    if (entry.xp <= 0) continue;
    const actor = game.actors.get(entry.actorId);
    if (!actor) continue;
    const current = readActorXp(actor);
    updates.push({
      _id: actor.id,
      "system.details.exp": current + Math.floor(entry.xp),
    });
  }

  return updates;
}

export function buildXpRevertUpdates(
  recipients: Array<{ actorId: string; xp: number }>
): ActorXpUpdate[] {
  const updates: ActorXpUpdate[] = [];

  for (const entry of recipients) {
    if (entry.xp <= 0) continue;
    const actor = game.actors.get(entry.actorId);
    if (!actor) continue;
    const current = readActorXp(actor);
    updates.push({
      _id: actor.id,
      "system.details.exp": Math.max(0, current - Math.floor(entry.xp)),
    });
  }

  return updates;
}

export async function commitActorXpUpdates(updates: ActorXpUpdate[]): Promise<number> {
  if (updates.length === 0) return 0;
  await Actor.updateDocuments(updates, { render: false });
  return updates.length;
}

export async function applyXpRewards(recipients: XpEntry[]): Promise<number> {
  if (!game.user?.isGM) return 0;
  return commitActorXpUpdates(buildXpApplyUpdates(recipients));
}

export async function revertXpRewards(
  recipients: Array<{ actorId: string; xp: number }>
): Promise<number> {
  if (!game.user?.isGM) return 0;
  return commitActorXpUpdates(buildXpRevertUpdates(recipients));
}
