import { MODULE_ID, XP_AWARD_FLAG } from "../constants.js";
import { getActorTokenImage } from "./actor-presentation.js";
import { xpAwardTheme } from "../styles/theme.js";
import { revertXpRewards } from "./actor-xp.js";
import type { XpEntry } from "./xp-calculator.js";

const CHAT_STYLE_ID = "dnd4e-xp-award-chat-styles";

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

export interface XpAwardChatBuildOptions {
  recipients: XpChatRecipient[];
  enemies: XpEntry[];
  bonusXp: number;
  totalXp: number;
  individualXp: boolean;
  perMemberXp: number;
}

/** Inject chat card CSS once (chat log is outside the ApplicationV2 tree). */
export function injectChatMessageStyles(): void {
  if (document.getElementById(CHAT_STYLE_ID)) return;
  const t = xpAwardTheme;
  const style = document.createElement("style");
  style.id = CHAT_STYLE_ID;
  style.textContent = `
    .dnd4e-xp-award-chat.card {
      background: ${t.backgroundPanel};
      border: 1px solid ${t.borderMuted};
      border-radius: ${t.radiusPanel};
      padding: 8px 0;
      color: ${t.colourTextOnLight};
      overflow: hidden;
    }
    .dnd4e-xp-award-chat .xp-award-chat-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 6px;
      padding: 0 10px 6px 10px;
    }
    .dnd4e-xp-award-chat .xp-award-chat-title {
      margin: 0;
      color: ${t.colourHeading};
      font-size: 0.95rem;
      flex: 1;
      min-width: 0;
    }
    .dnd4e-xp-award-chat .xp-award-revert {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      max-width: 24px;
      max-height: 24px;
      padding: 0;
      flex-shrink: 0;
      border-radius: ${t.radiusControl};
      background: ${t.backgroundRowOdd};
      border: 1px solid ${t.borderMuted};
      cursor: pointer;
      color: ${t.colourTextInside};
      line-height: 1;
      box-sizing: border-box;
    }
    .dnd4e-xp-award-chat .xp-award-revert:hover {
      color: ${t.colourHeading};
      background: ${t.backgroundRowEven};
    }
    .dnd4e-xp-award-chat .xp-award-revert i {
      font-size: 0.72rem;
      pointer-events: none;
    }
    .dnd4e-xp-award-chat.xp-award-reverted .xp-award-chat-body {
      text-decoration: line-through;
      opacity: 0.6;
    }
    .dnd4e-xp-award-chat .xp-award-chat-body {
      padding: 0 10px 2px 10px;
    }
    .dnd4e-xp-award-chat .xp-award-summary-line {
      font-size: 0.85rem;
      color: ${t.colourTextInside};
      margin-bottom: 4px;
    }
    .dnd4e-xp-award-chat .xp-award-recipients-heading {
      margin: 8px 0 4px 0;
      font-size: 0.85rem;
      color: ${t.colourHeading};
    }
    .dnd4e-xp-award-chat .xp-award-recipients {
      display: flex;
      flex-direction: column;
      gap: 2px;
      margin: 0;
      padding: 0;
    }
    .dnd4e-xp-award-chat .xp-award-recipient-row {
      display: flex;
      align-items: center;
      gap: 8px;
      min-height: 40px;
      padding: 2px 10px 2px 0;
    }
    .dnd4e-xp-award-chat .xp-award-token {
      width: 36px;
      height: 36px;
      flex-shrink: 0;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid ${t.borderMuted};
      box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.15);
      background: ${t.backgroundRowEven};
    }
    .dnd4e-xp-award-chat .xp-award-recipient-text {
      flex: 1;
      min-width: 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .dnd4e-xp-award-chat .xp-award-recipient-name {
      font-weight: 600;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .dnd4e-xp-award-chat .xp-award-recipient-xp {
      font-weight: 700;
      color: ${t.colourHeading};
      white-space: nowrap;
      flex-shrink: 0;
    }
  `;
  document.head.appendChild(style);
}

async function enrichChatHtml(html: string): Promise<string> {
  const TextEditor = foundry.applications.ux.TextEditor as {
    enrichHTML?: (content: string, options?: object) => Promise<string>;
    implementation?: { enrichHTML?: (content: string, options?: object) => Promise<string> };
  };
  const enrich = TextEditor.implementation?.enrichHTML ?? TextEditor.enrichHTML;
  if (typeof enrich === "function") {
    return enrich(html, { async: true, secrets: false });
  }
  return html;
}

function escapeHtml(value: string): string {
  return foundry.utils.escapeHTML(value);
}

function formatActorName(recipient: XpChatRecipient): string {
  if (recipient.uuid) {
    return `@UUID[${recipient.uuid}]{${recipient.name}}`;
  }
  return escapeHtml(recipient.name);
}

function buildRecipientRows(recipients: XpChatRecipient[]): string {
  return recipients
    .map((r) => {
      const name = formatActorName(r);
      const img = escapeHtml(r.img || "icons/svg/mystery-man.svg");
      return `<div class="xp-award-recipient-row">
        <img class="xp-award-token" src="${img}" alt="" width="36" height="36" />
        <div class="xp-award-recipient-text">
          <span class="xp-award-recipient-name">${name}</span>
          <span class="xp-award-recipient-xp">+${r.xp} XP</span>
        </div>
      </div>`;
    })
    .join("");
}

function buildRecipientsSection(options: XpAwardChatBuildOptions): string {
  if (!options.individualXp) return "";

  const recipientsLabel = game.i18n.localize(`${MODULE_ID}.chat.recipients`);
  return `<h4 class="xp-award-recipients-heading">${escapeHtml(recipientsLabel)}</h4>
    <div class="xp-award-recipients">${buildRecipientRows(options.recipients)}</div>`;
}

function buildSummary(options: XpAwardChatBuildOptions): string {
  const parts: string[] = [];

  if (!options.individualXp && options.perMemberXp > 0) {
    parts.push(
      game.i18n.format(`${MODULE_ID}.chat.perMemberAward`, {
        xp: options.perMemberXp,
        count: options.recipients.length,
      })
    );
  }

  parts.push(
    game.i18n.format(`${MODULE_ID}.chat.totalSummary`, { xp: options.totalXp })
  );

  return parts.map((p) => `<div class="xp-award-summary-line">${escapeHtml(p)}</div>`).join("");
}

export function buildXpAwardChatHtml(
  options: XpAwardChatBuildOptions,
  reverted = false
): string {
  const title = reverted
    ? game.i18n.localize(`${MODULE_ID}.chat.titleReverted`)
    : game.i18n.localize(`${MODULE_ID}.chat.title`);
  const revertTitle = escapeHtml(game.i18n.localize(`${MODULE_ID}.chat.revert`));
  const revertedClass = reverted ? " xp-award-reverted" : "";
  const revertButton = reverted
    ? ""
    : `<button type="button" class="xp-award-revert gm-only" data-action="revert-xp" data-tooltip="${revertTitle}" aria-label="${revertTitle}">
        <i class="fas fa-rotate-left"></i>
      </button>`;

  return `<div class="dnd4e-xp-award-chat card${revertedClass}">
  <header class="xp-award-chat-header flexrow">
    <h3 class="xp-award-chat-title">${escapeHtml(title)}</h3>
    ${revertButton}
  </header>
  <div class="xp-award-chat-body">
    ${buildSummary(options)}
    ${buildRecipientsSection(options)}
  </div>
</div>`;
}

export function getXpAwardFlag(message: ChatMessageDoc): XpAwardChatFlag | null {
  const data = message.getFlag(MODULE_ID, XP_AWARD_FLAG) as XpAwardChatFlag | undefined;
  if (!data?.recipients) return null;
  return {
    ...data,
    individualXp: Boolean(data.individualXp),
    perMemberXp: Math.floor(Number(data.perMemberXp ?? 0)),
  };
}

function toBuildOptions(flag: XpAwardChatFlag): XpAwardChatBuildOptions {
  return {
    recipients: flag.recipients,
    enemies: flag.enemies,
    bonusXp: flag.bonusXp,
    totalXp: flag.totalXp,
    individualXp: flag.individualXp,
    perMemberXp: flag.perMemberXp,
  };
}

export function buildChatRecipientsFromAward(
  valid: Array<{ actorId: string; xp: number }>
): XpChatRecipient[] {
  return valid.map((entry) => {
    const actor = game.actors.get(entry.actorId);
    return {
      actorId: entry.actorId,
      name: actor?.name ?? entry.actorId,
      img: actor ? getActorTokenImage(actor) : "icons/svg/mystery-man.svg",
      xp: entry.xp,
      uuid: actor?.uuid,
    };
  });
}

export async function postXpAwardChatMessage(options: {
  recipients: XpChatRecipient[];
  enemies: XpEntry[];
  bonusXp: number;
  totalXp: number;
  individualXp: boolean;
  perMemberXp: number;
}): Promise<void> {
  const user = game.user;
  if (!user?.isGM) return;

  const buildOptions: XpAwardChatBuildOptions = {
    recipients: options.recipients,
    enemies: options.enemies,
    bonusXp: options.bonusXp,
    totalXp: options.totalXp,
    individualXp: options.individualXp,
    perMemberXp: options.perMemberXp,
  };

  const flag: XpAwardChatFlag = {
    ...buildOptions,
    reverted: false,
  };

  const html = buildXpAwardChatHtml(buildOptions, false);
  const content = await enrichChatHtml(html);

  await ChatMessage.create({
    user: user.id,
    speaker: ChatMessage.getSpeaker(),
    content,
    flags: { [MODULE_ID]: { [XP_AWARD_FLAG]: flag } },
  });
}

export async function revertXpAwardMessage(message: ChatMessageDoc): Promise<boolean> {
  if (!game.user?.isGM) return false;

  const flag = getXpAwardFlag(message);
  if (!flag || flag.reverted) return false;

  const confirmed = await foundry.applications.api.Dialog.confirm({
    window: { title: game.i18n.localize(`${MODULE_ID}.chat.revertConfirmTitle`) },
    content: game.i18n.localize(`${MODULE_ID}.chat.revertConfirmContent`),
    yes: { default: true },
  });
  if (!confirmed) return false;

  const count = await revertXpRewards(flag.recipients);
  const nextFlag: XpAwardChatFlag = { ...flag, reverted: true };
  const html = buildXpAwardChatHtml(toBuildOptions(nextFlag), true);
  const content = await enrichChatHtml(html);

  await message.update({
    content,
    [`flags.${MODULE_ID}.${XP_AWARD_FLAG}`]: nextFlag,
  });

  if (count > 0) {
    ui.notifications?.info(
      game.i18n.format(`${MODULE_ID}.chat.revertedSummary`, { count })
    );
  }
  return true;
}

const CHAT_LOG_BOUND = "dnd4eXpAwardChatBound";
let documentClickBound = false;

function ensureDocumentClickListener(): void {
  if (documentClickBound) return;
  documentClickBound = true;
  document.addEventListener("click", onChatLogClick, true);
}

export function ensureChatLogListeners(): void {
  ensureDocumentClickListener();
  const chatAppEl = ui.chat?.element;
  if (chatAppEl instanceof HTMLElement) {
    bindChatLogListeners(chatAppEl);
  }
  const chatLog =
    document.querySelector("#chat .chat-log") ??
    document.querySelector("#chat-notification .chat-log");
  if (chatLog instanceof HTMLElement) {
    bindChatLogListeners(chatLog);
  }
}

function onChatLogClick(event: Event): void {
  if (!game.user?.isGM) return;

  const target = event.target as Element | null;
  const btn = target?.closest('[data-action="revert-xp"]');
  if (!btn) return;

  const messageEl =
    btn.closest("[data-message-id]") ??
    btn.closest(".chat-message[data-document-id]") ??
    btn.closest("[data-document-id].message") ??
    btn.closest(".message[data-document-id]");
  const messageId =
    messageEl?.getAttribute("data-message-id") ??
    messageEl?.getAttribute("data-document-id");
  if (!messageId) return;

  const message = game.messages.get(messageId) as ChatMessageDoc | undefined;
  if (!message) return;

  const flag = getXpAwardFlag(message);
  if (!flag || flag.reverted) return;

  event.preventDefault();
  event.stopPropagation();
  void revertXpAwardMessage(message);
}

function bindChatLogListeners(element: HTMLElement): void {
  if (element.dataset[CHAT_LOG_BOUND]) return;
  element.dataset[CHAT_LOG_BOUND] = "1";
  element.addEventListener("click", onChatLogClick);
}

function decorateXpAwardMessage(message: ChatMessageDoc, html: HTMLElement): void {
  const card = html.querySelector(".dnd4e-xp-award-chat");
  if (!card) return;

  const flag = getXpAwardFlag(message);
  if (!flag) return;

  if (!game.user?.isGM) {
    html.querySelectorAll(".gm-only").forEach((el) => el.remove());
    return;
  }

  if (flag.reverted) {
    card.classList.add("xp-award-reverted");
  }
}

export function registerXpAwardChatHooks(): void {
  ensureDocumentClickListener();

  Hooks.on("renderChatLog", (_app: unknown, element: HTMLElement) => {
    bindChatLogListeners(element);
  });

  Hooks.on("renderChatPopout", (_app: unknown, element: HTMLElement) => {
    bindChatLogListeners(element);
  });

  Hooks.on("renderChatMessageHTML", (message: ChatMessageDoc, html: HTMLElement) => {
    decorateXpAwardMessage(message, html);
  });
}

interface ChatMessageDoc {
  id: string;
  content: string;
  getFlag: (scope: string, key: string) => unknown;
  update: (data: object) => Promise<unknown>;
}
