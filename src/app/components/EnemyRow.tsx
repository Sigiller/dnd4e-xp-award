import type { ActorPresentation } from "../../xp/actor-presentation.js";
import {
  ActorName,
  ActorRow,
  ActorSubtitle,
  ActorText,
  CountInput,
  EnemyValueGroup,
  IconButton,
  MultiplySign,
  Portrait,
  XpInput,
} from "./XpAward.styles.js";

interface EnemyRowProps {
  presentation: ActorPresentation;
  count: number;
  xp: number;
  onCountChange: (count: number) => void;
  onXpChange: (xp: number) => void;
  onRemove: () => void;
}

export function EnemyRow({
  presentation,
  count,
  xp,
  onCountChange,
  onXpChange,
  onRemove,
}: EnemyRowProps) {
  return (
    <ActorRow>
      <Portrait src={presentation.img} alt="" />
      <ActorText>
        <ActorName>{presentation.name}</ActorName>
        {presentation.subtitle ? <ActorSubtitle>{presentation.subtitle}</ActorSubtitle> : null}
      </ActorText>
      <EnemyValueGroup>
        <CountInput
          value={count}
          onChange={(e) => onCountChange(Math.max(1, parseInt(e.target.value, 10) || 1))}
        />
        <MultiplySign aria-hidden="true">×</MultiplySign>
        <XpInput
          value={xp}
          onChange={(e) => onXpChange(Math.max(0, parseInt(e.target.value, 10) || 0))}
        />
      </EnemyValueGroup>
      <IconButton type="button" title="Remove" onClick={onRemove}>
        <i className="fas fa-trash" />
      </IconButton>
    </ActorRow>
  );
}
