import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  getEnemyGroupKey,
  groupEnemyEntries,
  mergeEnemyEntry,
  updateEnemyEntry,
} from "../src/xp/enemy-groups.ts";

describe("enemy-groups", () => {
  it("groups by normalized name and per-monster xp", () => {
    const grouped = groupEnemyEntries([
      { id: "a1", actorId: "a", xp: 100, name: "Goblin" },
      { id: "a2", actorId: "b", xp: 100, name: "goblin" },
      { id: "b1", actorId: "c", xp: 50, name: "Wolf" },
    ]);

    assert.equal(grouped.length, 2);
    const goblins = grouped.find((e) => e.name === "Goblin");
    assert.equal(goblins?.count, 2);
    assert.equal(goblins?.xp, 100);
  });

  it("merges incoming enemy into existing group", () => {
    const result = mergeEnemyEntry(
      [{ id: "a1", actorId: "a", xp: 100, name: "Goblin", count: 2 }],
      { id: "a2", actorId: "b", xp: 100, name: "Goblin" }
    );

    assert.equal(result.length, 1);
    assert.equal(result[0]?.count, 3);
  });

  it("re-groups when xp changes", () => {
    const result = updateEnemyEntry(
      [
        { id: "a1", actorId: "a", xp: 100, name: "Goblin", count: 1 },
        { id: "a2", actorId: "b", xp: 100, name: "Goblin", count: 1 },
      ],
      "a1",
      { xp: 50 }
    );

    assert.equal(result.length, 2);
    assert.deepEqual(
      result.map((e) => ({ xp: e.xp, count: e.count })).sort((a, b) => a.xp - b.xp),
      [
        { xp: 50, count: 1 },
        { xp: 100, count: 1 },
      ]
    );
  });

  it("builds stable group keys", () => {
    assert.equal(
      getEnemyGroupKey({ id: "x", actorId: "a", xp: 25, name: "Kobold" }),
      "kobold|25"
    );
  });
});
