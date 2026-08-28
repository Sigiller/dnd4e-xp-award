import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { buildXpAwardState } from "../src/xp/combat-context.js";
import { mockActor } from "./helpers/mock-actor.js";

describe("combat-context recipients", () => {
  const originalGame = (globalThis as { game?: unknown }).game;
  const originalConst = (globalThis as { CONST?: unknown }).CONST;
  const originalConfig = (globalThis as { CONFIG?: unknown }).CONFIG;

  beforeEach(() => {
    (globalThis as { CONST?: unknown }).CONST = {
      TOKEN_DISPOSITIONS: { HOSTILE: -1, NEUTRAL: 0, FRIENDLY: 1 },
      USER_ROLES: { PLAYER: 1, TRUSTED: 2, ASSISTANT: 3, GAMEMASTER: 4 },
      DOCUMENT_OWNERSHIP_LEVELS: { NONE: 0, LIMITED: 1, OBSERVER: 2, OWNER: 3 },
    };
    (globalThis as { CONFIG?: unknown }).CONFIG = {
      DND4E: {
        creatureRole: {},
        creatureRoleSecond: {},
      },
    };

    const partyFolder = { id: "folder-party", type: "Actor", name: "Party" };
    const pcs = [
      mockActor({
        id: "pc-in-combat",
        name: "Theron",
        type: "Player Character",
        folder: partyFolder,
        system: { details: { exp: 100, level: 5 } },
      }),
      mockActor({
        id: "pc-out-of-combat",
        name: "Aria",
        type: "Player Character",
        folder: partyFolder,
        system: { details: { exp: 100, level: 5 } },
      }),
      mockActor({
        id: "pc-third",
        name: "Nord",
        type: "Player Character",
        folder: partyFolder,
        system: { details: { exp: 100, level: 5 } },
      }),
    ];
    const monster = mockActor({
      id: "npc1",
      name: "Goblin",
      type: "NPC",
      system: { details: { exp: 125, level: 3 } },
    });

    const actorsById = new Map(pcs.map((pc) => [pc.id!, pc]));
    actorsById.set("npc1", monster);

    (globalThis as {
      game?: {
        actors: {
          contents: Actor.Implementation[];
          get: (id: string) => Actor.Implementation | undefined;
        };
        folders: { find: (fn: (f: { type: string; name: string }) => boolean) => unknown };
        modules: { get: () => undefined };
        settings: { get: () => string };
        users: { contents: unknown[]; some: () => boolean };
      };
    }).game = {
      actors: {
        contents: [...pcs, monster],
        get: (id) => actorsById.get(id),
      },
      folders: {
        find: (fn) => (fn(partyFolder) ? partyFolder : undefined),
      },
      modules: { get: () => undefined },
      settings: { get: () => "Party" },
      users: { contents: [], some: () => false },
    };
  });

  afterEach(() => {
    (globalThis as { game?: unknown }).game = originalGame;
    (globalThis as { CONST?: unknown }).CONST = originalConst;
    (globalThis as { CONFIG?: unknown }).CONFIG = originalConfig;
  });

  it("auto mode awards the full party, not only combatants on the tracker", () => {
    const combat = {
      combatants: {
        contents: [
          {
            id: "c1",
            actor: game.actors?.get("pc-in-combat"),
            token: { disposition: 1, texture: { src: "" } },
          },
          {
            id: "c2",
            actor: game.actors?.get("npc1"),
            token: { disposition: -1, texture: { src: "tokens/goblin.png" } },
          },
        ],
      },
    } as unknown as Combat.Implementation;

    const state = buildXpAwardState({ combat, mode: "auto" });
    const recipientIds = state.recipients.map((r) => r.actorId).sort();

    assert.deepEqual(recipientIds, ["pc-in-combat", "pc-out-of-combat", "pc-third"]);
    assert.equal(state.enemies.length, 1);
    assert.equal(state.enemies[0]?.xp, 125);
  });
});
