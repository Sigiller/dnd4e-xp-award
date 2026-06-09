import { useEffect, type RefObject } from "react";
import { createEnemyEntryFromActor } from "../../xp/actor-presentation.js";
import { resolvePolymorphedActor } from "../../xp/actor-xp.js";
import type { XpEntry } from "../../xp/xp-calculator.js";

function getDragData(event: DragEvent): Record<string, unknown> | null {
  const TextEditor = foundry.applications.ux.TextEditor;
  return (
    TextEditor.getDragEventData?.(event) ??
    TextEditor.implementation?.getDragEventData?.(event) ??
    null
  );
}

function isActorDropData(data: Record<string, unknown> | null): boolean {
  if (!data) return false;
  if (data.type === "Actor") return true;

  const uuid = typeof data.uuid === "string" ? data.uuid : "";
  return /^Compendium\.[^.]+\.[^.]+\.Actor\./.test(uuid) || uuid.startsWith("Actor.");
}

export function useActorDragDrop(
  zoneRef: RefObject<HTMLElement | null>,
  onEnemyDropped: (entry: XpEntry) => void
): void {
  useEffect(() => {
    const el = zoneRef.current;
    if (!el || !game.user?.isGM) return;

    const dragDrop = new foundry.applications.ux.DragDrop({
      dragSelector: null,
      dropSelector: ".xp-enemy-drop-target",
      permissions: {
        dragstart: () => false,
        drop: () => true,
      },
      callbacks: {
        dragover: (event: DragEvent) => {
          const data = getDragData(event);
          if (isActorDropData(data)) {
            event.preventDefault();
            if (event.dataTransfer) event.dataTransfer.dropEffect = "copy";
            el.classList.add("drag-over");
          }
        },
        dragleave: () => {
          el.classList.remove("drag-over");
        },
        drop: async (event: DragEvent) => {
          event.preventDefault();
          event.stopPropagation();
          el.classList.remove("drag-over");

          const data = getDragData(event);
          if (!isActorDropData(data) || typeof data?.uuid !== "string") return;

          const doc = await fromUuid(data.uuid);
          if (!doc || !("system" in doc)) return;

          const actor = resolvePolymorphedActor(doc as import("../../foundry-globals.js").Actor);
          onEnemyDropped(createEnemyEntryFromActor(actor));
        },
      },
    });

    dragDrop.bind(el);
  }, [zoneRef, onEnemyDropped]);
}
