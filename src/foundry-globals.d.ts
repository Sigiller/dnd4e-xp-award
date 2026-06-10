/* Minimal Foundry globals for module build */
declare const game: Game;
declare const Hooks: typeof Hooks;
declare const CONFIG: Record<string, unknown> & { DND4E: Dnd4eConfig; specialStatusEffects?: { DEFEATED?: string } };
declare const CONST: typeof CONST;
declare const foundry: typeof foundry & {
  applications: {
    api: {
      ApplicationV2: new (...args: unknown[]) => ApplicationV2Instance;
      Dialog: {
        confirm: (config: object) => Promise<boolean>;
      };
    };
    ux: {
      TextEditor: {
        getDragEventData?: (event: DragEvent) => Record<string, unknown> | null;
        implementation?: {
          getDragEventData?: (event: DragEvent) => Record<string, unknown> | null;
        };
      };
      DragDrop: new (config: object) => { bind: (el: HTMLElement) => void };
    };
  };
  utils: {
    deepClone: <T>(obj: T) => T;
    escapeHTML: (str: string) => string;
  };
};
declare const Folder: typeof Folder;
declare const fromUuid: (uuid: string) => Promise<Actor | null>;

interface Dnd4eConfig {
  creatureRole: Record<string, { label?: string }>;
  creatureRoleSecond: Record<string, { label?: string }>;
}

interface Game {
  actors: Collection<Actor>;
  folders: Collection<Folder>;
  messages: Collection<ChatMessageDocument>;
  users: Collection<User>;
  user: User | null;
  combats: Collection<Combat>;
  i18n: { localize: (key: string) => string; format: (key: string, data?: object) => string };
  settings: {
    register: (module: string, key: string, data: object) => void;
    get: (module: string, key: string) => unknown;
  };
  modules: Collection<{ id: string; active?: boolean; api?: XpAwardApi }>;
  system: { id: string } | null;
}

interface XpAwardApi {
  openXpAwardDialog: (options?: OpenXpAwardOptions) => Promise<void>;
}

interface OpenXpAwardOptions {
  combat?: Combat;
  mode?: "auto" | "manual";
}

interface User {
  id: string;
  name: string;
  isGM: boolean;
  active: boolean;
  role: number;
  character?: Actor | null;
}

interface Collection<T> {
  get(id: string): T | undefined;
  contents: T[];
  find: (predicate: (doc: T) => boolean) => T | undefined;
  filter: (predicate: (doc: T) => boolean) => T[];
}

interface CanvasToken {
  actor?: Actor | null;
  texture?: { src?: string };
  document?: { texture?: { src?: string }; isLinked?: boolean };
}

declare const canvas: { tokens?: { placeables?: CanvasToken[] } } | undefined;

declare const Actor: {
  updateDocuments: (
    updates: Array<{ _id: string } & Record<string, unknown>>,
    options?: { render?: boolean }
  ) => Promise<Actor[]>;
};

interface ActorUpdateOptions {
  render?: boolean;
}

interface Actor {
  id: string;
  uuid?: string;
  name: string;
  img: string;
  prototypeToken?: { texture?: { src?: string }; img?: string };
  type: string;
  folder: string | { id: string } | null;
  ownership: Record<string, number>;
  flags: Record<string, Record<string, unknown>>;
  system: Record<string, unknown>;
  combatant?: Combatant | null;
  statuses?: Set<string>;
  isPolymorphed?: boolean;
  getFlag: (scope: string, key: string) => unknown;
  testUserPermission: (user: User, level: number, options?: object) => boolean;
  update: (data: object, options?: ActorUpdateOptions) => Promise<Actor>;
}

interface Combat {
  id: string;
  started: boolean;
  combatants: Combatant[];
}

interface Combatant {
  id: string;
  actor: Actor | null;
  token: TokenDocument | null;
  defeated: boolean;
}

interface TokenDocument {
  disposition: number;
  texture?: { src?: string };
  document?: TokenDocument;
}

interface Folder {
  id: string;
  name: string;
  type: string;
}

interface ApplicationV2Instance {
  render: (options?: boolean | { force?: boolean }) => Promise<void>;
  close: (options?: object) => Promise<void>;
  bringToFront?: () => void;
  setPosition: (position: { width?: number; height?: number; top?: number; left?: number }) => Promise<void>;
  rendered: boolean;
}

declare const ui: {
  notifications?: { warn: (msg: string, opts?: object) => void; info: (msg: string, opts?: object) => void };
  chat?: { element?: HTMLElement };
};

declare namespace Hooks {
  function once(event: string, fn: (...args: unknown[]) => void): void;
  function on(event: string, fn: (...args: unknown[]) => void): number;
}

declare const ChatMessage: {
  create: (data: object) => Promise<ChatMessageDocument>;
  getSpeaker: (options?: { actor?: Actor }) => object;
};

interface ChatMessageDocument {
  id: string;
  content: string;
  getFlag: (scope: string, key: string) => unknown;
  setFlag: (scope: string, key: string, value: unknown) => Promise<unknown>;
  update: (data: object) => Promise<unknown>;
}

declare namespace CONST {
  const TOKEN_DISPOSITIONS: { HOSTILE: number; FRIENDLY: number };
  const USER_ROLES: { PLAYER: number; TRUSTED: number };
  const DOCUMENT_OWNERSHIP_LEVELS: { NONE: number; OWNER: number };
}
