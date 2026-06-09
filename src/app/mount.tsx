import { createRoot, type Root } from "react-dom/client";
import { ThemeProvider } from "styled-components";
import { GlobalStyles } from "../styles/GlobalStyles.js";
import { xpAwardTheme } from "../styles/theme.js";
import { XpAwardRoot, type XpAwardProps } from "./XpAwardRoot.js";

let host: HTMLElement | null = null;
let root: Root | null = null;

export function mountXpAward(element: HTMLElement, props: XpAwardProps): void {
  if (host !== element) {
    unmountXpAward();
    host = element;
    root = createRoot(element);
    root.render(
      <ThemeProvider theme={xpAwardTheme}>
        <GlobalStyles />
        <XpAwardRoot {...props} />
      </ThemeProvider>
    );
    return;
  }
  root?.render(
    <ThemeProvider theme={xpAwardTheme}>
      <GlobalStyles />
      <XpAwardRoot {...props} />
    </ThemeProvider>
  );
}

export function unmountXpAward(): void {
  root?.unmount();
  root = null;
  host = null;
}
