import { Elysia } from "elysia";

// This file handles student-specific routes
export const auth = new Elysia({ prefix: "/student" })
  .get("/checklist", async () => {
    return { success: true, checklist: [] };
  })
  .get("/subjects", async () => {
    return { success: true, subjects: [] };
  })
  .get("/enrollment-status", async () => {
    return { success: true, status: {} };
  });
