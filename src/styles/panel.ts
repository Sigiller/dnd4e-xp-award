import type { XpAwardTheme } from "./theme.js";

export function panelSurface(t: XpAwardTheme): string {
  return `
    background: ${t.backgroundPanel};
    border: 1px solid ${t.borderMuted};
    border-radius: ${t.radiusPanel};
    box-shadow: ${t.shadowCard};
  `;
}
