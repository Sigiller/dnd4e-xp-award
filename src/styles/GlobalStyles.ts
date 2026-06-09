import { createGlobalStyle } from "styled-components";
import { xpAwardTheme as t } from "./theme.js";

export const GlobalStyles = createGlobalStyle`
  .application.dnd4e-xp-award.sheet.fox4e {
    --gradient-4e: ${t.gradient4e};
    --background-row-odd: ${t.backgroundRowOdd};
    --background-row-even: ${t.backgroundRowEven};
    --background-panel: ${t.backgroundPanel};
    --border-muted: ${t.borderMuted};
    --background-other: ${t.colourPcHead};
  }

  .application.dnd4e-xp-award {
    --colour-pc-head: ${t.colourPcHead};
    --gradient-4e: ${t.gradient4e};
    --background-panel: ${t.backgroundPanel};
    --border-muted: ${t.borderMuted};
    font-family: ${t.fontFamily};

    .window-content,
    .xp-award-react-root,
    .xp-award-inner {
      color: ${t.colourTextOnLight};
    }

    .window-content {
      padding: 0;
      overflow: auto;
      display: block;
      height: auto;
    }

    .xp-award-react-root {
      display: block;
      height: auto;
      overflow: auto;
      background: ${t.gradient4e};
    }

    .xp-award-inner {
      overflow: auto;
    }
  }

`;
