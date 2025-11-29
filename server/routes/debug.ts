import { Elysia } from "elysia";

export const debug = new Elysia({ prefix: "/debug" })
  .get("/session", async () => {
    return { success: true, session: {} };
  })
  .get("/enrollment", async () => {
    return { success: true, enrollment: {} };
  });
