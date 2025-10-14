import { User } from "./profileToText";

/**
 * Calculate a compatibility score between two users (0-100)
 * based on how well they match each other's preferences
 */
export function getCompatibilityScore(user1: User, user2: User): number {
  let score = 0;
  let maxScore = 0;

  // Age preference scoring (weight: 15)
  maxScore += 15;
  const user2WithinUser1Range =
    user2.profileInfo.age >= user1.preferences.ageRange[0] &&
    user2.profileInfo.age <= user1.preferences.ageRange[1];
  const user1WithinUser2Range =
    user1.profileInfo.age >= user2.preferences.ageRange[0] &&
    user1.profileInfo.age <= user2.preferences.ageRange[1];
  if (user2WithinUser1Range && user1WithinUser2Range) {
    score += 15;
  }

  // Relationship goals alignment (weight: 20)
  maxScore += 20;
  if (user1.preferences.lookingFor === user2.preferences.lookingFor) {
    score += 20;
  } else if (
    (user1.preferences.lookingFor === "Long-term relationship" &&
      user2.preferences.lookingFor === "Still figuring it out") ||
    (user2.preferences.lookingFor === "Long-term relationship" &&
      user1.preferences.lookingFor === "Still figuring it out")
  ) {
    score += 10;
  }

  // Children compatibility (weight: 15)
  maxScore += 15;
  if (user1.lifestyle.wantsChildren === user2.lifestyle.wantsChildren) {
    score += 15;
  } else if (
    user1.lifestyle.wantsChildren === "Open to it" ||
    user2.lifestyle.wantsChildren === "Open to it"
  ) {
    score += 10;
  }

  // Exercise/lifestyle alignment (weight: 10)
  maxScore += 10;
  if (user1.lifestyle.smoking === user2.lifestyle.smoking) {
    score += 10;
  } else if (
    (user1.lifestyle.smoking === "Active" &&
      user2.lifestyle.smoking === "Sometimes") ||
    (user1.lifestyle.smoking === "Sometimes" &&
      user2.lifestyle.smoking === "Active")
  ) {
    score += 5;
  }

  // Shared interests (weight: 40)
  maxScore += 40;
  const sharedInterests = user1.interests.filter((interest) =>
    user2.interests.includes(interest)
  );
  score += Math.min(40, sharedInterests.length * 4);

  // Normalize to 0-100
  return Math.round((score / maxScore) * 100);
}
