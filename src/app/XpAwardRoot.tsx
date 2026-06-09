import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MODULE_ID } from "../constants.js";
import { resolveEnemyPresentation } from "../xp/actor-presentation.js";
import { applyXpRewards } from "../xp/actor-xp.js";
import {
  groupEnemyEntries,
  mergeEnemyEntry,
  updateEnemyEntry,
  enemyCount,
} from "../xp/enemy-groups.js";
import { buildChatRecipientsFromAward, postXpAwardChatMessage } from "../xp/xp-chat-log.js";
import type { XpAwardState } from "../xp/combat-context.js";
import { syncXpState, type XpEntry } from "../xp/xp-calculator.js";
import {
  calcSkillChallengeXp,
  clampSkillChallengeComplexity,
  clampSkillChallengeLevel,
  createDefaultSkillChallengeState,
} from "../xp/skill-challenge.js";
import { ENEMY_VISIBLE_ROWS } from "./components/XpAward.styles.js";
import { EnemyRow } from "./components/EnemyRow.js";
import { RecipientRow } from "./components/RecipientRow.js";
import { SkillChallengeSection } from "./components/SkillChallengeSection.js";
import { XpSummary } from "./components/XpSummary.js";
import {
  ActorList,
  ApplyButton,
  BonusRow,
  DropZone,
  EnemyDropTarget,
  PerMemberLine,
  Section,
  SectionHint,
  SectionTitle,
  XpAwardInner,
  XpInput,
} from "./components/XpAward.styles.js";
import { useActorDragDrop } from "./hooks/useActorDragDrop.js";

export interface XpAwardProps {
  initialState: XpAwardState;
  individualXp: boolean;
  mode: "auto" | "manual";
  tokenImages?: Map<string, string>;
  onClose: () => void;
  onLayoutChange?: () => void;
}

function resolvePresentation(entry: XpEntry, tokenImages?: Map<string, string>) {
  return resolveEnemyPresentation(entry, tokenImages?.get(entry.id));
}

export function XpAwardRoot({
  initialState,
  individualXp,
  mode,
  tokenImages,
  onClose,
  onLayoutChange,
}: XpAwardProps) {
  const initialSkillChallenge = createDefaultSkillChallengeState();

  const [enemies, setEnemies] = useState(() => groupEnemyEntries(initialState.enemies));
  const [recipients, setRecipients] = useState(initialState.recipients);
  const [bonusXp, setBonusXp] = useState(initialState.bonusXp);
  const [skillChallengeEnabled, setSkillChallengeEnabled] = useState(false);
  const [skillChallengeComplexity, setSkillChallengeComplexity] = useState(
    initialSkillChallenge.complexity
  );
  const [skillChallengeLevel, setSkillChallengeLevel] = useState(initialSkillChallenge.level);
  const [manualPerMemberXp, setManualPerMemberXp] = useState(() => {
    if (mode === "manual" && !individualXp) {
      return syncXpState(
        groupEnemyEntries(initialState.enemies),
        initialState.recipients,
        initialState.bonusXp,
        0
      ).perMemberXp;
    }
    return 0;
  });
  const [applying, setApplying] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  const skillChallengeXp = useMemo(
    () =>
      skillChallengeEnabled
        ? calcSkillChallengeXp(skillChallengeComplexity, skillChallengeLevel)
        : 0,
    [skillChallengeEnabled, skillChallengeComplexity, skillChallengeLevel]
  );

  const synced = useMemo(
    () => syncXpState(enemies, recipients, bonusXp, skillChallengeXp),
    [enemies, recipients, bonusXp, skillChallengeXp]
  );

  const enemyListCapped = enemies.length >= ENEMY_VISIBLE_ROWS;

  useEffect(() => {
    if (!onLayoutChange) return;
    const frame = requestAnimationFrame(() => onLayoutChange());
    return () => cancelAnimationFrame(frame);
  }, [enemies, skillChallengeEnabled, recipients.length, individualXp, onLayoutChange]);

  const updateFromLists = useCallback(
    (
      nextEnemies: XpEntry[],
      nextRecipients: XpEntry[],
      nextBonus: number,
      nextSkillChallengeXp = skillChallengeXp
    ) => {
      const next = syncXpState(nextEnemies, nextRecipients, nextBonus, nextSkillChallengeXp);
      setEnemies(nextEnemies);
      setBonusXp(nextBonus);
      setRecipients(next.recipients);
      if (mode === "manual" && !individualXp) {
        setManualPerMemberXp(next.perMemberXp);
      }
    },
    [individualXp, mode, skillChallengeXp]
  );

  const handleEnemyCountChange = (entryId: string, count: number) => {
    const next = updateEnemyEntry(enemies, entryId, { count });
    updateFromLists(next, recipients, bonusXp);
  };

  const handleEnemyXpChange = (entryId: string, xp: number) => {
    const next = updateEnemyEntry(enemies, entryId, { xp });
    updateFromLists(next, recipients, bonusXp);
  };

  const handleRemoveEnemy = (entryId: string) => {
    const next = enemies.filter((e) => e.id !== entryId);
    updateFromLists(next, recipients, bonusXp);
  };

  const handleBonusChange = (bonus: number) => {
    updateFromLists(enemies, recipients, bonus);
  };

  const handleSkillChallengeEnabledChange = (enabled: boolean) => {
    setSkillChallengeEnabled(enabled);
    const nextXp = enabled
      ? calcSkillChallengeXp(skillChallengeComplexity, skillChallengeLevel)
      : 0;
    updateFromLists(enemies, recipients, bonusXp, nextXp);
  };

  const handleSkillChallengeComplexityChange = (complexity: number) => {
    const nextComplexity = clampSkillChallengeComplexity(complexity);
    setSkillChallengeComplexity(nextComplexity);
    const nextXp = skillChallengeEnabled
      ? calcSkillChallengeXp(nextComplexity, skillChallengeLevel)
      : 0;
    updateFromLists(enemies, recipients, bonusXp, nextXp);
  };

  const handleSkillChallengeLevelChange = (level: number) => {
    const nextLevel = clampSkillChallengeLevel(level);
    setSkillChallengeLevel(nextLevel);
    const nextXp = skillChallengeEnabled
      ? calcSkillChallengeXp(skillChallengeComplexity, nextLevel)
      : 0;
    updateFromLists(enemies, recipients, bonusXp, nextXp);
  };

  const handleEnemyDropped = useCallback(
    (entry: XpEntry) => {
      updateFromLists(mergeEnemyEntry(enemies, entry), recipients, bonusXp);
    },
    [bonusXp, enemies, recipients, updateFromLists]
  );

  useActorDragDrop(dropRef, handleEnemyDropped);

  const handleRecipientXpChange = (actorId: string, xp: number) => {
    setRecipients((prev) => prev.map((r) => (r.actorId === actorId ? { ...r, xp } : r)));
  };

  const sharedPerMemberXp =
    mode === "manual" && !individualXp ? manualPerMemberXp : synced.perMemberXp;

  const handleApply = async () => {
    const awardList = individualXp
      ? recipients
      : recipients.map((r) => ({ ...r, xp: sharedPerMemberXp }));

    const valid = awardList.filter((r) => r.xp > 0);
    if (valid.length === 0) {
      ui.notifications?.warn(game.i18n.localize(`${MODULE_ID}.dialog.noRecipients`));
      return;
    }

    setApplying(true);
    try {
      const count = await applyXpRewards(valid);
      if (count > 0) {
        await postXpAwardChatMessage({
          recipients: buildChatRecipientsFromAward(valid),
          enemies,
          bonusXp,
          totalXp: synced.totalXp,
          individualXp,
          perMemberXp: sharedPerMemberXp,
        });
        ui.notifications?.info(
          game.i18n.format(`${MODULE_ID}.dialog.appliedSummary`, { count })
        );
      }
      onClose();
    } finally {
      setApplying(false);
    }
  };

  const canApply =
    recipients.length > 0 &&
    (individualXp
      ? recipients.some((r) => r.xp > 0)
      : sharedPerMemberXp > 0);

  return (
    <XpAwardInner className="xp-award-inner">
      <Section>
        <SectionTitle>{game.i18n.localize(`${MODULE_ID}.dialog.enemies`)}</SectionTitle>
        <SectionHint>{game.i18n.localize(`${MODULE_ID}.dialog.enemiesHint`)}</SectionHint>
        <EnemyDropTarget ref={dropRef} className="xp-enemy-drop-target">
          <DropZone className="xp-enemy-drop-zone">
            {game.i18n.localize(`${MODULE_ID}.dialog.enemiesHint`)}
          </DropZone>
          <ActorList className="actor-list xp-enemy-list" $capped={enemyListCapped}>
            {enemies.map((enemy) => {
              const presentation = resolvePresentation(enemy, tokenImages);
              if (!presentation) return null;
              return (
                <EnemyRow
                  key={enemy.id}
                  presentation={presentation}
                  count={enemyCount(enemy)}
                  xp={enemy.xp}
                  onCountChange={(count) => handleEnemyCountChange(enemy.id, count)}
                  onXpChange={(xp) => handleEnemyXpChange(enemy.id, xp)}
                  onRemove={() => handleRemoveEnemy(enemy.id)}
                />
              );
            })}
          </ActorList>
        </EnemyDropTarget>
      </Section>

      <SkillChallengeSection
        enabled={skillChallengeEnabled}
        complexity={skillChallengeComplexity}
        level={skillChallengeLevel}
        skillChallengeXp={skillChallengeXp}
        onEnabledChange={handleSkillChallengeEnabledChange}
        onComplexityChange={handleSkillChallengeComplexityChange}
        onLevelChange={handleSkillChallengeLevelChange}
      />

      <XpSummary bonusXp={bonusXp} totalXp={synced.totalXp} onBonusChange={handleBonusChange} />

      <Section className="xp-award-recipients-section">
        {individualXp ? (
          <>
            <SectionTitle>{game.i18n.localize(`${MODULE_ID}.dialog.recipients`)}</SectionTitle>
            <ActorList className="actor-list xp-award-recipients-list">
              {recipients.map((recipient) => {
                const presentation = resolvePresentation(recipient, tokenImages);
                if (!presentation) return null;
                return (
                  <RecipientRow
                    key={recipient.actorId}
                    presentation={presentation}
                    xp={recipient.xp}
                    onXpChange={(xp) => handleRecipientXpChange(recipient.actorId, xp)}
                  />
                );
              })}
            </ActorList>
          </>
        ) : mode === "manual" ? (
          <BonusRow>
            <span>
              {game.i18n.format(`${MODULE_ID}.dialog.perMemberManual`, {
                count: recipients.length,
              })}
            </span>
            <XpInput
              value={manualPerMemberXp}
              onChange={(e) =>
                setManualPerMemberXp(Math.max(0, parseInt(e.target.value, 10) || 0))
              }
            />
          </BonusRow>
        ) : (
          <PerMemberLine>
            {game.i18n.format(`${MODULE_ID}.dialog.perMember`, {
              xp: synced.perMemberXp,
              count: recipients.length,
            })}
          </PerMemberLine>
        )}
      </Section>

      <ApplyButton type="button" disabled={!canApply || applying} onClick={() => void handleApply()}>
        {game.i18n.localize(`${MODULE_ID}.dialog.apply`)}
      </ApplyButton>
    </XpAwardInner>
  );
}
