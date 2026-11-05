import { isPolymorphedActor, readActorXp } from "../types/dnd4e.js";
import type { XpEntry } from "./xp-calculator.js";

export { readActorXp };

export function readMonsterXpValue(actor: Actor.Implementation): number {
  return readActorXp(actor);
}

export function resolvePolymorphedActor(actor: Actor.Implementation): Actor.Implementation {
  if (!isPolymorphedActor(actor)) return actor;
  const originalId = actor.getFlag("dnd4e", "originalActor");
  if (typeof originalId === "string") {
    const original = game.actors?.get(originalId);
    if (original) return original;
  }
  return actor;
}

export interface ActorXpUpdate {
  _id: string;
  "system.details.exp": number;
}

function resolveWorldActor(actorId: string): Actor.Implementation | undefined {
  return game.actors?.get(actorId);
}

export function buildXpApplyUpdates(
  recipients: { actorId: string; xp: number }[]
): ActorXpUpdate[] {
  const updates: ActorXpUpdate[] = [];

  for (const entry of recipients) {
    if (entry.xp <= 0) continue;
    const actor = resolveWorldActor(entry.actorId);
    if (!actor?.id) {
      console.warn(
        `dnd4e-xp-award | skipping XP apply for missing world actor id=${entry.actorId}`
      );
      continue;
    }
    const current = readActorXp(actor);
    updates.push({
      _id: actor.id,
      "system.details.exp": current + Math.floor(entry.xp),
    });
  }

  return updates;
}

export function buildXpRevertUpdates(
  recipients: { actorId: string; xp: number }[]
): ActorXpUpdate[] {
  const updates: ActorXpUpdate[] = [];

  for (const entry of recipients) {
    if (entry.xp <= 0) continue;
    const actor = resolveWorldActor(entry.actorId);
    if (!actor?.id) {
      console.warn(
        `dnd4e-xp-award | skipping XP revert for missing world actor id=${entry.actorId}`
      );
      continue;
    }
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
  const DocumentClass = CONFIG.Actor.documentClass ?? Actor;
  // Keep the default render behaviour: with render:false open character sheets stay stale
  // on every client, and the dnd4e sheet then writes the old XP back on its next submit.
  await DocumentClass.updateDocuments(updates);
  return updates.length;
}

export async function applyXpRewards(recipients: XpEntry[]): Promise<number> {
  if (!game.user?.isGM) return 0;
  return commitActorXpUpdates(buildXpApplyUpdates(recipients));
}

export async function revertXpRewards(
  recipients: { actorId: string; xp: number }[]
): Promise<number> {
  if (!game.user?.isGM) return 0;
  return commitActorXpUpdates(buildXpRevertUpdates(recipients));
}
