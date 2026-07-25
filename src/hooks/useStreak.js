import { useEffect, useMemo, useState } from "react";

import {
  calculateStreakRewardXp,
  getNextStreakReward,
  getUnlockedStreakRewards,
} from "../data/streakRewards";

const STORAGE_KEY = "pathpilot_streak";

function getDateKey(date = new Date()) {
  return date.toISOString().split("T")[0];
}

function getYesterdayKey() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  return getDateKey(yesterday);
}

function loadStreak() {
  const savedStreak =
    localStorage.getItem(STORAGE_KEY);

  if (!savedStreak) {
    return {
      current: 0,
      longest: 0,
      lastVisit: null,
    };
  }

  try {
    const parsedStreak = JSON.parse(savedStreak);

    return {
      current: Number(parsedStreak.current) || 0,
      longest: Number(parsedStreak.longest) || 0,
      lastVisit: parsedStreak.lastVisit || null,
    };
  } catch (error) {
    console.error(
      "Unable to load streak data:",
      error
    );

    return {
      current: 0,
      longest: 0,
      lastVisit: null,
    };
  }
}

function useStreak() {
  const [streak, setStreak] = useState(
    loadStreak
  );

  useEffect(() => {
    const today = getDateKey();
    const yesterday = getYesterdayKey();

    setStreak((previousStreak) => {
      if (
        previousStreak.lastVisit === today
      ) {
        return previousStreak;
      }

      const nextCurrent =
        previousStreak.lastVisit === yesterday
          ? previousStreak.current + 1
          : 1;

      const updatedStreak = {
        current: nextCurrent,
        longest: Math.max(
          previousStreak.longest,
          nextCurrent
        ),
        lastVisit: today,
      };

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updatedStreak)
      );

      return updatedStreak;
    });
  }, []);

  const nextReward = useMemo(
    () =>
      getNextStreakReward(streak.current),
    [streak.current]
  );

  const unlockedRewards = useMemo(
    () =>
      getUnlockedStreakRewards(
        streak.current
      ),
    [streak.current]
  );

  const streakXp = useMemo(
    () =>
      calculateStreakRewardXp(
        streak.current
      ),
    [streak.current]
  );

  const progressToNextReward = useMemo(() => {
    if (!nextReward) {
      return 100;
    }

    const previousRewardDays =
      unlockedRewards.length > 0
        ? unlockedRewards[
            unlockedRewards.length - 1
          ].days
        : 0;

    const requiredDays =
      nextReward.days - previousRewardDays;

    const completedDays =
      streak.current - previousRewardDays;

    return Math.min(
      100,
      Math.round(
        (completedDays / requiredDays) * 100
      )
    );
  }, [
    nextReward,
    streak.current,
    unlockedRewards,
  ]);

  return {
    currentStreak: streak.current,
    longestStreak: streak.longest,
    lastVisit: streak.lastVisit,
    nextReward,
    unlockedRewards,
    streakXp,
    progressToNextReward,
  };
}

export default useStreak;