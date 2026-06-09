import styled, { css } from "styled-components";
import { panelSurface } from "../../styles/panel.js";

/** Enemy row: 40px portrait + 12px vertical padding; gap 6px between rows. */
export const ENEMY_ROW_HEIGHT = 52;
export const ENEMY_ROW_GAP = 6;
export const ENEMY_VISIBLE_ROWS = 5;
export const ENEMY_LIST_MAX_HEIGHT = `${
  ENEMY_VISIBLE_ROWS * ENEMY_ROW_HEIGHT + (ENEMY_VISIBLE_ROWS - 1) * ENEMY_ROW_GAP
}px`;

export const XpAwardInner = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${(p) => p.theme.spacingCardPad};
  gap: ${(p) => p.theme.spacingGutter};
`;

export const Section = styled.section<{ $grow?: boolean; $disabled?: boolean }>`
  ${(p) => panelSurface(p.theme)}
  padding: ${(p) => p.theme.spacingGutter};
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 0;
  flex-shrink: 0;

  ${(p) =>
    p.$disabled &&
    css`
      opacity: 0.55;
    `}

  ${(p) =>
    p.$grow &&
    css`
      flex: 1 1 auto;
      min-height: 0;
      overflow: auto;
    `}
`;

export const SectionHeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

export const SectionCheckbox = styled.input.attrs({ type: "checkbox" })`
  width: 16px;
  height: 16px;
  margin: 0;
  flex-shrink: 0;
  cursor: pointer;
`;

export const SkillChallengeSectionRoot = styled(Section)`
  position: relative;
`;

export const SkillChallengeCheckboxCorner = styled.div`
  position: absolute;
  top: ${(p) => p.theme.spacingGutter};
  right: ${(p) => p.theme.spacingGutter};
  z-index: 1;
  line-height: 0;
`;

export const SkillChallengeCheckbox = styled.input.attrs({ type: "checkbox" })`
  appearance: none;
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  margin: 0;
  border: 2px solid ${(p) => p.theme.colourPcHead};
  border-radius: ${(p) => p.theme.radiusControl};
  background: #fff;
  cursor: pointer;
  position: relative;
  display: block;

  &::before {
    display: none;
  }

  &:checked {
    background: ${(p) => p.theme.colourPcHead};
  }

  &:checked::before {
    left: -2px;
    top: -3px;
  }

  &:checked::after {
    content: "";
    position: absolute;
    left: 5px;
    top: 1px;
    width: 5px;
    height: 10px;
    border: solid ${(p) => p.theme.colourTextOnDark};
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
  }
`;

export const SkillChallengeFieldsRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

export const SectionBody = styled.div<{ $disabled?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 8px;

  ${(p) =>
    p.$disabled &&
    css`
      pointer-events: none;
    `}
`;

export const SectionTitle = styled.h4`
  margin: 0;
  color: ${(p) => p.theme.colourHeading};
  font-size: 0.95rem;
  font-weight: 700;
`;

export const SectionHint = styled.p`
  margin: 0;
  font-size: 0.8rem;
  color: ${(p) => p.theme.colourTextInside};
`;

export const DropZone = styled.div`
  border: 2px dashed ${(p) => p.theme.borderMuted};
  border-radius: ${(p) => p.theme.radiusControl};
  padding: 16px 12px;
  min-height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-size: 0.85rem;
  color: ${(p) => p.theme.colourTextInside};
  background: rgba(255, 255, 255, 0.35);
`;

export const EnemyDropTarget = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-height: 0;
  border-radius: ${(p) => p.theme.radiusControl};

  &.drag-over ${DropZone} {
    border-color: ${(p) => p.theme.colourHeading};
    background: rgba(255, 255, 255, 0.6);
  }
`;

export const ActorList = styled.div<{ $fill?: boolean; $capped?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${ENEMY_ROW_GAP}px;
  overflow-y: auto;
  min-height: 0;

  ${(p) =>
    p.$fill
      ? css`
          flex: 1 1 auto;
          max-height: none;
        `
      : p.$capped
        ? css`
            flex-shrink: 0;
            max-height: ${ENEMY_LIST_MAX_HEIGHT};
          `
        : css`
            flex-shrink: 0;
            max-height: none;
          `}
`;

export const ActorRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  padding: 6px 8px;
  border-radius: ${(p) => p.theme.radiusControl};
  background: ${(p) => p.theme.backgroundRowEven};

  &:nth-child(odd) {
    background: ${(p) => p.theme.backgroundRowOdd};
  }
`;

export const Portrait = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 4px;
  object-fit: cover;
  flex-shrink: 0;
  border: 1px solid ${(p) => p.theme.borderMuted};
`;

export const ActorText = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const ActorName = styled.h5`
  margin: 0;
  font-size: 0.9rem;
  font-weight: 700;
  color: ${(p) => p.theme.colourHeading};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const ActorSubtitle = styled.span`
  font-size: 0.75rem;
  color: ${(p) => p.theme.colourTextInside};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const XpInput = styled.input.attrs({ type: "number", min: 0, step: 1 })`
  width: 72px;
  text-align: right;
  padding: 4px 6px;
  border: 1px solid ${(p) => p.theme.borderMuted};
  border-radius: ${(p) => p.theme.radiusControl};
  background: #fff;
  color: ${(p) => p.theme.colourTextOnLight};

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

export const CountInput = styled(XpInput).attrs({ min: 1, step: 1 })`
  width: 48px;
`;

export const MultiplySign = styled.span`
  display: flex;
  align-items: center;
  align-self: center;
  font-size: 1.1rem;
  font-weight: 700;
  line-height: 1;
  color: ${(p) => p.theme.colourHeading};
  flex-shrink: 0;
  user-select: none;
`;

export const EnemyValueGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
`;

export const IconButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  color: ${(p) => p.theme.colourTextInside};
  padding: 4px;
  flex-shrink: 0;

  &:hover {
    color: #a03030;
  }
`;

export const BonusRow = styled.label`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-weight: 600;
  color: ${(p) => p.theme.colourHeading};
`;

export const SummaryLine = styled.div`
  font-size: 0.95rem;
  font-weight: 600;
  color: ${(p) => p.theme.colourHeading};
`;

export const PerMemberLine = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: ${(p) => p.theme.colourTextOnLight};
`;

export const ApplyButton = styled.button`
  align-self: flex-end;
  margin-top: 4px;
  padding: 8px 18px;
  border: 1px solid ${(p) => p.theme.colourPcHead};
  border-radius: ${(p) => p.theme.radiusControl};
  background: ${(p) => p.theme.colourPcHead};
  color: ${(p) => p.theme.colourTextOnDark};
  font-weight: 700;
  cursor: pointer;

  &:hover {
    filter: brightness(1.1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
