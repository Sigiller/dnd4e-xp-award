import { MODULE_ID } from "../../constants.js";
import { BonusRow, Section, SectionTitle, SummaryLine, XpInput } from "./XpAward.styles.js";

interface XpSummaryProps {
  bonusXp: number;
  totalXp: number;
  onBonusChange: (bonus: number) => void;
}

export function XpSummary({ bonusXp, totalXp, onBonusChange }: XpSummaryProps) {
  return (
    <Section>
      <BonusRow>
        <span>{game.i18n.localize(`${MODULE_ID}.dialog.bonusXp`)}</span>
        <XpInput
          value={bonusXp}
          onChange={(e) => onBonusChange(Math.max(0, parseInt(e.target.value, 10) || 0))}
        />
      </BonusRow>
      <SummaryLine>
        {game.i18n.localize(`${MODULE_ID}.dialog.totalXp`)}: {totalXp}
      </SummaryLine>
    </Section>
  );
}
