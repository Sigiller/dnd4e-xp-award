import type { XpEntry } from "./xp/xp-calculator.js";

export interface XpChatRecipient {
  actorId: string;
  name: string;
  img: string;
  xp: number;
  uuid?: string;
}

export interface XpAwardChatFlag {
  recipients: XpChatRecipient[];
  enemies: XpEntry[];
  bonusXp: number;
  totalXp: number;
  individualXp: boolean;
  perMemberXp: number;
  reverted: boolean;
}

export interface OpenXpAwardOptions {
  combat?: Combat.Implementation;
  mode?: "auto" | "manual";
}

export interface XpAwardApi {
  openXpAwardDialog: (options?: OpenXpAwardOptions) => Promise<void>;
}

declare global {
  interface CONFIG {
    DND4E: {
      creatureRole: Record<string, { label?: string }>;
      creatureRoleSecond: Record<string, { label?: string }>;
      skills: Record<string, { label?: string }>;
    };
  }
}

declare module "fvtt-types/configuration" {
  export interface ModuleConfig {
    "dnd4e-xp-award": {
      api?: XpAwardApi;
    };
  }

  export interface SettingConfig {
    "dnd4e-xp-award.showOnCombatEnd": boolean;
    "dnd4e-xp-award.individualXp": boolean;
    "dnd4e-xp-award.partyFolderName": string;
    "dnd4e-party-sheet.partyFolderName": string;
  }

  export interface FlagConfig {
    Actor: {
      dnd4e: {
        originalActor?: string;
      };
    };
    ChatMessage: {
      "dnd4e-xp-award": {
        award?: XpAwardChatFlag;
      };
    };
  }
}

export {};
