// Laravel API client for Sanctum authentication
const LARAVEL_API_BASE_URL = process.env.DCCP_API_URL || "https://admin.dccp.edu.ph";
const LARAVEL_API_TOKEN = process.env.DCCP_API_TOKEN || "";

interface NextFetchRequestConfig {
    revalidate?: number | false;
    tags?: string[];
}

// --- New Interfaces based on User Request ---

export interface ClassInformation {
    section: string;
    subject_code: string;
    academic_year: string;
    formatted_academic_year: string;
    semester: string;
    formatted_semester: string;
    school_year: string;
    maximum_slots: number;
    enrolled_students: string; // The JSON shows this as string in class_information, but array in root. Keeping as string based on JSON.
    available_slots: any; // JSON shows empty object, could be number or object
    is_full: boolean;
}

export interface SubjectInformation {
    subject: any;
    type: string;
    subject_code: string;
    message: string;
}

export interface CourseInformation {
    course_codes: (string | null)[];
    formatted_course_codes: string;
    courses: string;
}

export interface TrackStrand {
    id: string;
    track_name?: string;
    track_code?: string;
    strand_name?: string;
    strand_code?: string;
}

export interface ShsInformation {
    grade_level: string;
    track: TrackStrand;
    strand: TrackStrand;
    formatted_track_strand: string;
}

export interface FacultyInformation {
    id: string;
    full_name: string;
    first_name: string;
    middle_name: string;
    last_name: string;
    email: string;
    phone: string;
    avatar_url: string;
}

export interface Room {
    id: string;
    name: string;
    building: string;
    floor: string;
    capacity: string;
}

export interface Schedule {
    id: number;
    day_of_week: string;
    start_time: string;
    end_time: string;
    formatted_start_time: string;
    formatted_end_time: string;
    time_range: string;
    room: Room;
}

export interface ScheduleInformation {
    formatted_weekly_schedule: string;
    schedules: Schedule[];
}

export interface Student {
    id: string;
    student_id: string;
    full_name: string;
    first_name: string;
    middle_name: string;
    last_name: string;
    email: string;
    phone: string;
}

export interface EnrolledStudent {
    id: number;
    student_id: number;
    student: Student;
    created_at: string;
    updated_at: string;
}

export interface ClassSettings {
    visual: {
        background_color: string;
        accent_color: string;
        banner_image: string;
        theme: string;
    };
    features: {
        enable_announcements: string;
        enable_grade_visibility: string;
        enable_attendance_tracking: string;
        allow_late_submissions: string;
        enable_discussion_board: string;
    };
    custom: string;
    raw: string;
}

export interface ClassData {
    id: number;
    classification: string;
    is_college: boolean;
    is_shs: boolean;
    class_information: ClassInformation;
    subject_information: SubjectInformation;
    course_information: CourseInformation;
    shs_information: ShsInformation;
    faculty_information: FacultyInformation;
    schedule_information: ScheduleInformation;
    enrolled_students: EnrolledStudent[];
    settings: ClassSettings;
    created_at: string;
    updated_at: string;
}

export interface LaravelClassResponse {
    data: ClassData;
}

export interface LaravelClassListResponse {
    data: ClassData[];
    links: {
        first: string;
        last: string;
        prev: string;
        next: string;
    };
    meta: {
        current_page: number;
        from: number;
        last_page: number;
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
        path: string;
        per_page: number;
        to: number;
        total: number;
    };
}

export interface ClassPostAttachment {
    id?: string;
    name: string;
    url: string;
    type: string;
    size?: number;
}

export interface ClassPost {
    id: number;
    class_id: number;
    title: string;
    content: string;
    type: "assignment" | "announcement" | "material" | "question";
    type_name: string;
    attachments: (ClassPostAttachment | null)[];
    class?: {
        id: string;
        section: string;
        subject_code: string;
    };
    created_at: string;
    updated_at: string;
    created_at_formatted: string;
    updated_at_formatted: string;
    author?: {
        name: string;
        avatar_url?: string;
    };
}

export interface ClassPostListResponse {
    data: ClassPost[];
    links?: {
        first: string;
        last: string;
        prev: string;
        next: string;
    };
    meta?: {
        current_page: number;
        from: number;
        last_page: number;
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
        path: string;
        per_page: number;
        to: number;
        total: number;
    };
}

// --- End New Interfaces ---

// Keeping some old interfaces if they are used elsewhere or for compatibility
// But LaravelClassDetails is now replaced/aliased to LaravelClassResponse for the new structure
export type LaravelClassDetails = LaravelClassResponse;

export interface LaravelFaculty {
    data: {
        id: string;
        faculty_id_number: string;
        first_name: string;
        last_name: string;
        middle_name: string;
        full_name: string;
        email: string;
        phone_number: string;
        department: string;
        office_hours: string;
        birth_date: string;
        address_line1: string;
        biography: string;
        education: string;
        courses_taught: string;
        photo_url: string;
        status: string;
        gender: string;
        age: number;
        created_at: string;
        updated_at: string;
        classes: LaravelClass[]; // This might need to be updated if faculty classes list also changed structure
        account: string;
        department_relation: string;
        class_enrollments_count: number;
        classes_count: number;
    };
}

// This was the old class interface, keeping it for now but it might be superseded by ClassData
export interface LaravelClass {
    id: number;
    subject_code: string;
    subject_title: string;
    section: string;
    school_year: string;
    semester: string;
    classification: string;
    maximum_slots: number;
    grade_level: string;
    student_count: string;
    display_info: string;
}

export interface LaravelStudent {
    id: string;
    student_id: string;
    first_name: string;
    last_name: string;
    middle_name: string;
    email: string;
    phone?: string;
    // Add other fields as needed
}

export interface LaravelGrade {
    id: string;
    student_id: string;
    class_id: number;
    prelim_grade?: number;
    midterm_grade?: number;
    finals_grade?: number;
    total_average?: number;
    remarks?: string;
    first_name?: string;
    last_name?: string;
    // Add other fields as needed
}

export interface LaravelAttendance {
    id: string;
    student_id: string;
    class_id: number;
    date: string;
    status: "present" | "absent" | "late" | "excused";
    // Add other fields as needed
}

class LaravelApiClient {
    private baseURL: string;
    private token: string;
    private cache = new Map<string, { data: any; timestamp: number }>();
    private CACHE_TTL = 5 * 60 * 1000; // 5 minutes

    constructor(baseURL: string = LARAVEL_API_BASE_URL, token: string = LARAVEL_API_TOKEN) {
        this.baseURL = baseURL;
        this.token = typeof token === "string" ? token.replace(/^\s*["']|["']\s*$/g, "") : token;
    }

    private getFromCache<T>(key: string): T | null {
        const cached = this.cache.get(key);
        if (cached) {
            const isExpired = Date.now() - cached.timestamp > this.CACHE_TTL;
            if (!isExpired) {
                return cached.data as T;
            }
            this.cache.delete(key);
        }
        return null;
    }

    private setCache(key: string, data: any): void {
        this.cache.set(key, { data, timestamp: Date.now() });
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit & { next?: NextFetchRequestConfig } = {}
    ): Promise<T> {
        // Remove trailing slash to prevent double slashes
        const baseURL = this.baseURL.endsWith("/") ? this.baseURL.slice(0, -1) : this.baseURL;
        const url = `${baseURL}${endpoint}`;

        const headers: HeadersInit = {
            Accept: "application/json",
            Authorization: `Bearer ${this.token}`,
            "Content-Type": "application/json",
            ...options.headers,
        };

        try {
            const response = await fetch(url, {
                ...options,
                headers,
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`[LARAVEL API] Error ${response.status}: ${response.statusText}`, errorText);

                // Try to parse the error response as JSON for better error messages
                let errorData: any = null;
                try {
                    errorData = JSON.parse(errorText);
                } catch {
                    // Not JSON, use raw text
                }

                // Special handling for validation errors (422)
                if (response.status === 422 && errorData) {
                    const validationErrors = errorData.errors || {};
                    const errorMessages = Object.entries(validationErrors)
                        .map(([field, messages]) => {
                            const fieldMessages = Array.isArray(messages) ? messages : [messages];
                            return `${field}: ${fieldMessages.join(', ')}`;
                        })
                        .join('\n');

                    const error = new Error(errorData.message || 'Validation failed');
                    (error as any).status = 422;
                    (error as any).validationErrors = validationErrors;
                    (error as any).details = errorMessages;
                    throw error;
                }

                // Special handling for faculty not found (404)
                if (response.status === 404 && endpoint.includes("/api/faculties/")) {
                    const facultyId = endpoint.split("/").pop();
                    console.error(`[LARAVEL API] Faculty not found: ${facultyId}`);
                    throw new Error(`Faculty not found: ${facultyId}`);
                }

                // General error with message from API if available
                const errorMessage = errorData?.message || `Laravel API error: ${response.status} ${response.statusText}`;
                const error = new Error(errorMessage);
                (error as any).status = response.status;
                throw error;
            }

            const data = await response.json();

            return data;
        } catch (error) {
            console.error(`[LARAVEL API] Request failed for ${endpoint}:`, error);

            // Log network errors
            if (error instanceof Error && error.message.includes("fetch failed")) {
                console.error(
                    "Network Error: Unable to connect to Laravel API. Please check if the server is running."
                );
            }

            throw error;
        }
    }

    async getFaculty(
        facultyId: string,
        options?: { next?: NextFetchRequestConfig; cache?: RequestCache }
    ): Promise<LaravelFaculty> {
        try {
            return await this.request<LaravelFaculty>(`/api/faculties/${facultyId}`, options);
        } catch (error) {
            // If faculty not found, don't try fallback - throw the original error
            // This will redirect user to onboarding to complete their setup properly
            console.error("[LARAVEL API] Faculty not found with ID:", facultyId);
            throw error;
        }
    }

    async getFacultyClasses(facultyId: string): Promise<LaravelClass[]> {
        const faculty = await this.getFaculty(facultyId);
        return faculty.data.classes;
    }

    async getClassStudents(classId: number): Promise<LaravelStudent[]> {
        return this.request<LaravelStudent[]>(`/api/classes/${classId}/students`);
    }

    async getClassGrades(classId: number): Promise<LaravelGrade[]> {
        return this.request<LaravelGrade[]>(`/api/classes/${classId}/grades`);
    }

    async updateGrade(gradeId: string, gradeData: Partial<LaravelGrade>): Promise<void> {
        return this.request<void>(`/api/grades/${gradeId}`, {
            method: "PUT",
            body: JSON.stringify(gradeData),
        });
    }

    async getClassEnrollmentsByClassId(classId: string | number): Promise<{
        data: Array<{
            id: number;
            class_id: number;
            student_id: number;
            completion_date: string | null;
            status: string | boolean;
            remarks: string | null;
            prelim_grade: number | null;
            midterm_grade: number | null;
            finals_grade: number | null;
            total_average: number | null;
            is_grades_finalized: boolean;
            is_grades_verified: boolean;
            verified_by: number | null;
            verified_at: string | null;
            verification_notes: string | null;
            letter_grade: string | null;
            grade_point: number | null;
            is_passing: boolean | null;
            has_all_grades: string | null;
            class: {
                id: string;
                section: string;
                subject_code: string;
                subject_title: string;
                faculty: string;
            };
            student: {
                id: string;
                student_id: string;
                full_name: string;
                first_name: string;
                last_name: string;
                email: string;
            };
            created_at: string;
            updated_at: string;
            created_at_formatted?: string;
            updated_at_formatted?: string;
            completion_date_formatted?: string;
            verified_at_formatted?: string;
        }>;
        links?: any;
        meta?: any;
    }> {
        return this.request(`/api/class-enrollments/class/${classId}`);
    }

    async updateClassEnrollment(enrollmentId: string | number, payload: Record<string, any>): Promise<any> {
        return this.request(`/api/class-enrollments/${enrollmentId}`, {
            method: "PUT",
            body: JSON.stringify(payload),
        });
    }

    async getClassAttendance(classId: number): Promise<LaravelAttendance[]> {
        return this.request<LaravelAttendance[]>(`/api/attendances/${classId}`);
    }

    async getClassDetails(
        classId: number,
        options?: { next?: NextFetchRequestConfig; cache?: RequestCache }
    ): Promise<LaravelClassResponse> {
        const cacheKey = `class_details_${classId}`;
        const cached = this.getFromCache<LaravelClassResponse>(cacheKey);
        if (cached) return cached;

        const data = await this.request<LaravelClassResponse>(`/api/classes/${classId}`, options);
        this.setCache(cacheKey, data);
        return data;
    }

    async getClasses(options?: {
        next?: NextFetchRequestConfig;
        cache?: RequestCache;
    }): Promise<LaravelClassListResponse> {
        return this.request<LaravelClassListResponse>(`/api/classes`, options);
    }

    async getBatchClassDetails(
        classIds: number[],
        options?: { next?: NextFetchRequestConfig; cache?: RequestCache }
    ): Promise<Array<LaravelClassResponse>> {
        // Create array of promises for parallel fetching
        const promises = classIds.map(id =>
            this.getClassDetails(id, options).catch(error => {
                console.error(`Error fetching class ${id}:`, error);
                return null;
            })
        );

        // Execute all requests in parallel
        const results = await Promise.all(promises);

        // Filter out null results (failed requests)
        return results.filter((result): result is LaravelClassResponse => result !== null);
    }

    async getSettings(): Promise<{
        current_semester: string;
        current_school_year_start: string;
        current_school_year_string: string;
        available_semesters: Record<string, string>;
        available_school_years: Record<string, string>;
    }> {
        return this.request(`/api/settings/service`);
    }

    async markAttendance(attendanceData: Omit<LaravelAttendance, "id">): Promise<void> {
        return this.request<void>(`/api/attendance`, {
            method: "POST",
            body: JSON.stringify(attendanceData),
        });
    }

    async getFacultyAssignments(facultyId: string): Promise<any[]> {
        return this.request<any[]>(`/api/faculties/${facultyId}/assignments`);
    }

    async createAssignment(classId: number, assignmentData: any): Promise<void> {
        return this.request<void>(`/api/classes/${classId}/assignments`, {
            method: "POST",
            body: JSON.stringify(assignmentData),
        });
    }

    async getStudentDetails(studentId: string | number): Promise<any> {
        return this.request<any>(`/api/students/${studentId}`);
    }

    async updateClassSettings(classId: number, settings: any): Promise<any> {
        // First, fetch the current class details to get all required fields
        const classDetails = await this.getClassDetails(classId);

        if (!classDetails?.data) {
            throw new Error("Class not found");
        }

        const classData = classDetails.data;

        // Prepare the update payload with all required fields
        // Laravel requires ALL these fields even for a settings-only update
        const updatePayload = {
            subject_code: classData.class_information.subject_code,
            faculty_id: classData.faculty_information.id,
            academic_year: classData.class_information.academic_year,
            semester: classData.class_information.semester,
            schedule_id: classData.schedule_information.schedules[0]?.id?.toString() || "",
            school_year: classData.class_information.school_year,
            course_codes: classData.course_information.course_codes.join(","),
            section: classData.class_information.section,
            room_id: classData.schedule_information.schedules[0]?.room?.id?.toString() || "",
            classification: classData.classification,
            maximum_slots: classData.class_information.maximum_slots.toString(),
            // For college classes, these SHS fields should be null, not empty strings
            shs_track_id: classData.is_college ? null : (classData.shs_information?.track?.id || ""),
            shs_strand_id: classData.is_college ? null : (classData.shs_information?.strand?.id || ""),
            grade_level: classData.is_college ? null : (classData.shs_information?.grade_level || ""),
            subject_id: classData.subject_information?.subject?.id?.toString() || "",
            subject_ids: classData.subject_information?.subject?.id?.toString() || "",
            settings: {
                theme: settings.theme || "default",
                background_color: settings.background_color || "",
                accent_color: settings.accent_color || "",
                banner_image: settings.banner_image || "",
                enable_announcements: settings.enable_announcements ?? true,
                enable_grade_visibility: settings.enable_grade_visibility ?? true,
                enable_attendance_tracking: settings.enable_attendance_tracking ?? true,
                allow_late_submissions: settings.allow_late_submissions ?? false,
                enable_discussion_board: settings.enable_discussion_board ?? false,
                custom: [],
            },
        };

        return this.request<any>(`/api/classes/${classId}`, {
            method: "PUT",
            body: JSON.stringify(updatePayload),
        });
    }

    async getClassPosts(classId: string): Promise<ClassPostListResponse> {
        return this.request<ClassPostListResponse>(`/api/class-posts/class/${classId}`);
    }

    async createClassPost(postData: FormData): Promise<any> {
        // We need to handle FormData manually because our request wrapper sets Content-Type to application/json by default
        // and we need to let the browser/fetch set the boundary for multipart/form-data

        const url = `${this.baseURL}/api/class-posts`;

        const headers: HeadersInit = {
            Accept: "application/json",
            Authorization: `Bearer ${this.token}`,
            // Do NOT set Content-Type here, let fetch set it with boundary
        };

        const response = await fetch(url, {
            method: "POST",
            headers,
            body: postData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[LARAVEL API] Error ${response.status}: ${response.statusText}`, errorText);
            throw new Error(`Laravel API error: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    }

    async deleteClassPost(postId: string | number): Promise<any> {
        return this.request(`/api/class-posts/${postId}`, {
            method: "DELETE",
        });
    }

    async updateClassPost(postId: string | number, data: any): Promise<any> {
        return this.request(`/api/class-posts/${postId}`, {
            method: "PUT",
            body: JSON.stringify(data),
        });
    }

    async addClassPostAttachment(postId: string | number, attachmentData: FormData): Promise<any> {
        const url = `${this.baseURL}/api/class-posts/${postId}/attachments`;

        const headers: HeadersInit = {
            Accept: "application/json",
            Authorization: `Bearer ${this.token}`,
        };

        const response = await fetch(url, {
            method: "POST",
            headers,
            body: attachmentData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[LARAVEL API] Error ${response.status}: ${response.statusText}`, errorText);
            throw new Error(`Laravel API error: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    }
}

// Helper functions for data transformation
export class LaravelApiHelpers {
    static formatClassInfoForClassData(classDetails: ClassData): {
        subjectCode: string;
        subjectName: string;
        section: string;
        semester: string;
        schoolYear: string;
        gradeLevel: string;
        track: string;
        strand: string;
        semesterFormatted: string;
    } {
        const classInfo = classDetails?.class_information || {};
        const shsInfo = classDetails?.shs_information || {};

        return {
            subjectCode: classInfo.subject_code || "N/A",
            subjectName: classDetails?.course_information?.formatted_course_codes || "N/A",
            section: classInfo.section || "N/A",
            semester: classInfo.semester || "N/A", // Raw semester value for filtering (e.g., "2")
            semesterFormatted: classInfo.formatted_semester || "N/A", // Formatted for display (e.g., "2nd")
            schoolYear: classInfo.school_year || "N/A", // Use school_year, not formatted_academic_year
            gradeLevel: shsInfo.grade_level || "N/A",
            track: shsInfo.track?.track_name || "N/A",
            strand: shsInfo.strand?.strand_name || "N/A",
        };
    }

    static formatSchedule(classDetails: LaravelClassResponse): Array<{
        day: string;
        startTime: string;
        endTime: string;
        timeRange: string;
        room: {
            id: string;
            name: string;
            building: string;
            floor: string;
            capacity: string;
        };
    }> {
        if (!classDetails?.data?.schedule_information?.schedules) {
            return [];
        }

        return classDetails.data.schedule_information.schedules.map(schedule => ({
            day: schedule.day_of_week,
            startTime: schedule.formatted_start_time,
            endTime: schedule.formatted_end_time,
            timeRange: schedule.time_range,
            room: {
                id: schedule.room.id,
                name: schedule.room.name,
                building: schedule.room.building,
                floor: schedule.room.floor,
                capacity: schedule.room.capacity,
            },
        }));
    }

    static getClassScheduleDisplay(classDetails: LaravelClassResponse): {
        formatted: string;
        schedules: Array<{
            day: string;
            startTime: string;
            endTime: string;
            timeRange: string;
            room: {
                id: string;
                name: string;
                building: string;
                floor: string;
                capacity: string;
            };
        }>;
    } {
        const schedules = LaravelApiHelpers.formatSchedule(classDetails);
        return {
            formatted: classDetails?.data?.schedule_information?.formatted_weekly_schedule || "No schedule available",
            schedules: schedules,
        };
    }

    static getClassEnrollmentCount(classDetails: LaravelClassResponse): number {
        const enrolledStudents = classDetails?.data?.enrolled_students || [];
        return enrolledStudents.length;
    }

    static getClassStatus(classDetails: LaravelClassResponse): { isFull: boolean; availableSlots: number } {
        const enrollmentCount = LaravelApiHelpers.getClassEnrollmentCount(classDetails);
        const maxSlots = classDetails?.data?.class_information?.maximum_slots || 0;
        const isFull = classDetails?.data?.class_information?.is_full || false;

        return {
            isFull,
            availableSlots: isFull ? 0 : Math.max(0, maxSlots - enrollmentCount),
        };
    }

    static formatFacultyName(facultyInfo: any): string {
        if (!facultyInfo?.data?.faculty_information?.full_name) {
            return "Unknown Faculty";
        }
        return facultyInfo.data.faculty_information.full_name;
    }

    static formatClassInfo(classDetails: LaravelClassResponse): {
        subjectCode: string;
        subjectName: string;
        section: string;
        semester: string;
        schoolYear: string;
        gradeLevel: string;
        track: string;
        strand: string;
        semesterFormatted: string;
    } {
        const classInfo = classDetails?.data?.class_information || {};
        const shsInfo = classDetails?.data?.shs_information || {};

        return {
            subjectCode: classInfo.subject_code || "N/A",
            subjectName: classDetails?.data?.course_information?.formatted_course_codes || "N/A",
            section: classInfo.section || "N/A",
            semester: classInfo.semester || "N/A", // Raw semester value for filtering (e.g., "2")
            semesterFormatted: classInfo.formatted_semester || "N/A", // Formatted for display (e.g., "2nd")
            schoolYear: classInfo.school_year || classInfo.formatted_academic_year || "N/A", // Prefer school_year
            gradeLevel: shsInfo.grade_level || "N/A",
            track: shsInfo.track?.track_name || "N/A",
            strand: shsInfo.strand?.strand_name || "N/A",
        };
    }
}

export const laravelApi = new LaravelApiClient();
export default LaravelApiClient;
