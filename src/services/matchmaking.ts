import { getEmbedding } from "./embedding";
import { pineconeIndex } from "./pinecone";
import { User, profileToText } from "../utils/profileToText";
import { getCompatibilityScore } from "../utils/compatibility";

export interface Match {
  userId: string;
  firstName: string;
  age: number;
  gender: string;
  bio: string;
  occupation: string;
  interests: string[];
  preferences: User["preferences"];
  similarityScore: number; // 0-1 based on embedding similarity
  compatibilityScore: number; // 0-100 based on preferences
  overallScore: number; // Combined score
}

export async function embedUser(user: User): Promise<void> {
  try {
    const profileText = profileToText(user);

    // Generate embedding using Gemini
    const embedding = await getEmbedding(profileText);

    // Store in Pinecone with metadata
    await pineconeIndex.upsert([
      {
        id: user.userId,
        values: embedding,
        metadata: {
          firstName: user.profileInfo.firstName,
          age: user.profileInfo.age,
          gender: user.profileInfo.gender,
          city: user.profileInfo.location.city,
          state: user.profileInfo.location.state,
          occupation: user.profileInfo.occupation,
          lookingFor: user.preferences.lookingFor,
          userData: JSON.stringify(user),
        },
      },
    ]);

    console.log(
      `Embedded user: ${user.profileInfo.firstName} (${user.userId})`
    );
  } catch (error) {
    console.error(`Failed to embed user ${user.userId}:`, error);
    throw error;
  }
}

export async function embedUsers(users: User[]): Promise<{
  success: number;
  failed: number;
  errors: string[];
}> {
  let success = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const user of users) {
    try {
      await embedUser(user);
      success++;
      // Add small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      failed++;
      errors.push(
        `${user.userId}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  return { success, failed, errors };
}

export async function findMatches(
  userId: string,
  allUsers: User[],
  topK: number = 20
): Promise<Match[]> {
  // Find the user
  const user = allUsers.find((u) => u.userId === userId);
  if (!user) {
    throw new Error(`User not found: ${userId}`);
  }

  // Generate embedding for the user's profile
  const profileText = profileToText(user);
  const userEmbedding = await getEmbedding(profileText);

  // Query Pinecone for similar vectors
  const queryResponse = await pineconeIndex.query({
    vector: userEmbedding,
    topK: topK + 1,
    includeMetadata: true,
    filter: {
      gender: user.preferences.genderPreference,
      // preferredGender: user.profileInfo.gender, // mutual
    },
  });
  console.log(queryResponse);

  // Process matches
  const matches: Match[] = [];

  for (const match of queryResponse.matches || []) {
    // Skip the user themselves
    if (match.id === userId) {
      continue;
    }

    // Parse user data from metadata
    if (!match.metadata || !match.metadata.userData) {
      continue;
    }

    const matchedUser: User = JSON.parse(match.metadata.userData as string);

    const similarityScore = match.score || 0; // Cosine similarity from Pinecone (0-1)
    const compatibilityScore = getCompatibilityScore(user, matchedUser); // 0-100

    // Combined score: 60% similarity + 40% compatibility
    const overallScore = similarityScore * 0.6 * 100 + compatibilityScore * 0.4;

    matches.push({
      userId: matchedUser.userId,
      firstName: matchedUser.profileInfo.firstName,
      age: matchedUser.profileInfo.age,
      gender: matchedUser.profileInfo.gender,
      bio: matchedUser.profileInfo.bio,
      occupation: matchedUser.profileInfo.occupation,
      interests: matchedUser.interests,
      preferences: matchedUser.preferences,
      similarityScore: Math.round(similarityScore * 100) / 100,
      compatibilityScore,
      overallScore: Math.round(overallScore),
    });
  }

  // Sort by overall score
  matches.sort((a, b) => b.overallScore - a.overallScore);

  return matches;
}
