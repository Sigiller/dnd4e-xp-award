import { getPartyFolderName } from "../settings.js";
import type { Actor, Folder, User } from "../foundry-globals.js";

const PC_TYPE = "Player Character";

function isPlayerOrTrustedUser(user: User | undefined): user is User {
  if (!user?.active || user.isGM) return false;
  return user.role === CONST.USER_ROLES.PLAYER || user.role === CONST.USER_ROLES.TRUSTED;
}

function isPlayerCharacter(actor: Actor): boolean {
  return actor.type === PC_TYPE;
}

export function getPartyFolder(): Folder | undefined {
  const name = getPartyFolderName().trim().toLowerCase();
  if (!name) return undefined;
  return game.folders.find(
    (f) => f.type === "Actor" && f.name.trim().toLowerCase() === name
  );
}

export function getActorFolderId(actor: Actor): string | null {
  const folder = actor.folder;
  if (!folder) return null;
  if (typeof folder === "string") return folder;
  return folder.id ?? null;
}

export function isDirectChildOfPartyFolder(actor: Actor, partyFolderId: string): boolean {
  return getActorFolderId(actor) === partyFolderId;
}

function permissionForUser(actor: Actor, user: User): number {
  const ownership = actor.ownership ?? {};
  if (user.id in ownership) return ownership[user.id]!;
  return ownership.default ?? CONST.DOCUMENT_OWNERSHIP_LEVELS.NONE;
}

export function hasPlayerOrTrustedOwner(actor: Actor): boolean {
  for (const user of game.users) {
    if (!isPlayerOrTrustedUser(user)) continue;

    if (user.character?.id === actor.id) return true;

    const level = permissionForUser(actor, user);
    if (level >= CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER) return true;

    if (actor.testUserPermission(user, CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER)) {
      return true;
    }
  }

  const def = actor.ownership?.default ?? CONST.DOCUMENT_OWNERSHIP_LEVELS.NONE;
  if (def >= CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER && game.users.some(isPlayerOrTrustedUser)) {
    return true;
  }

  return false;
}

export function isPartyMember(actor: Actor, partyFolderId?: string | null): boolean {
  if (!isPlayerCharacter(actor)) return false;

  const folderId = partyFolderId ?? getPartyFolder()?.id ?? null;
  if (folderId) {
    return isDirectChildOfPartyFolder(actor, folderId);
  }

  return hasPlayerOrTrustedOwner(actor);
}

function iterateActors(): Actor[] {
  const collection = game.actors;
  if (collection?.contents) return [...collection.contents];
  if (typeof collection?.filter === "function") return collection.filter(() => true);
  return [];
}

export function getPartyMembers(partyFolderId?: string): Actor[] {
  const folderId = partyFolderId ?? getPartyFolder()?.id;
  const seen = new Map<string, Actor>();

  for (const actor of iterateActors()) {
    if (!isPartyMember(actor, folderId)) continue;
    seen.set(actor.id, actor);
  }

  return [...seen.values()].sort((a, b) => a.name.localeCompare(b.name));
}
