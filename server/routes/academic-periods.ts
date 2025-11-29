import { Elysia } from "elysia";

export const academicPeriods = new Elysia({ prefix: "/academic-periods" }).get(
  "/",
  async () => {
    // Add your academic periods logic here
    return { success: true, periods: [] };
  }
);
