import { Elysia } from "elysia";

export const uploadImage = new Elysia({ prefix: "/upload-image" }).post(
  "/",
  async ({ body }) => {
    // Add upload image logic here
    return { success: true };
  }
);
