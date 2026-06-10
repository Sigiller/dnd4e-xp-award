import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  createEnemyEntryFromActor,
  resolveEnemyPresentation,
} from "../src/xp/actor-presentation.js";
import { mockActor } from "./helpers/mock-actor.js";

describe("actor-presentation compendium enemies", () => {
  it("caches presentation for non-world actors", () => {
    (globalThis as { CONFIG?: object; game?: object }).CONFIG = {
      DND4E: { creatureRole: {}, creatureRoleSecond: {}, skills: {} },
    };
    (globalThis as { game?: { actors: { get: () => undefined } } }).game = {
      actors: { get: () => undefined },
    };

    const actor = mockActor({
      id: "goblin",
      name: "Goblin Cutthroat",
      type: "NPC",
      img: "monsters/goblin.png",
      uuid: "Compendium.world.monsters.Actor.goblin",
      system: {
        details: { exp: 125, level: 2, role: { primary: "skirmisher" } },
      },
    });
    const entry = createEnemyEntryFromActor(actor);

    assert.equal(entry.actorId, "goblin");
    assert.equal(entry.xp, 125);
    assert.equal(entry.name, "Goblin Cutthroat");
    assert.equal(entry.img, "monsters/goblin.png");
    assert.equal(entry.count, undefined);
    assert.match(entry.uuid ?? "", /^Compendium\./);
  });

  it("resolves cached enemy rows without game.actors", () => {
    const presentation = resolveEnemyPresentation({
      id: "row-1",
      actorId: "goblin",
      xp: 125,
      name: "Goblin Cutthroat",
      img: "monsters/goblin.png",
      subtitle: "Level 2",
    });

    assert.deepEqual(presentation, {
      id: "goblin",
      name: "Goblin Cutthroat",
      img: "monsters/goblin.png",
      subtitle: "Level 2",
    });
  });

  it("resolves world actor portraits from token image when img is not cached", () => {
    (globalThis as { CONFIG?: object; game?: object }).CONFIG = {
      DND4E: { creatureRole: {}, creatureRoleSecond: {}, skills: {} },
    };
    const actor = mockActor({
      id: "goblin-world",
      name: "Goblin Cutthroat",
      type: "NPC",
      img: "actors/goblin-portrait.png",
      system: { details: { exp: 125, level: 2 } },
    });
    (globalThis as {
      game?: { actors: { get: (id: string) => Actor.Implementation | undefined } };
    }).game = {
      actors: {
        get: (id: string) => (id === "goblin-world" ? actor : undefined),
      },
    };

    const presentation = resolveEnemyPresentation({
      id: "row-1",
      actorId: "goblin-world",
      xp: 125,
      name: "Goblin Cutthroat",
    });

    assert.equal(presentation?.img, "actors/goblin-portrait.png");
  });

  it("prefers combat token image over cached portrait", () => {
    const presentation = resolveEnemyPresentation(
      {
        id: "combatant-1",
        actorId: "goblin-world",
        xp: 125,
        name: "Goblin Cutthroat",
        img: "actors/goblin-portrait.png",
      },
      "tokens/goblin-token.png"
    );

    assert.equal(presentation?.img, "tokens/goblin-token.png");
  });
});
