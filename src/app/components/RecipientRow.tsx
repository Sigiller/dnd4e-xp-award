import type { ActorPresentation } from "../../xp/actor-presentation.js";
import {
  ActorName,
  ActorRow,
  ActorSubtitle,
  ActorText,
  Portrait,
  XpInput,
} from "./XpAward.styles.js";

interface RecipientRowProps {
  presentation: ActorPresentation;
  xp: number;
  onXpChange: (xp: number) => void;
}

export function RecipientRow({ presentation, xp, onXpChange }: RecipientRowProps) {
  return (
    <ActorRow>
      <Portrait src={presentation.img} alt="" />
      <ActorText>
        <ActorName>{presentation.name}</ActorName>
        {presentation.subtitle ? <ActorSubtitle>{presentation.subtitle}</ActorSubtitle> : null}
      </ActorText>
      <XpInput
        value={xp}
        onChange={(e) => onXpChange(Math.max(0, parseInt(e.target.value, 10) || 0))}
      />
    </ActorRow>
  );
}
