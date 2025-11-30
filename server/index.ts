import { Elysia } from "elysia";
import { academicPeriods } from "./routes/academic-periods";
import { auth } from "./routes/auth";
import { chat } from "./routes/chat";
import { debug } from "./routes/debug";
import { enrollment } from "./routes/enrollment";
import { faculty } from "./routes/faculty";
import { facultyClasses } from "./routes/faculty-classes";
import { schedule } from "./routes/schedule";
import { students } from "./routes/students";
import { uploadImage } from "./routes/upload-image";

export const app = new Elysia({ prefix: "/api" })
    .use(auth)
    .use(students)
    .use(faculty)
    .use(schedule)
    .use(academicPeriods)
    .use(chat)
    .use(uploadImage)
    .use(debug)
    .use(enrollment)
    .use(facultyClasses);

export type App = typeof app;
