import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  calcPerMemberXp,
  calcTotalXp,
  redistributeRecipients,
  syncXpState,
} from "../src/xp/xp-calculator.ts";

describe("xp-calculator", () => {
  it("sums enemy xp, bonus, and skill challenge xp", () => {
    assert.equal(
      calcTotalXp(
        [
          { id: "e1", actorId: "a", xp: 100 },
          { id: "e2", actorId: "b", xp: 50 },
        ],
        25,
        500
      ),
      675
    );
  });

  it("sums enemy xp and bonus", () => {
    assert.equal(
      calcTotalXp(
        [
          { id: "e1", actorId: "a", xp: 100 },
          { id: "e2", actorId: "b", xp: 50 },
        ],
        25
      ),
      175
    );
  });

  it("sums xp for grouped enemies using count", () => {
    assert.equal(
      calcTotalXp([{ id: "c1", actorId: "goblin", xp: 25, count: 3 }], 0),
      75
    );
  });

  it("sums xp for multiple token instances of the same actor", () => {
    assert.equal(
      calcTotalXp(
        [
          { id: "c1", actorId: "goblin", xp: 25 },
          { id: "c2", actorId: "goblin", xp: 25 },
          { id: "c3", actorId: "goblin", xp: 25 },
        ],
        0
      ),
      75
    );
  });

  it("floors per-member xp", () => {
    assert.equal(calcPerMemberXp(100, 3), 33);
    assert.equal(calcPerMemberXp(0, 3), 0);
    assert.equal(calcPerMemberXp(100, 0), 0);
  });

  it("redistributes recipients evenly", () => {
    const result = redistributeRecipients(
      [
        { id: "p1", actorId: "a", xp: 99 },
        { id: "p2", actorId: "b", xp: 1 },
      ],
      40
    );
    assert.deepEqual(result, [
      { id: "p1", actorId: "a", xp: 40 },
      { id: "p2", actorId: "b", xp: 40 },
    ]);
  });

  it("syncXpState recalculates after enemy removal", () => {
    const synced = syncXpState(
      [{ id: "m1", actorId: "m1", xp: 90 }],
      [
        { id: "p1", actorId: "p1", xp: 0 },
        { id: "p2", actorId: "p2", xp: 0 },
      ],
      10
    );
    assert.equal(synced.totalXp, 100);
    assert.equal(synced.perMemberXp, 50);
    assert.deepEqual(synced.recipients, [
      { id: "p1", actorId: "p1", xp: 50 },
      { id: "p2", actorId: "p2", xp: 50 },
    ]);
  });
});
