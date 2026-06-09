import "styled-components";
import type { XpAwardTheme } from "./theme.js";

declare module "styled-components" {
  export interface DefaultTheme extends XpAwardTheme {}
}
