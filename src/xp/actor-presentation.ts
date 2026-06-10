import {
  getDnd4eSystem,
  isPlayerCharacter,
  localizeDnd4eConfigLabel,
  readActorXp,
  requireActorId,
} from "../types/dnd4e.js";
import { createEnemyEntry, type XpEntry } from "./xp-calculator.js";

export interface ActorPresentation {
  id: string;
  name: string;
  img: string;
  subtitle: string;
}

function pcSubtitle(actor: Actor.Implementation): string {
  const details = getDnd4eSystem(actor).details;
  if (!details) return "";
  const level = details.level != null ? `Level ${details.level}` : "";
  const parts = [details.race, details.class, details.paragon, details.epic]
    .filter((part) => part && String(part).trim())
    .map(String);
  const classLine = parts.join(" / ");
  return [level, classLine].filter(Boolean).join(" · ");
}

function npcSubtitle(actor: Actor.Implementation): string {
  const details = getDnd4eSystem(actor).details;
  if (!details) return "";
  const level = details.level != null ? `Level ${details.level}` : "";
  const typeLabel = localizeDnd4eConfigLabel(
    CONFIG.DND4E.creatureRoleSecond,
    details.role?.secondary
  );
  const roleLabel = localizeDnd4eConfigLabel(CONFIG.DND4E.creatureRole, details.role?.primary);
  const typeParts = [typeLabel, roleLabel].filter(Boolean).join(" ");
  return [level, typeParts].filter(Boolean).join(" · ");
}

function readTokenTextureSrc(token: foundry.canvas.placeables.Token): string | undefined {
  const documentSrc = token.document.texture?.src;
  return typeof documentSrc === "string" ? documentSrc : undefined;
}

/** Token ring image for an actor (scene token → prototype → portrait). */
export function getActorTokenImage(actor: Actor.Implementation): string {
  const sceneCanvas = (globalThis as { canvas?: Canvas | null | undefined }).canvas;
  const canvasTokens = sceneCanvas?.tokens?.placeables;
  if (canvasTokens) {
    for (const token of canvasTokens) {
      if (token.actor?.id !== actor.id) continue;
      const src = readTokenTextureSrc(token);
      if (src) return src;
    }
  }

  const proto = actor.prototypeToken;
  if (proto.texture.src) return proto.texture.src;
  return actor.img || "icons/svg/mystery-man.svg";
}

export function buildActorPresentation(
  actor: Actor.Implementation,
  tokenImg?: string
): ActorPresentation {
  const subtitle = isPlayerCharacter(actor) ? pcSubtitle(actor) : npcSubtitle(actor);
  return {
    id: requireActorId(actor),
    name: actor.name,
    img: tokenImg ?? (actor.img || "icons/svg/mystery-man.svg"),
    subtitle,
  };
}

function isWorldActor(actor: Actor.Implementation): boolean {
  const actorId = actor.id;
  if (!actorId) return false;
  return Boolean(game.actors?.get(actorId));
}

export function createEnemyEntryFromActor(
  actor: Actor.Implementation,
  rowId?: string,
  tokenImg?: string
): XpEntry {
  const presentation = buildActorPresentation(actor, tokenImg);
  const xp = readActorXp(actor);
  const actorId = requireActorId(actor);

  return createEnemyEntry(actorId, xp, rowId, {
    name: presentation.name,
    subtitle: presentation.subtitle,
    img: presentation.img,
    ...(isWorldActor(actor) ? {} : { uuid: actor.uuid ?? undefined }),
  });
}

function resolveEnemyImage(entry: XpEntry, tokenImg?: string): string {
  if (tokenImg) return tokenImg;
  if (entry.img) return entry.img;

  const actor = game.actors?.get(entry.actorId);
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

  const actor = game.actors?.get(entry.actorId);
  if (!actor) return null;
  return buildActorPresentation(actor, tokenImg);
}
