import { MODULE_ID } from "../constants.js";
import { isIndividualXpEnabled } from "../settings.js";
import {
  buildXpAwardState,
  getCombatTokenImages,
  type XpAwardMode,
} from "../xp/combat-context.js";
import type { Combat } from "../foundry-globals.js";
import { mountXpAward, unmountXpAward } from "./mount.js";

const { ApplicationV2 } = foundry.applications.api;

let activeApp: XpAwardApp | null = null;

function measureDialogHeight(app: XpAwardApp): number {
  const element = app.element;
  if (!element) return 400;

  const windowContent = element.querySelector(".window-content");
  const inner = element.querySelector(".xp-award-inner");
  if (!(windowContent instanceof HTMLElement) || !(inner instanceof HTMLElement)) {
    return 400;
  }

  const frameHeight = element.clientHeight - windowContent.clientHeight;
  return frameHeight + inner.scrollHeight;
}

export class XpAwardApp extends ApplicationV2 {
  #combat?: Combat;
  #mode: XpAwardMode;

  constructor(options: { combat?: Combat; mode: XpAwardMode }) {
    super();
    this.#combat = options.combat;
    this.#mode = options.mode;
  }

  static DEFAULT_OPTIONS = {
    id: "dnd4e-xp-award-app",
    classes: ["dnd4e-xp-award", "sheet", "fox4e", "dnd4e"],
    tag: "div",
    window: {
      title: `${MODULE_ID}.dialog.title`,
      icon: "fas fa-star",
      resizable: true,
    },
    position: {
      width: 520,
    },
    scrollY: [".actor-list", ".xp-award-recipients-list"],
  };

  async _prepareContext(): Promise<object> {
    return {};
  }

  async _renderHTML(_context: object, _options: unknown): Promise<HTMLElement> {
    const root = document.createElement("div");
    root.className = "xp-award-react-root";
    return root;
  }

  async _replaceHTML(result: HTMLElement, content: HTMLElement, _options: unknown): Promise<void> {
    const existing = content.querySelector(":scope > .xp-award-react-root");
    if (existing instanceof HTMLElement) return;
    content.replaceChildren(result);
  }

  async _onRender(_context: object, options: unknown): Promise<void> {
    await super._onRender(_context, options);
    const root = this.element?.querySelector(".xp-award-react-root");
    if (!(root instanceof HTMLElement)) return;

    const initialState = buildXpAwardState({
      combat: this.#combat,
      mode: this.#mode,
    });
    const tokenImages = this.#combat ? getCombatTokenImages(this.#combat) : undefined;

    const individualXp = isIndividualXpEnabled();

    mountXpAward(root, {
      initialState,
      individualXp,
      mode: this.#mode,
      tokenImages,
      onClose: () => {
        void this.close();
      },
      onLayoutChange: () => {
        void this.fitToContent();
      },
    });

    requestAnimationFrame(() => {
      void this.fitToContent();
    });
  }

  async fitToContent(): Promise<void> {
    await this.setPosition({ height: measureDialogHeight(this) });
  }

  async _onClose(options: unknown): Promise<void> {
    unmountXpAward();
    if (activeApp === this) activeApp = null;
    await super._onClose(options);
  }
}

export async function openXpAwardDialog(options?: {
  combat?: Combat;
  mode?: XpAwardMode;
}): Promise<void> {
  if (game.system?.id !== "dnd4e") return;
  if (!game.user?.isGM) return;

  const mode = options?.mode ?? (options?.combat ? "auto" : "manual");

  if (activeApp?.rendered) {
    activeApp.bringToFront?.();
    return;
  }

  activeApp = new XpAwardApp({ combat: options?.combat, mode });
  await activeApp.render(true);
}
