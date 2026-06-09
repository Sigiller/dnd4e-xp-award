import { getMonsterXpForLevel } from "./xp-table.js";
import { calcPartyLevel } from "../party/party-level.js";

export interface SkillChallengeInput {
  complexity: number;
  level: number;
}

export const SKILL_CHALLENGE_COMPLEXITY_MIN = 1;
export const SKILL_CHALLENGE_COMPLEXITY_MAX = 5;
export const SKILL_CHALLENGE_COMPLEXITY_DEFAULT = 1;
export const SKILL_CHALLENGE_LEVEL_MIN = 1;
export const SKILL_CHALLENGE_LEVEL_MAX = 30;

export function clampSkillChallengeComplexity(value: number): number {
  const n = Math.floor(Number(value));
  const resolved = Number.isFinite(n) && n > 0 ? n : SKILL_CHALLENGE_COMPLEXITY_DEFAULT;
  return Math.min(
    SKILL_CHALLENGE_COMPLEXITY_MAX,
    Math.max(SKILL_CHALLENGE_COMPLEXITY_MIN, resolved)
  );
}

export function clampSkillChallengeLevel(value: number): number {
  const n = Math.floor(Number(value));
  const resolved = Number.isFinite(n) && n > 0 ? n : SKILL_CHALLENGE_LEVEL_MIN;
  return Math.min(SKILL_CHALLENGE_LEVEL_MAX, Math.max(SKILL_CHALLENGE_LEVEL_MIN, resolved));
}

export function defaultSkillChallengeLevel(partyLevel = calcPartyLevel()): number {
  if (partyLevel <= 0) return SKILL_CHALLENGE_LEVEL_MIN;
  return clampSkillChallengeLevel(partyLevel);
}

export function createDefaultSkillChallengeState(): SkillChallengeInput {
  const level = defaultSkillChallengeLevel();
  return {
    complexity: SKILL_CHALLENGE_COMPLEXITY_DEFAULT,
    level,
  };
}

export function calcSkillChallengeXp(complexity: number, level: number): number {
  const c = clampSkillChallengeComplexity(complexity);
  const l = clampSkillChallengeLevel(level);
  const monsterXp = getMonsterXpForLevel(l);
  if (monsterXp <= 0) return 0;
  return c * monsterXp;
}
