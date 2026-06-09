import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { calcPartyLevel, readActorLevel } from "../src/party/party-level.ts";
import type { Actor } from "../src/foundry-globals.js";

function mockActor(level?: number): Actor {
  return {
    system: {
      details: level == null ? {} : { level },
    },
  } as Actor;
}

describe("party-level", () => {
  it("reads actor level with fallback to 1", () => {
    assert.equal(readActorLevel(mockActor(7)), 7);
    assert.equal(readActorLevel(mockActor()), 1);
  });

  it("averages member levels with floor", () => {
    assert.equal(calcPartyLevel([mockActor(3), mockActor(4), mockActor(5)]), 4);
    assert.equal(calcPartyLevel([mockActor(1), mockActor(2)]), 1);
  });

  it("returns 0 for an empty party", () => {
    assert.equal(calcPartyLevel([]), 0);
  });
});
