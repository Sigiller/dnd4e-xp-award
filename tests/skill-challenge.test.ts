import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  calcSkillChallengeXp,
  clampSkillChallengeComplexity,
  clampSkillChallengeLevel,
  defaultSkillChallengeLevel,
} from "../src/xp/skill-challenge.js";
import { getMonsterXpForLevel, getXpTableRow } from "../src/xp/xp-table.js";

describe("xp-table", () => {
  it("looks up standard monster xp by level", () => {
    assert.equal(getMonsterXpForLevel(1), 100);
    assert.equal(getMonsterXpForLevel(5), 200);
    assert.equal(getMonsterXpForLevel(40), 111000);
  });

  it("returns all role columns for a level", () => {
    assert.deepEqual(getXpTableRow(10), {
      level: 10,
      monster: 500,
      minion: 125,
      elite: 1000,
      solo: 2500,
    });
  });

  it("returns undefined for out-of-range levels", () => {
    assert.equal(getMonsterXpForLevel(0), 0);
    assert.equal(getMonsterXpForLevel(41), 0);
  });
});

describe("skill-challenge", () => {
  it("calculates complexity * monster xp at level", () => {
    assert.equal(calcSkillChallengeXp(2, 5), 2 * 200);
    assert.equal(calcSkillChallengeXp(1, 1), 100);
  });

  it("clamps complexity to 1..5", () => {
    assert.equal(clampSkillChallengeComplexity(0), 1);
    assert.equal(clampSkillChallengeComplexity(3), 3);
    assert.equal(clampSkillChallengeComplexity(9), 5);
  });

  it("clamps level to 1..30", () => {
    assert.equal(clampSkillChallengeLevel(0), 1);
    assert.equal(clampSkillChallengeLevel(15), 15);
    assert.equal(clampSkillChallengeLevel(40), 30);
  });

  it("defaults skill challenge level from party level", () => {
    assert.equal(defaultSkillChallengeLevel(0), 1);
    assert.equal(defaultSkillChallengeLevel(12), 12);
    assert.equal(defaultSkillChallengeLevel(35), 30);
  });

  it("floors fractional inputs", () => {
    assert.equal(calcSkillChallengeXp(2.9, 5.9), 2 * 200);
  });
});
