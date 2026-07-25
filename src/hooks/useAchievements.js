import { useEffect, useMemo, useState } from "react";

import {
  calculateAchievementXp,
  evaluateAchievements,
  loadSavedAchievementIds,
  saveUnlockedAchievements,
} from "../data/achievements";

function useAchievements(progressData) {
  const [savedAchievementIds, setSavedAchievementIds] =
    useState(() => loadSavedAchievementIds());

  const [newAchievement, setNewAchievement] =
    useState(null);

  const evaluatedAchievements = useMemo(
    () => evaluateAchievements(progressData),
    [progressData]
  );

  const unlockedAchievements = useMemo(
    () =>
      evaluatedAchievements.filter(
        (achievement) => achievement.unlocked
      ),
    [evaluatedAchievements]
  );

  const lockedAchievements = useMemo(
    () =>
      evaluatedAchievements.filter(
        (achievement) => !achievement.unlocked
      ),
    [evaluatedAchievements]
  );

  const achievementXp = useMemo(
    () =>
      calculateAchievementXp(
        unlockedAchievements
      ),
    [unlockedAchievements]
  );

  useEffect(() => {
    const currentlyUnlockedIds =
      unlockedAchievements.map(
        (achievement) => achievement.id
      );

    const newlyUnlockedAchievements =
      unlockedAchievements.filter(
        (achievement) =>
          !savedAchievementIds.includes(
            achievement.id
          )
      );

    if (
      newlyUnlockedAchievements.length > 0
    ) {
      setNewAchievement(
        newlyUnlockedAchievements[0]
      );
    }

    const hasChanged =
      currentlyUnlockedIds.length !==
        savedAchievementIds.length ||
      currentlyUnlockedIds.some(
        (achievementId) =>
          !savedAchievementIds.includes(
            achievementId
          )
      );

    if (hasChanged) {
      saveUnlockedAchievements(
        unlockedAchievements
      );

      setSavedAchievementIds(
        currentlyUnlockedIds
      );
    }
  }, [
    unlockedAchievements,
    savedAchievementIds,
  ]);

  const dismissNewAchievement = () => {
    setNewAchievement(null);
  };

  const unlockedCount =
    unlockedAchievements.length;

  const totalCount =
    evaluatedAchievements.length;

  const achievementProgress =
    totalCount > 0
      ? Math.round(
          (unlockedCount / totalCount) * 100
        )
      : 0;

  const recentAchievements = useMemo(
    () =>
      [...unlockedAchievements]
        .reverse()
        .slice(0, 3),
    [unlockedAchievements]
  );

  return {
    achievements: evaluatedAchievements,
    unlockedAchievements,
    lockedAchievements,
    recentAchievements,
    unlockedCount,
    totalCount,
    achievementProgress,
    achievementXp,
    newAchievement,
    dismissNewAchievement,
  };
}

export default useAchievements;