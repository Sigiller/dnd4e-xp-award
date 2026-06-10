import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import {
  buildChatRecipientsFromAward,
  buildXpAwardChatHtml,
} from "../src/xp/xp-chat-log.js";
import { mockActor } from "./helpers/mock-actor.js";

describe("xp-chat-log performance helpers", () => {
  const originalGame = (globalThis as { game?: unknown }).game;
  const originalFoundry = (globalThis as { foundry?: unknown }).foundry;

  beforeEach(() => {
    const actor = mockActor({ id: "pc1", name: "Theron <Bold>", img: "actors/hero.png" });
    (globalThis as {
      game?: {
        actors: { get: (id: string) => Actor.Implementation | undefined };
        i18n: { localize: (key: string) => string; format: (key: string, data?: object) => string };
      };
    }).game = {
      actors: { get: (id: string) => (id === "pc1" ? actor : undefined) },
      i18n: {
        localize: (key: string) => key,
        format: (key: string) => key,
      },
    };
    (globalThis as { foundry?: { utils: { escapeHTML: (s: string) => string } } }).foundry = {
      utils: {
        escapeHTML: (s: string) =>
          s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"),
      },
    };
    (globalThis as { canvas?: { tokens?: { placeables?: unknown[] } } }).canvas = {
      tokens: { placeables: [] },
    };
  });

  afterEach(() => {
    (globalThis as { game?: unknown }).game = originalGame;
    (globalThis as { foundry?: unknown }).foundry = originalFoundry;
    delete (globalThis as { canvas?: unknown }).canvas;
  });

  it("buildChatRecipientsFromAward prefers actor.img", () => {
    const recipients = buildChatRecipientsFromAward([{ actorId: "pc1", xp: 50 }]);
    assert.equal(recipients[0]?.img, "actors/hero.png");
    assert.equal(recipients[0]?.name, "Theron <Bold>");
  });

  it("buildChatRecipientsFromAward uses prototype token before canvas scan", () => {
    const actor = mockActor({
      id: "pc2",
      name: "Aria",
      img: "",
      prototypeToken: { texture: { src: "prototypes/aria.png" } },
    });
    (globalThis as {
      game?: {
        actors: { get: (id: string) => Actor.Implementation | undefined };
        i18n: { localize: (key: string) => string; format: (key: string, data?: object) => string };
      };
    }).game = {
      actors: { get: (id: string) => (id === "pc2" ? actor : undefined) },
      i18n: {
        localize: (key: string) => key,
        format: (key: string) => key,
      },
    };

    const recipients = buildChatRecipientsFromAward([{ actorId: "pc2", xp: 25 }]);
    assert.equal(recipients[0]?.img, "prototypes/aria.png");
  });

  it("buildChatRecipientsFromAward uses tokenImages map when provided", () => {
    const tokenImages = new Map([["pc1", "tokens/custom.png"]]);
    const recipients = buildChatRecipientsFromAward(
      [{ actorId: "pc1", xp: 50 }],
      tokenImages
    );
    assert.equal(recipients[0]?.img, "tokens/custom.png");
  });

  it("buildXpAwardChatHtml uses plain escaped names without @UUID", () => {
    const html = buildXpAwardChatHtml({
      recipients: [
        {
          actorId: "pc1",
          name: "Theron <Bold>",
          img: "actors/hero.png",
          xp: 50,
          uuid: "Actor.pc1",
        },
      ],
      enemies: [],
      bonusXp: 0,
      totalXp: 50,
      individualXp: true,
      perMemberXp: 0,
    });

    assert.doesNotMatch(html, /@UUID/);
    assert.match(html, /Theron &lt;Bold&gt;/);
  });
});
