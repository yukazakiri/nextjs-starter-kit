import { Elysia } from "elysia";
import { academicPeriods } from "./routes/academic-periods";
import { auth } from "./routes/auth";
import { chat } from "./routes/chat";
import { classActions } from "./routes/class-actions";
import { classSettings } from "./routes/class-settings";
import { debug } from "./routes/debug";
import { enrollment } from "./routes/enrollment";
import { faculty } from "./routes/faculty";
import { facultyClasses } from "./routes/faculty-classes";
import { schedule } from "./routes/schedule";
import { students } from "./routes/students";
import { uploadImage } from "./routes/upload-image";
import { user } from "./routes/user";
import { classGrades } from "./routes/class-grades";

export const app = new Elysia({ prefix: "/api" })
    .use(auth)
    .use(students)
    .use(classGrades)
    .use(faculty)
    .use(schedule)
    .use(academicPeriods)
    .use(user)
    .use(chat)
    .use(uploadImage)
    .use(debug)
    .use(enrollment)
    .use(facultyClasses)
    .use(classActions)
    .use(classSettings);

export type App = typeof app;
