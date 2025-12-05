import { Elysia, t } from "elysia";
import { laravelApi } from "@/lib/laravel-api";

export const classGrades = new Elysia({ prefix: "/faculty/classes/:classId/grades" })
  .get("/", async ({ params, set }) => {
    try {
      const { classId } = params as { classId: string };
      console.log("[class-grades] GET grades", { classId });
      let enrollments: any;
      try {
        console.log("[class-grades] Using laravelApi client");
        enrollments = await laravelApi.getClassEnrollmentsByClassId(classId);
      } catch (e) {
        const base = (process.env.DCCP_API_URL || "https://admin.dccp.edu.ph").replace(/\/$/, "");
        const url = `${base}/api/class-enrollments/class/${classId}`;
        const tokenPresent = Boolean(process.env.DCCP_API_TOKEN);
        console.warn("[class-grades] Client failed, falling back to direct fetch", { url, tokenPresent });
        const res = await fetch(url, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${(process.env.DCCP_API_TOKEN || "").replace(/^\s*["']|["']\s*$/g, "")}`,
          },
        });
        console.log("[class-grades] Fallback response", { status: res.status, ok: res.ok });
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(`Laravel ${res.status}: ${res.statusText} ${txt}`);
        }
        enrollments = await res.json();
        console.log("[class-grades] Fallback payload received", { items: Array.isArray(enrollments?.data) ? enrollments.data.length : 0 });
      }

      const grades = (enrollments?.data || []).map((item: any) => ({
        enrollmentId: String(item.id),
        studentId: item.student?.student_id || String(item.student_id),
        studentName: item.student?.full_name || "",
        prelimGrade: item.prelim_grade ?? null,
        midtermGrade: item.midterm_grade ?? null,
        finalsGrade: item.finals_grade ?? null,
        totalAverage: item.total_average ?? null,
        isPrelimSubmitted: !!item.prelim_grade,
        isMidtermSubmitted: !!item.midterm_grade,
        isFinalsSubmitted: !!item.finals_grade,
        isGradesFinalized: !!item.is_grades_finalized,
        remarks: item.remarks ?? null,
      }));
      console.log("[class-grades] Mapped grades", { count: grades.length });
      return Response.json({ grades });
    } catch (error) {
      console.error("[class-grades] GET error", { message: error instanceof Error ? error.message : String(error) });
      set.status = 500;
      return Response.json({ error: "Failed to fetch grades", message: error instanceof Error ? error.message : String(error), grades: [] }, { status: 500 });
    }
  })
  .post("/", async ({ params, body, set }) => {
    try {
      const { classId } = params as { classId: string };
      const { enrollmentId, term, grade, totalAverage, remarks } = body as { enrollmentId: string; term?: "prelim" | "midterm" | "finals"; grade?: number | null; totalAverage?: number; remarks?: string };
      console.log("[class-grades] POST save grade", { classId, enrollmentId, term, grade, totalAverage, remarksPresent: typeof remarks === "string" });

      if (!enrollmentId) {
        set.status = 400;
        return { error: "Missing enrollmentId" };
      }
      if (!term && totalAverage === undefined && remarks === undefined) {
        set.status = 400;
        return { error: "No fields to update" };
      }
      if (term && grade === undefined) {
        set.status = 400;
        return { error: "Missing grade for term" };
      }

      const payload: Record<string, any> = {};
      if (term) {
        const field = term === "prelim" ? "prelim_grade" : term === "midterm" ? "midterm_grade" : "finals_grade";
        payload[field] = grade ?? null;
      }
      if (typeof totalAverage === "number") payload.total_average = totalAverage;
      if (typeof remarks === "string") payload.remarks = remarks;

      try {
        console.log("[class-grades] Using laravelApi updateClassEnrollment", { enrollmentId, payload });
        await laravelApi.updateClassEnrollment(enrollmentId, payload);
      } catch (e) {
        const base = (process.env.DCCP_API_URL || "https://admin.dccp.edu.ph").replace(/\/$/, "");
        const url = `${base}/api/class-enrollments/${enrollmentId}`;
        const tokenPresent = Boolean(process.env.DCCP_API_TOKEN);
        console.warn("[class-grades] Client update failed, falling back to direct PUT", { url, tokenPresent });
        const res = await fetch(url, {
          method: "PUT",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${(process.env.DCCP_API_TOKEN || "").replace(/^\s*["']|["']\s*$/g, "")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
        console.log("[class-grades] Fallback update response", { status: res.status, ok: res.ok });
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(`Laravel ${res.status}: ${res.statusText} ${txt}`);
        }
      }
      return { success: true };
    } catch (error) {
      console.error("[class-grades] POST error", { message: error instanceof Error ? error.message : String(error) });
      set.status = 500;
      return { error: "Failed to save grade", message: error instanceof Error ? error.message : String(error) };
    }
  }, {
    body: t.Object({
      enrollmentId: t.String(),
      term: t.Optional(t.Union([t.Literal("prelim"), t.Literal("midterm"), t.Literal("finals")])),
      grade: t.Nullable(t.Number()),
      totalAverage: t.Optional(t.Number()),
      remarks: t.Optional(t.String()),
    })
  })
  .post("/finalize", async ({ params, body, set }) => {
    try {
      const { classId } = params as { classId: string };
      const { term } = body as { term: "prelim" | "midterm" | "finals" };
      console.log("[class-grades] POST finalize", { classId, term });

      const enrollments = await laravelApi.getClassEnrollmentsByClassId(classId);
      const items = enrollments?.data || [];
      console.log("[class-grades] Finalize items", { count: items.length });

      await Promise.all(items.map(async (item: any) => {
        try {
          console.log("[class-grades] Finalizing via client", { enrollmentId: item.id });
          await laravelApi.updateClassEnrollment(item.id, { is_grades_finalized: true });
        } catch {
          const base = (process.env.DCCP_API_URL || "https://admin.dccp.edu.ph").replace(/\/$/, "");
          const url = `${base}/api/class-enrollments/${item.id}`;
          const tokenPresent = Boolean(process.env.DCCP_API_TOKEN);
          console.warn("[class-grades] Client finalize failed, falling back to direct PUT", { url, tokenPresent });
          await fetch(url, {
            method: "PUT",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${(process.env.DCCP_API_TOKEN || "").replace(/^\s*["']|["']\s*$/g, "")}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ is_grades_finalized: true }),
          });
        }
      }));

      return { success: true };
    } catch (error) {
      console.error("[class-grades] FINALIZE error", { message: error instanceof Error ? error.message : String(error) });
      set.status = 500;
      return { error: "Failed to finalize grades", message: error instanceof Error ? error.message : String(error) };
    }
  }, {
    body: t.Object({ term: t.Union([t.Literal("prelim"), t.Literal("midterm"), t.Literal("finals")]) })
  });
