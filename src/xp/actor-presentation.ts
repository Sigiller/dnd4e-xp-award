import type { Actor } from "../foundry-globals.js";
import { readMonsterXpValue } from "./actor-xp.js";
import { createEnemyEntry, type XpEntry } from "./xp-calculator.js";

export interface ActorPresentation {
  id: string;
  name: string;
  img: string;
  subtitle: string;
}

function localizeConfigLabel(
  config: Record<string, { label?: string }> | undefined,
  key: string | undefined
): string {
  if (!key || !config?.[key]?.label) return "";
  return game.i18n.localize(config[key]!.label!);
}

function pcSubtitle(actor: Actor): string {
  const details = actor.system?.details as Record<string, unknown> | undefined;
  if (!details) return "";
  const level = details.level != null ? `Level ${details.level}` : "";
  const parts = [details.race, details.class, details.paragon, details.epic]
    .filter((p) => p && String(p).trim())
    .map(String);
  const classLine = parts.join(" / ");
  return [level, classLine].filter(Boolean).join(" · ");
}

function npcSubtitle(actor: Actor): string {
  const details = actor.system?.details as {
    level?: number;
    role?: { primary?: string; secondary?: string };
  } | undefined;
  if (!details) return "";
  const level = details.level != null ? `Level ${details.level}` : "";
  const typeLabel = localizeConfigLabel(CONFIG.DND4E.creatureRoleSecond, details.role?.secondary);
  const roleLabel = localizeConfigLabel(CONFIG.DND4E.creatureRole, details.role?.primary);
  const typeParts = [typeLabel, roleLabel].filter(Boolean).join(" ");
  return [level, typeParts].filter(Boolean).join(" · ");
}

/** Token ring image for an actor (scene token → prototype → portrait). */
export function getActorTokenImage(actor: Actor): string {
  const canvasTokens = (
    globalThis as { canvas?: { tokens?: { placeables?: CanvasToken[] } } }
  ).canvas?.tokens?.placeables;
  if (canvasTokens) {
    for (const token of canvasTokens) {
      if (token.actor?.id !== actor.id) continue;
      const src = token.document?.texture?.src ?? token.texture?.src;
      if (src) return src;
    }
  }

  const proto = (
    actor as Actor & { prototypeToken?: { texture?: { src?: string }; img?: string } }
  ).prototypeToken;
  if (proto?.texture?.src) return proto.texture.src;
  if (proto?.img) return proto.img;
  return actor.img || "icons/svg/mystery-man.svg";
}

export function buildActorPresentation(actor: Actor, tokenImg?: string): ActorPresentation {
  const subtitle = actor.type === "Player Character" ? pcSubtitle(actor) : npcSubtitle(actor);
  return {
    id: actor.id,
    name: actor.name,
    img: tokenImg || actor.img || "icons/svg/mystery-man.svg",
    subtitle,
  };
}

function isWorldActor(actor: Actor): boolean {
  return Boolean(game.actors.get(actor.id));
}

export function createEnemyEntryFromActor(
  actor: Actor,
  rowId?: string,
  tokenImg?: string
): XpEntry {
  const presentation = buildActorPresentation(actor, tokenImg);
  const xp = readMonsterXpValue(actor);

  return createEnemyEntry(actor.id, xp, rowId, {
    name: presentation.name,
    subtitle: presentation.subtitle,
    img: presentation.img,
    ...(isWorldActor(actor) ? {} : { uuid: actor.uuid }),
  });
}

function resolveEnemyImage(entry: XpEntry, tokenImg?: string): string {
  if (tokenImg) return tokenImg;
  if (entry.img) return entry.img;

  const actor = game.actors.get(entry.actorId);
  if (actor) return getActorTokenImage(actor);

  return "icons/svg/mystery-man.svg";
}

export function resolveEnemyPresentation(
  entry: XpEntry,
  tokenImg?: string
): ActorPresentation | null {
  if (entry.name) {
    return {
      id: entry.actorId,
      name: entry.name,
      img: resolveEnemyImage(entry, tokenImg),
      subtitle: entry.subtitle ?? "",
    };
  }

  const actor = game.actors.get(entry.actorId);
  if (!actor) return null;
  return buildActorPresentation(actor, tokenImg);
}
