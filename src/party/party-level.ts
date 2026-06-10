import { readActorLevel } from "../types/dnd4e.js";
import { getPartyMembers } from "./party-members.js";

export { readActorLevel };

/** Floor of the mean PC level in the party folder (same as dnd4e-party-sheet). */
export function calcPartyLevel(actors = getPartyMembers()): number {
  const levels = actors.map(readActorLevel);
  if (levels.length === 0) return 0;
  return Math.floor(levels.reduce((sum, level) => sum + level, 0) / levels.length);
}
