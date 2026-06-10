export interface Dnd4eConfigLabelEntry {
  label?: string;
}

export interface Dnd4eActorRole {
  primary?: string;
  secondary?: string;
}

export interface Dnd4eActorDetails {
  exp?: number;
  level?: number;
  role?: Dnd4eActorRole;
  race?: string;
  class?: string;
  paragon?: string;
  epic?: string;
}

export interface Dnd4eActorSystem {
  details?: Dnd4eActorDetails;
}

const PC_TYPE = "Player Character";

/** Single documented cast point for dnd4e actor system data. */
export function getDnd4eSystem(actor: Actor.Implementation): Dnd4eActorSystem {
  return actor.system as Dnd4eActorSystem;
}

export function isPlayerCharacter(actor: Actor.Implementation): boolean {
  return String(actor.type) === PC_TYPE;
}

export function readActorXp(actor: Actor.Implementation): number {
  const exp = getDnd4eSystem(actor).details?.exp;
  return Math.max(0, Math.floor(Number(exp ?? 0)));
}

export function readActorLevel(actor: Actor.Implementation): number {
  const level = getDnd4eSystem(actor).details?.level;
  return Number(level) || 1;
}

export function isPolymorphedActor(actor: Actor.Implementation): boolean {
  return Boolean((actor as Actor.Implementation & { isPolymorphed?: boolean }).isPolymorphed);
}

export function localizeDnd4eConfigLabel(
  config: Record<string, Dnd4eConfigLabelEntry> | undefined,
  key: string | undefined
): string {
  if (!key || !config?.[key]?.label) return "";
  return game.i18n?.localize(config[key].label) ?? config[key].label;
}

export function requireActorId(actor: Actor.Implementation): string {
  if (!actor.id) throw new Error(`Actor "${actor.name}" is missing an id`);
  return actor.id;
}
