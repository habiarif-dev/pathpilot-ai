export const STREAK_REWARDS = [
  {
    days: 3,
    title: "Beginner Badge",
    description: "Maintain a 3-day learning streak.",
    xpReward: 30,
  },
  {
    days: 7,
    title: "Consistency Badge",
    description: "Stay consistent for one full week.",
    xpReward: 100,
  },
  {
    days: 15,
    title: "Learning Warrior",
    description: "Keep learning for 15 consecutive days.",
    xpReward: 200,
  },
  {
    days: 30,
    title: "Master Learner",
    description: "Complete a 30-day learning streak.",
    xpReward: 500,
  },
  {
    days: 60,
    title: "Elite Builder",
    description: "Maintain an impressive 60-day streak.",
    xpReward: 1000,
  },
  {
    days: 100,
    title: "PathPilot Legend",
    description: "Reach a legendary 100-day streak.",
    xpReward: 2000,
  },
];

export function getNextStreakReward(currentStreak) {
  return (
    STREAK_REWARDS.find(
      (reward) => reward.days > currentStreak
    ) || null
  );
}

export function getUnlockedStreakRewards(
  currentStreak
) {
  return STREAK_REWARDS.filter(
    (reward) => reward.days <= currentStreak
  );
}

export function calculateStreakRewardXp(
  currentStreak
) {
  return getUnlockedStreakRewards(
    currentStreak
  ).reduce(
    (total, reward) =>
      total + reward.xpReward,
    0
  );
}