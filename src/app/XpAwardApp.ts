import { MODULE_ID } from "../constants.js";
import { isIndividualXpEnabled } from "../settings.js";
import {
  buildXpAwardState,
  getCombatTokenImages,
  type XpAwardMode,
} from "../xp/combat-context.js";
import { mountXpAward, unmountXpAward } from "./mount.js";

const { ApplicationV2 } = foundry.applications.api;

let activeApp: XpAwardApp | null = null;

function measureDialogHeight(app: XpAwardApp): number {
  const element = app.element;
  if (element == null) return 400;

  const windowContent = element.querySelector(".window-content");
  const inner = element.querySelector(".xp-award-inner");
  if (!(windowContent instanceof HTMLElement) || !(inner instanceof HTMLElement)) {
    return 400;
  }

  const frameHeight = element.clientHeight - windowContent.clientHeight;
  return frameHeight + inner.scrollHeight;
}

export class XpAwardApp extends ApplicationV2 {
  #combat?: Combat.Implementation;
  #mode: XpAwardMode;

  constructor(options: { combat?: Combat.Implementation; mode: XpAwardMode }) {
    super();
    this.#combat = options.combat;
    this.#mode = options.mode;
  }

  static override DEFAULT_OPTIONS = {
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

  protected override async _prepareContext(): Promise<object> {
    return {};
  }

  protected override async _renderHTML(_context: object, _options: unknown): Promise<HTMLElement> {
    const root = document.createElement("div");
    root.className = "xp-award-react-root";
    return root;
  }

  protected override async _replaceHTML(
    result: HTMLElement,
    content: HTMLElement,
    _options: unknown
  ): Promise<void> {
    const existing = content.querySelector(":scope > .xp-award-react-root");
    if (existing instanceof HTMLElement) return;
    content.replaceChildren(result);
  }

  protected override async _onRender(_context: object, options: unknown): Promise<void> {
    // fvtt-types merges ApplicationV2 render options on the class, not as an importable alias here.
    // @ts-expect-error ApplicationV2._onRender accepts DeepPartial render options at runtime.
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
    this.setPosition({ height: measureDialogHeight(this) });
  }

  protected override async _onClose(options: unknown): Promise<void> {
    unmountXpAward();
    if (activeApp === this) activeApp = null;
    // @ts-expect-error ApplicationV2._onClose accepts DeepPartial render options at runtime.
    await super._onClose(options);
  }
}

export async function openXpAwardDialog(options?: {
  combat?: Combat.Implementation;
  mode?: XpAwardMode;
}): Promise<void> {
  if (game.system?.id !== "dnd4e") return;
  if (!game.user?.isGM) return;

  const mode = options?.mode ?? (options?.combat ? "auto" : "manual");

  if (activeApp?.rendered) {
    activeApp.bringToFront();
    return;
  }

  activeApp = new XpAwardApp({ combat: options?.combat, mode });
  await activeApp.render(true);
}
