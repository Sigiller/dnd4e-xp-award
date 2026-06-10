import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import {
  buildXpApplyUpdates,
  buildXpRevertUpdates,
  commitActorXpUpdates,
} from "../src/xp/actor-xp.ts";
import type { Actor } from "../src/foundry-globals.js";

function mockActor(id: string, exp: number): Actor {
  return {
    id,
    name: `Actor ${id}`,
    type: "character",
    img: "",
    folder: null,
    ownership: {},
    flags: {},
    system: { details: { exp } },
    getFlag: () => undefined,
    testUserPermission: () => true,
    update: async () => mockActor(id, exp),
  } as Actor;
}

describe("actor-xp batch updates", () => {
  const originalGame = (globalThis as { game?: unknown }).game;
  const originalActor = (globalThis as { Actor?: unknown }).Actor;
  let updateDocumentsCalls: Array<{
    updates: Array<{ _id: string } & Record<string, unknown>>;
    options?: { render?: boolean };
  }>;

  beforeEach(() => {
    updateDocumentsCalls = [];
    const actors = new Map([
      ["pc1", mockActor("pc1", 100)],
      ["pc2", mockActor("pc2", 50)],
    ]);
    (globalThis as { game?: { actors: { get: (id: string) => Actor | undefined }; user?: { isGM: boolean } } }).game = {
      actors: { get: (id: string) => actors.get(id) },
      user: { isGM: true },
    };
    (globalThis as {
      Actor?: {
        updateDocuments: (
          updates: Array<{ _id: string } & Record<string, unknown>>,
          options?: { render?: boolean }
        ) => Promise<unknown[]>;
      };
    }).Actor = {
      updateDocuments: async (updates, options) => {
        updateDocumentsCalls.push({ updates, options });
        return [];
      },
    };
  });

  afterEach(() => {
    (globalThis as { game?: unknown }).game = originalGame;
    (globalThis as { Actor?: unknown }).Actor = originalActor;
  });

  it("buildXpApplyUpdates adds xp per actor", () => {
    const updates = buildXpApplyUpdates([
      { actorId: "pc1", xp: 25 },
      { actorId: "pc2", xp: 10 },
    ]);

    assert.deepEqual(updates, [
      { _id: "pc1", "system.details.exp": 125 },
      { _id: "pc2", "system.details.exp": 60 },
    ]);
  });

  it("buildXpApplyUpdates skips zero xp and missing actors", () => {
    const updates = buildXpApplyUpdates([
      { actorId: "pc1", xp: 0 },
      { actorId: "missing", xp: 20 },
      { actorId: "pc2", xp: 5 },
    ]);

    assert.deepEqual(updates, [{ _id: "pc2", "system.details.exp": 55 }]);
  });

  it("buildXpRevertUpdates subtracts xp without going negative", () => {
    const updates = buildXpRevertUpdates([
      { actorId: "pc1", xp: 30 },
      { actorId: "pc2", xp: 100 },
    ]);

    assert.deepEqual(updates, [
      { _id: "pc1", "system.details.exp": 70 },
      { _id: "pc2", "system.details.exp": 0 },
    ]);
  });

  it("commitActorXpUpdates calls Actor.updateDocuments once with render false", async () => {
    const count = await commitActorXpUpdates([
      { _id: "pc1", "system.details.exp": 200 },
    ]);

    assert.equal(count, 1);
    assert.equal(updateDocumentsCalls.length, 1);
    assert.deepEqual(updateDocumentsCalls[0]?.updates, [
      { _id: "pc1", "system.details.exp": 200 },
    ]);
    assert.deepEqual(updateDocumentsCalls[0]?.options, { render: false });
  });

  it("commitActorXpUpdates skips updateDocuments when empty", async () => {
    const count = await commitActorXpUpdates([]);

    assert.equal(count, 0);
    assert.equal(updateDocumentsCalls.length, 0);
  });
});
