import { serve } from "@hono/node-server";
import { Hono } from "hono";

import { handle } from "hono/aws-lambda";
import users from "./data/users.json";
import { getEmbedding } from "./services/embedding";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

//map through each user and embed them
app.get("/users", (c) => {
  users.map((user) => {
    const userEmbed = getEmbedding(JSON.stringify(user));
    console.log(userEmbed);
  });
  return c.json(users);
});

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}/users`);
  }
);

// export const handler = handle(app);
