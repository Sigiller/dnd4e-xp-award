import { getPartyMembers, isPartyMember } from "../party/party-members.js";
import type { Actor, Combat } from "../foundry-globals.js";
import { createEnemyEntryFromActor } from "./actor-presentation.js";
import { groupEnemyEntries } from "./enemy-groups.js";
import { resolvePolymorphedActor } from "./actor-xp.js";
import { createRecipientEntry, syncXpState, type XpEntry } from "./xp-calculator.js";

export type XpAwardMode = "auto" | "manual";

export interface XpAwardState {
  enemies: XpEntry[];
  recipients: XpEntry[];
  bonusXp: number;
  mode: XpAwardMode;
}

function getTokenDisposition(combatant: Combat["combatants"][number]): number | null {
  const token = combatant.token;
  if (!token) return null;
  return token.disposition;
}

function getTokenImg(combatant: Combat["combatants"][number]): string | undefined {
  return combatant.token?.texture?.src;
}

function uniquePartyActorsFromCombat(
  combat: Combat,
  filter: (combatant: Combat["combatants"][number], actor: Actor) => boolean
): Actor[] {
  const seen = new Map<string, Actor>();
  for (const combatant of combat.combatants) {
    const raw = combatant.actor;
    if (!raw) continue;
    const actor = resolvePolymorphedActor(raw);
    if (!filter(combatant, actor)) continue;
    seen.set(actor.id, actor);
  }
  return [...seen.values()].sort((a, b) => a.name.localeCompare(b.name));
}

/** One enemy entry per hostile combatant token (defeated and alive). */
function buildEnemiesFromCombat(combat: Combat): XpEntry[] {
  const hostile = CONST.TOKEN_DISPOSITIONS.HOSTILE;
  const enemies: XpEntry[] = [];

  for (const combatant of combat.combatants) {
    const raw = combatant.actor;
    if (!raw) continue;
    const disposition = getTokenDisposition(combatant);
    if (disposition !== hostile) continue;

    const actor = resolvePolymorphedActor(raw);
    enemies.push(createEnemyEntryFromActor(actor, combatant.id, getTokenImg(combatant)));
  }

  return groupEnemyEntries(enemies);
}

function buildRecipientsFromCombat(combat: Combat): XpEntry[] {
  const actors = uniquePartyActorsFromCombat(combat, (_combatant, actor) =>
    isPartyMember(actor)
  );
  return actors.map((actor) => createRecipientEntry(actor.id));
}

function buildRecipientsFromParty(): XpEntry[] {
  return getPartyMembers().map((actor) => createRecipientEntry(actor.id));
}

export function buildXpAwardState(options: {
  combat?: Combat;
  mode: XpAwardMode;
}): XpAwardState {
  const { combat, mode } = options;

  let enemies: XpEntry[] = [];
  let recipients: XpEntry[] = [];

  if (mode === "auto" && combat) {
    enemies = buildEnemiesFromCombat(combat);
    recipients = buildRecipientsFromCombat(combat);
  } else {
    recipients = buildRecipientsFromParty();
  }

  const synced = syncXpState(enemies, recipients, 0);
  return {
    enemies,
    recipients: synced.recipients,
    bonusXp: 0,
    mode,
  };
}

/** Maps enemy entry id → token portrait for combat-derived rows. */
export function getCombatTokenImages(combat: Combat): Map<string, string> {
  const map = new Map<string, string>();
  const hostile = CONST.TOKEN_DISPOSITIONS.HOSTILE;

  for (const combatant of combat.combatants) {
    const img = getTokenImg(combatant);
    if (!img) continue;
    const disposition = getTokenDisposition(combatant);
    if (disposition !== hostile) continue;
    map.set(combatant.id, img);
  }

  return map;
}
