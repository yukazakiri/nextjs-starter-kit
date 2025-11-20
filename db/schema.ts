import {
  pgTable,
  bigint,
  integer,
  text,
  varchar,
  timestamp,
  boolean,
  real,
  smallint,
  numeric,
  date,
  json,
  uuid,
} from "drizzle-orm/pg-core";

export const students = pgTable("students", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  studentId: bigint("student_id", { mode: "number" }),
  firstName: varchar("first_name", { length: 255 }),
  lastName: varchar("last_name", { length: 255 }),
  middleName: varchar("middle_name", { length: 255 }),
  email: varchar("email", { length: 255 }),
  courseId: bigint("course_id", { mode: "number" }),
  yearLevel: varchar("year_level", { length: 255 }),
  status: varchar("status", { length: 255 }),
  gender: varchar("gender", { length: 255 }),
  civilStatus: varchar("civil_status", { length: 255 }),
  birthDate: date("birth_date"),
  birthPlace: varchar("birth_place", { length: 255 }),
  nationality: varchar("nationality", { length: 255 }),
  address: text("address"),
  guardianName: varchar("guardian_name", { length: 255 }),
  guardianContact: varchar("guardian_contact", { length: 255 }),
  userId: integer("user_id"),
  createdAt: timestamp("created_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
});

export const courses = pgTable("courses", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  code: varchar("code", { length: 255 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  department: varchar("department", { length: 255 }),
  units: integer("units").default(0).notNull(),
  yearLevel: integer("year_level").default(1).notNull(),
  semester: integer("semester").default(1).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { precision: 0 }),
  updatedAt: timestamp("updated_at", { precision: 0 }),
});

export const departments = pgTable("departments", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  schoolId: bigint("school_id", { mode: "number" }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 10 }).notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { precision: 0 }),
  updatedAt: timestamp("updated_at", { precision: 0 }),
});

export const subject = pgTable("subject", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  code: varchar("code", { length: 255 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  units: bigint("units", { mode: "number" }),
  lecture: bigint("lecture", { mode: "number" }),
  laboratory: bigint("laboratory", { mode: "number" }),
  preRequisite: text("pre_riquisite"), // Note: typo in DB 'pre_riquisite'
  academicYear: bigint("academic_year", { mode: "number" }),
  semester: bigint("semester", { mode: "number" }),
  courseId: bigint("course_id", { mode: "number" }),
  isCredited: boolean("is_credited").default(false).notNull(),
  description: varchar("description", { length: 255 }),
  createdAt: timestamp("created_at", { precision: 0 }),
  updatedAt: timestamp("updated_at", { precision: 0 }),
});

export const subjectEnrollments = pgTable("subject_enrollments", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  studentId: integer("student_id"),
  subjectId: bigint("subject_id", { mode: "number" }),
  classId: integer("class_id"),
  grade: real("grade"),
  instructor: varchar("instructor", { length: 255 }),
  academicYear: varchar("academic_year", { length: 255 }),
  schoolYear: varchar("school_year", { length: 255 }),
  semester: smallint("semester"),
  enrollmentId: smallint("enrollment_id"),
  remarks: varchar("remarks", { length: 255 }),
  section: varchar("section", { length: 255 }),
  isCredited: boolean("is_credited").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
});

export const studentEnrollment = pgTable("student_enrollment", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  studentId: varchar("student_id", { length: 255 }).notNull(), // Note: varchar in DB
  courseId: varchar("course_id", { length: 255 }).notNull(),
  status: varchar("status", { length: 255 }).notNull(),
  semester: bigint("semester", { mode: "number" }),
  academicYear: bigint("academic_year", { mode: "number" }),
  schoolYear: varchar("school_year", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
});

export const faculty = pgTable("faculty", {
  id: uuid("id").primaryKey(),
  firstName: varchar("first_name", { length: 255 }).notNull(),
  lastName: varchar("last_name", { length: 255 }).notNull(),
  middleName: varchar("middle_name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  phoneNumber: varchar("phone_number", { length: 255 }),
  department: varchar("department", { length: 255 }),
  officeHours: varchar("office_hours", { length: 255 }),
  birthDate: date("birth_date"),
  addressLine1: varchar("address_line1", { length: 255 }),
  biography: text("biography"),
  education: text("education"),
  coursesTaught: text("courses_taught"),
  photoUrl: varchar("photo_url", { length: 255 }),
  status: varchar("status", { length: 255 }), // faculty_status enum in DB
  gender: varchar("gender", { length: 255 }), // faculty_gender enum in DB
  age: bigint("age", { mode: "number" }),
  facultyCode: varchar("faculty_code", { length: 20 }),
  facultyIdNumber: varchar("faculty_id_number", { length: 20 }),
  fullName: varchar("full_name", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
});

export const classes = pgTable("classes", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  subjectId: bigint("subject_id", { mode: "number" }),
  facultyId: uuid("faculty_id"),
  subjectCode: varchar("subject_code", { length: 255 }),
  courseCodes: varchar("course_codes", { length: 255 }),
  academicYear: varchar("academic_year", { length: 255 }),
  semester: varchar("semester", { length: 255 }),
  schoolYear: varchar("school_year", { length: 255 }),
  section: varchar("section", { length: 255 }),
  roomId: smallint("room_id"),
  classification: varchar("classification", { length: 255 }),
  maximumSlots: smallint("maximum_slots").default(50),
  scheduleId: bigint("schedule_id", { mode: "number" }),
  gradeLevel: varchar("grade_level", { length: 255 }),
  subjectIds: json("subject_ids"),
  createdAt: timestamp("created_at", { precision: 0 }),
  updatedAt: timestamp("updated_at", { precision: 0 }),
});

export const studentsPersonalInfo = pgTable("students_personal_info", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  birthplace: varchar("birthplace", { length: 255 }),
  civilStatus: varchar("civil_status", { length: 255 }),
  citizenship: varchar("citizenship", { length: 255 }),
  religion: varchar("religion", { length: 255 }),
  weight: varchar("weight", { length: 255 }),
  height: varchar("height", { length: 255 }),
  currentAdress: varchar("current_adress", { length: 255 }), // Note: typo in DB 'adress'
  permanentAddress: varchar("permanent_address", { length: 255 }),
  createdAt: timestamp("created_at", { precision: 0 }),
  updatedAt: timestamp("updated_at", { precision: 0 }),
});
