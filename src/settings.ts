import { MODULE_ID, PARTY_SHEET_FOLDER_SETTING, PARTY_SHEET_MODULE_ID } from "./constants.js";
import { localize } from "./i18n.js";

export const SETTING_SHOW_ON_COMBAT_END = "showOnCombatEnd";
export const SETTING_INDIVIDUAL_XP = "individualXp";
export const SETTING_PARTY_FOLDER_NAME = "partyFolderName";

export function registerSettings(): void {
  game.settings?.register(MODULE_ID, SETTING_SHOW_ON_COMBAT_END, {
    name: localize(`${MODULE_ID}.settings.showOnCombatEnd.name`),
    hint: localize(`${MODULE_ID}.settings.showOnCombatEnd.hint`),
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
  });

  game.settings?.register(MODULE_ID, SETTING_INDIVIDUAL_XP, {
    name: localize(`${MODULE_ID}.settings.individualXp.name`),
    hint: localize(`${MODULE_ID}.settings.individualXp.hint`),
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
  });

  game.settings?.register(MODULE_ID, SETTING_PARTY_FOLDER_NAME, {
    name: localize(`${MODULE_ID}.settings.partyFolderName.name`),
    hint: localize(`${MODULE_ID}.settings.partyFolderName.hint`),
    scope: "world",
    config: true,
    type: String,
    default: "Party",
  });
}

export function showOnCombatEnd(): boolean {
  return Boolean(game.settings?.get(MODULE_ID, SETTING_SHOW_ON_COMBAT_END));
}

export function isIndividualXpEnabled(): boolean {
  return Boolean(game.settings?.get(MODULE_ID, SETTING_INDIVIDUAL_XP));
}

export function getPartyFolderName(): string {
  const partySheet = game.modules?.get(PARTY_SHEET_MODULE_ID);
  if (partySheet?.active) {
    const name = game.settings?.get(PARTY_SHEET_MODULE_ID, PARTY_SHEET_FOLDER_SETTING);
    if (typeof name === "string" && name.trim()) return name;
  }
  return String(game.settings?.get(MODULE_ID, SETTING_PARTY_FOLDER_NAME) ?? "Party");
}
