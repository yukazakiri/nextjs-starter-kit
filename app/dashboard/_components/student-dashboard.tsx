import { DashboardStats } from "./dashboard-stats";
import { CourseList } from "./course-list";
import { AssignmentList } from "./assignment-list";
import { ScheduleWidget } from "./schedule-widget";

export function StudentDashboard() {
    return (
        <div className="flex flex-col gap-6 p-6">
            <div>
                <h1 className="text-3xl font-semibold tracking-tight">
                    Welcome back, Student!
                </h1>
                <p className="text-muted-foreground mt-2">
                    Here&apos;s what&apos;s happening with your courses today.
                </p>
            </div>

            <DashboardStats />

            <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
                <CourseList />
                <div className="space-y-6">
                    <ScheduleWidget />
                    <AssignmentList />
                </div>
            </div>
        </div>
    );
}
