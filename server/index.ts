import { Elysia } from "elysia";
import { auth } from "./routes/auth";
import { students } from "./routes/students";
import { faculty } from "./routes/faculty";
import { schedule } from "./routes/schedule";
import { academicPeriods } from "./routes/academic-periods";
import { chat } from "./routes/chat";
import { uploadImage } from "./routes/upload-image";
import { debug } from "./routes/debug";

export const app = new Elysia({ prefix: "/api" })
  .use(auth)
  .use(students)
  .use(faculty)
  .use(schedule)
  .use(academicPeriods)
  .use(chat)
  .use(uploadImage)
  .use(debug);

export type App = typeof app;
