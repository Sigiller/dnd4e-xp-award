import { getPartyMembers, isPartyMember } from "../party/party-members.js";
import { requireActorId } from "../types/dnd4e.js";
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

function getTokenDisposition(combatant: Combatant.Implementation): number | null {
  const token = combatant.token;
  if (!token) return null;
  return token.disposition;
}

function getTokenImg(combatant: Combatant.Implementation): string | undefined {
  const src = combatant.token?.texture.src;
  return typeof src === "string" ? src : undefined;
}

function uniquePartyActorsFromCombat(
  combat: Combat.Implementation,
  filter: (combatant: Combatant.Implementation, actor: Actor.Implementation) => boolean
): Actor.Implementation[] {
  const seen = new Map<string, Actor.Implementation>();
  for (const combatant of combat.combatants.contents) {
    const raw = combatant.actor;
    if (!raw) continue;
    const actor = resolvePolymorphedActor(raw);
    if (!filter(combatant, actor)) continue;
    seen.set(requireActorId(actor), actor);
  }
  return [...seen.values()].sort((a, b) => a.name.localeCompare(b.name));
}

/** One enemy entry per hostile combatant token (defeated and alive). */
function buildEnemiesFromCombat(combat: Combat.Implementation): XpEntry[] {
  const hostile = CONST.TOKEN_DISPOSITIONS.HOSTILE;
  const enemies: XpEntry[] = [];

  for (const combatant of combat.combatants.contents) {
    const raw = combatant.actor;
    if (!raw) continue;
    const disposition = getTokenDisposition(combatant);
    if (disposition !== hostile) continue;

    const actor = resolvePolymorphedActor(raw);
    const combatantId = combatant.id;
    if (!combatantId) continue;
    enemies.push(createEnemyEntryFromActor(actor, combatantId, getTokenImg(combatant)));
  }

  return groupEnemyEntries(enemies);
}

function buildRecipientsFromCombat(combat: Combat.Implementation): XpEntry[] {
  const actors = uniquePartyActorsFromCombat(combat, (_combatant, actor) => isPartyMember(actor));
  return actors.map((actor) => createRecipientEntry(requireActorId(actor)));
}

function buildRecipientsFromParty(): XpEntry[] {
  return getPartyMembers().map((actor) => createRecipientEntry(requireActorId(actor)));
}

export function buildXpAwardState(options: {
  combat?: Combat.Implementation;
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
export function getCombatTokenImages(combat: Combat.Implementation): Map<string, string> {
  const map = new Map<string, string>();
  const hostile = CONST.TOKEN_DISPOSITIONS.HOSTILE;

  for (const combatant of combat.combatants.contents) {
    const img = getTokenImg(combatant);
    if (!img) continue;
    const disposition = getTokenDisposition(combatant);
    if (disposition !== hostile) continue;
    const combatantId = combatant.id;
    if (!combatantId) continue;
    map.set(combatantId, img);
  }

  return map;
}
