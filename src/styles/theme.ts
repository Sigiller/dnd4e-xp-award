export const xpAwardTheme = {
  colourPcHead: "#193d5e",
  gradient4e: "linear-gradient(270deg, rgba(255, 255, 255, 1) 0%, rgba(221, 220, 203, 1) 100%)",
  backgroundRowOdd: "#d3d1ba",
  backgroundRowEven: "#dddcdb",
  backgroundPanel: "#fafaf7",
  borderMuted: "#b8b5a0",
  shadowCard: "0 2px 8px rgba(0, 0, 0, 0.08)",
  radiusPanel: "6px",
  radiusCard: "8px",
  radiusControl: "3px",
  spacingGutter: "12px",
  spacingCardPad: "16px",
  colourTextInside: "#484a3d",
  colourTextOnLight: "#221f1f",
  colourHeading: "#193d5e",
  colourAccentOnLight: "#6b5620",
  colourTextOnDark: "#ffffff",
  fontFamily: '"DragonBodySans", system-ui, sans-serif',
} as const;

export type XpAwardTheme = typeof xpAwardTheme;
