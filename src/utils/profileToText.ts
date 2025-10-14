export interface User {
  userId: string;
  profileInfo: {
    username: string;
    firstName: string;
    age: number;
    gender: string;
    location: {
      city: string;
      state: string;
    };
    bio: string;
    occupation: string;
    education: string;
  };
  lifestyle: {
    smoking: string;
    drinking: string;
    exercise: string;
    hasChildren: boolean;
    wantsChildren: string;
  };
  interests: string[];
  profileImages: string[];
  preferences: {
    ageRange: [number, number];
    genderPreference: string;
    maxDistanceKm: number;
    lookingFor: string;
    educationPreference: string;
    smokingPreference: string;
    drinkingPreference: string;
    mustLoveDogs: boolean;
    mustLoveCats: boolean;
  };
}

export function profileToText(user: User): string {
  const { profileInfo, lifestyle, interests, preferences } = user;

  const parts: string[] = [
    // Core identity
    `${profileInfo.firstName}, ${profileInfo.age} years old, ${profileInfo.gender}.`,
    `From ${profileInfo.location.city}, ${profileInfo.location.state}.`,
    `Works as a ${profileInfo.occupation} with ${profileInfo.education} education.`,

    // Bio
    `Bio: ${profileInfo.bio}`,

    // Interests and hobbies
    `Passionate about: ${interests.join(", ")}.`,

    // Lifestyle details
    `Lifestyle: ${lifestyle.exercise} exercise routine, ${lifestyle.drinking} drinker, ${lifestyle.smoking} smoker.`,
    lifestyle.hasChildren
      ? `Has children and ${lifestyle.wantsChildren}.`
      : `No children, ${lifestyle.wantsChildren}.`,

    // What they're looking for
    `Looking for: ${preferences.lookingFor} with someone who is ${preferences.genderPreference}.`,
    `Age preference: ${preferences.ageRange[0]}-${preferences.ageRange[1]} years old.`,

    // Important preferences that define compatibility
    preferences.educationPreference !== "No preference"
      ? `Education preference: ${preferences.educationPreference}.`
      : "",

    preferences.smokingPreference !== "No preference"
      ? `Smoking preference: ${preferences.smokingPreference}.`
      : "",

    preferences.drinkingPreference !== "Doesn't matter"
      ? `Drinking preference: ${preferences.drinkingPreference}.`
      : "",
      
    preferences.mustLoveDogs ? "Must love dogs." : "",
    preferences.mustLoveCats ? "Must love cats." : "",
  ];

  // Filter out empty strings and join with spaces
  return parts.filter((part) => part.length > 0).join(" ");
}
