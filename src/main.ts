import { openXpAwardDialog } from "./app/XpAwardApp.js";
import { MODULE_ID } from "./constants.js";
import type { XpAwardApi } from "./foundry-augmentations.js";
import { registerSettings, showOnCombatEnd } from "./settings.js";
import {
  ensureChatLogListeners,
  injectChatMessageStyles,
  registerXpAwardChatHooks,
} from "./xp/xp-chat-log.js";

Hooks.once("init", () => {
  registerSettings();
  injectChatMessageStyles();
  registerXpAwardChatHooks();
});

Hooks.once("ready", () => {
  if (game.system?.id !== "dnd4e") {
    console.warn(
      `${MODULE_ID} | active only for the dnd4e system (current: ${game.system?.id ?? "none"})`
    );
    return;
  }

  ensureChatLogListeners();

  const mod = game.modules?.get(MODULE_ID);
  if (mod) {
    const api: XpAwardApi = {
      openXpAwardDialog: (opts) => openXpAwardDialog(opts),
    };
    mod.api = api;
  }

  console.log(`${MODULE_ID} | ready`);
});

Hooks.on("deleteCombat", (combat: Combat.Implementation) => {
  if (!game.user?.isGM) return;
  if (!combat.started) return;
  if (!showOnCombatEnd()) return;
  void openXpAwardDialog({ combat, mode: "auto" });
});

Hooks.on("getSceneControlButtons", (controls) => {
  if (!game.user?.isGM) return;
  if (game.system?.id !== "dnd4e") return;

  const tokenControls = controls.tokens;
  if (!tokenControls?.tools) return;

  tokenControls.tools.dnd4eXpAward = {
    name: "dnd4eXpAward",
    title: `${MODULE_ID}.sceneControl.title`,
    icon: "fa-solid fa-star",
    button: true,
    order: 998,
    visible: true,
    onChange: () => {
      void openXpAwardDialog({ mode: "manual" });
    },
  };
});
