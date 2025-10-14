import { serve } from "@hono/node-server";
import { Hono } from "hono";
import usersData from "./data/users.json";
import { embedUsers, findMatches } from "./services/matchmaking";
import { User } from "./utils/profileToText";

const app = new Hono();

// Cast the imported JSON to User[] type
const users = usersData as User[];

app.get("/", (c) => {
  return c.json({
    message: "Datie AI - Modern Dating Matchmaking Engine",
    endpoints: {
      "POST /embed-users": "Embed all user profiles and store in Pinecone",
      "GET /match/:userId": "Find matches for a specific user",
      "GET /users": "Get all users",
      "GET /users/:userId": "Get a specific user",
    },
  });
});

app.get("/users", (c) => {
  return c.json({
    total: users.length,
    users: users.map((u) => ({
      userId: u.userId,
      firstName: u.profileInfo.firstName,
      age: u.profileInfo.age,
      gender: u.profileInfo.gender,
      location: u.profileInfo.location,
      bio: u.profileInfo.bio,
    })),
  });
});

app.post("/embed-users", async (c) => {
  try {
    console.log(`Starting to embed ${users.length} users...`);

    const result = await embedUsers(users);

    return c.json({
      message: "Embedding complete",
      total: users.length,
      success: result.success,
      failed: result.failed,
      errors: result.errors,
    });
  } catch (error) {
    console.error("Error embedding users:", error);
    return c.json(
      {
        error: "Failed to embed users",
        details: error instanceof Error ? error.message : String(error),
      },
      500
    );
  }
});

app.get("/match/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const topK = parseInt(c.req.query("topK") || "10");

    console.log(`Finding matches for user: ${userId}`);

    const matches = await findMatches(userId, users, topK);

    const user = users.find((u) => u.userId === userId);

    return c.json({
      message: "Matches found!",
      forUser: user
        ? {
            userId: user.userId,
            firstName: user.profileInfo.firstName,
            age: user.profileInfo.age,
            bio: user.profileInfo.bio,
            occupation: user.profileInfo.occupation,
            interests: user.interests,
            gender: user.profileInfo.gender,
            preferences: user.preferences,
          }
        : null,
      totalMatches: matches.length,
      matches,
    });
  } catch (error) {
    console.error("Error finding matches:", error);
    return c.json(
      {
        error: "Failed to find matches",
        details: error instanceof Error ? error.message : String(error),
      },
      500
    );
  }
});

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
    console.log(`API Documentation: http://localhost:${info.port}/`);
  }
);
