import { MODULE_ID } from "../../constants.js";
import { formatMessage, localize } from "../../i18n.js";
import {
  clampSkillChallengeComplexity,
  clampSkillChallengeLevel,
  SKILL_CHALLENGE_COMPLEXITY_MAX,
  SKILL_CHALLENGE_COMPLEXITY_MIN,
  SKILL_CHALLENGE_LEVEL_MAX,
  SKILL_CHALLENGE_LEVEL_MIN,
} from "../../xp/skill-challenge.js";
import {
  BonusRow,
  SectionBody,
  SkillChallengeCheckbox,
  SkillChallengeCheckboxCorner,
  SkillChallengeFieldsRow,
  SkillChallengeSectionRoot,
  SummaryLine,
  XpInput,
} from "./XpAward.styles.js";

interface SkillChallengeSectionProps {
  enabled: boolean;
  complexity: number;
  level: number;
  skillChallengeXp: number;
  onEnabledChange: (enabled: boolean) => void;
  onComplexityChange: (complexity: number) => void;
  onLevelChange: (level: number) => void;
}

export function SkillChallengeSection({
  enabled,
  complexity,
  level,
  skillChallengeXp,
  onEnabledChange,
  onComplexityChange,
  onLevelChange,
}: SkillChallengeSectionProps) {
  const includeLabel = localize(`${MODULE_ID}.dialog.skillChallengeInclude`);

  return (
    <SkillChallengeSectionRoot $disabled={!enabled}>
      <SkillChallengeCheckboxCorner>
        <SkillChallengeCheckbox
          checked={enabled}
          aria-label={includeLabel}
          title={includeLabel}
          onChange={(e) => onEnabledChange(e.target.checked)}
        />
      </SkillChallengeCheckboxCorner>

      <SectionBody $disabled={!enabled}>
        <SummaryLine>
          {formatMessage(`${MODULE_ID}.dialog.skillChallengeXp`, { xp: skillChallengeXp })}
        </SummaryLine>
        <SkillChallengeFieldsRow>
          <BonusRow>
            <span>{localize(`${MODULE_ID}.dialog.skillChallengeComplexity`)}</span>
            <XpInput
              value={complexity}
              min={SKILL_CHALLENGE_COMPLEXITY_MIN}
              max={SKILL_CHALLENGE_COMPLEXITY_MAX}
              disabled={!enabled}
              onChange={(e) =>
                onComplexityChange(clampSkillChallengeComplexity(parseInt(e.target.value, 10)))
              }
            />
          </BonusRow>
          <BonusRow>
            <span>{localize(`${MODULE_ID}.dialog.skillChallengeLevel`)}</span>
            <XpInput
              value={level}
              min={SKILL_CHALLENGE_LEVEL_MIN}
              max={SKILL_CHALLENGE_LEVEL_MAX}
              disabled={!enabled}
              onChange={(e) =>
                onLevelChange(clampSkillChallengeLevel(parseInt(e.target.value, 10)))
              }
            />
          </BonusRow>
        </SkillChallengeFieldsRow>
      </SectionBody>
    </SkillChallengeSectionRoot>
  );
}
