import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { calcPartyLevel, readActorLevel } from "../src/party/party-level.js";
import { mockActor } from "./helpers/mock-actor.js";

describe("party-level", () => {
  it("reads actor level with fallback to 1", () => {
    assert.equal(
      readActorLevel(mockActor({ id: "pc1", name: "PC 1", system: { details: { level: 7 } } })),
      7
    );
    assert.equal(readActorLevel(mockActor({ id: "pc2", name: "PC 2", system: { details: {} } })), 1);
  });

  it("averages member levels with floor", () => {
    assert.equal(
      calcPartyLevel([
        mockActor({ id: "a", name: "A", system: { details: { level: 3 } } }),
        mockActor({ id: "b", name: "B", system: { details: { level: 4 } } }),
        mockActor({ id: "c", name: "C", system: { details: { level: 5 } } }),
      ]),
      4
    );
    assert.equal(
      calcPartyLevel([
        mockActor({ id: "a", name: "A", system: { details: { level: 1 } } }),
        mockActor({ id: "b", name: "B", system: { details: { level: 2 } } }),
      ]),
      1
    );
  });

  it("returns 0 for an empty party", () => {
    assert.equal(calcPartyLevel([]), 0);
  });
});
