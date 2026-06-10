import { getPartyFolderName } from "../settings.js";
import { isPlayerCharacter } from "../types/dnd4e.js";

function isPlayerOrTrustedUser(user: User.Implementation): boolean {
  if (!user.active || user.isGM) return false;
  return user.role === CONST.USER_ROLES.PLAYER || user.role === CONST.USER_ROLES.TRUSTED;
}

export function getPartyFolder(): Folder.Implementation | undefined {
  const name = getPartyFolderName().trim().toLowerCase();
  if (!name) return undefined;
  return game.folders?.find(
    (folder) => folder.type === "Actor" && folder.name.trim().toLowerCase() === name
  );
}

export function getActorFolderId(actor: Actor.Implementation): string | null {
  const folder = actor.folder;
  if (!folder) return null;
  if (typeof folder === "string") return folder;
  return folder.id;
}

export function isDirectChildOfPartyFolder(
  actor: Actor.Implementation,
  partyFolderId: string
): boolean {
  return getActorFolderId(actor) === partyFolderId;
}

function permissionForUser(actor: Actor.Implementation, user: User.Implementation): number {
  const ownership = actor.ownership;
  const userId = user.id ?? "";
  if (userId && userId in ownership) {
    return ownership[userId] ?? CONST.DOCUMENT_OWNERSHIP_LEVELS.NONE;
  }
  return ownership.default ?? CONST.DOCUMENT_OWNERSHIP_LEVELS.NONE;
}

export function hasPlayerOrTrustedOwner(actor: Actor.Implementation): boolean {
  const users = game.users?.contents ?? [];
  for (const user of users) {
    if (!isPlayerOrTrustedUser(user)) continue;

    if (user.character?.id === actor.id) return true;

    const level = permissionForUser(actor, user);
    if (level >= CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER) return true;

    if (actor.testUserPermission(user, CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER)) {
      return true;
    }
  }

  const def = actor.ownership.default ?? CONST.DOCUMENT_OWNERSHIP_LEVELS.NONE;
  if (def >= CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER && (game.users?.some(isPlayerOrTrustedUser) ?? false)) {
    return true;
  }

  return false;
}

export function isPartyMember(
  actor: Actor.Implementation,
  partyFolderId?: string | null
): boolean {
  if (!isPlayerCharacter(actor)) return false;

  const folderId = partyFolderId ?? getPartyFolder()?.id ?? null;
  if (folderId) {
    return isDirectChildOfPartyFolder(actor, folderId);
  }

  return hasPlayerOrTrustedOwner(actor);
}

export function getPartyMembers(partyFolderId?: string): Actor.Implementation[] {
  const folderId = partyFolderId ?? getPartyFolder()?.id;
  const seen = new Map<string, Actor.Implementation>();

  for (const actor of game.actors?.contents ?? []) {
    if (!isPartyMember(actor, folderId)) continue;
    if (!actor.id) continue;
    seen.set(actor.id, actor);
  }

  return [...seen.values()].sort((a, b) => a.name.localeCompare(b.name));
}
