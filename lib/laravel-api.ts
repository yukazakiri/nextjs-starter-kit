// Laravel API client for Sanctum authentication
const LARAVEL_API_BASE_URL = process.env.DCCP_API_URL || "http://localhost:8000";
const LARAVEL_API_TOKEN = process.env.DCCP_API_TOKEN || "26|LAwmlRhI27abHoZKwOUwXDbLZssqY2uoHlk7smInb7c0a62b";

interface NextFetchRequestConfig {
    revalidate?: number | false;
    tags?: string[];
}

// Types based on Laravel API response structure
export interface LaravelClassDetails {
    data: {
        id: number;
        classification: string;
        is_college: boolean;
        is_shs: boolean;
        class_information: {
            section: string;
            subject_code: string;
            academic_year: string;
            formatted_academic_year: string;
            semester: string;
            formatted_semester: string;
            school_year: string;
            maximum_slots: number;
            enrolled_students: string;
            available_slots: any;
            is_full: boolean;
        };
        subject_information: Array<any>;
        course_information: {
            course_codes: Array<any>;
            formatted_course_codes: string;
            courses: string;
        };
        shs_information: {
            grade_level: string;
            track: {
                id: string;
                track_name: string;
                track_code: string;
            };
            strand: {
                id: string;
                strand_name: string;
                strand_code: string;
            };
            formatted_track_strand: string;
        };
        faculty_information: {
            id: string;
            full_name: string;
            first_name: string;
            middle_name: string;
            last_name: string;
            email: string;
            phone: string;
            avatar_url: string;
        };
        schedule_information: {
            formatted_weekly_schedule: string;
            schedules: Array<{
                id: number;
                day_of_week: string;
                start_time: string;
                end_time: string;
                formatted_start_time: string;
                formatted_end_time: string;
                time_range: string;
                room: {
                    id: string;
                    name: string;
                    building: string;
                    floor: string;
                    capacity: string;
                };
            }>;
        };
        enrolled_students: Array<{
            id: number;
            student_id: number;
            student: {
                id: string;
                student_id: string;
                full_name: string;
                first_name: string;
                middle_name: string;
                last_name: string;
                email: string;
                phone: string;
            };
            created_at: string;
            updated_at: string;
        }>;
        created_at: string;
        updated_at: string;
    };
}

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
        classes: LaravelClass[];
        account: string;
        department_relation: string;
        class_enrollments_count: number;
        classes_count: number;
    };
}

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
        this.token = token;
    }

    private getFromCache<T>(key: string): T | null {
        const cached = this.cache.get(key);
        if (cached) {
            const isExpired = Date.now() - cached.timestamp > this.CACHE_TTL;
            if (!isExpired) {
                console.log(`[CACHE] Hit for ${key}`);
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

        console.log(`[LARAVEL API] ${options.method || "GET"} ${url}`, {
            headers,
            body: options.body,
            next: options.next,
            cache: options.cache,
        });

        try {
            const response = await fetch(url, {
                ...options,
                headers,
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`[LARAVEL API] Error ${response.status}: ${response.statusText}`, errorText);

                // Special handling for faculty not found (404)
                if (response.status === 404 && endpoint.includes("/api/faculties/")) {
                    const facultyId = endpoint.split("/").pop();
                    console.error(`[LARAVEL API] Faculty not found: ${facultyId}`);
                    throw new Error(`Faculty not found: ${facultyId}`);
                }

                throw new Error(`Laravel API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            console.log(`[LARAVEL API] Response from ${endpoint}:`, data);

            return data;
        } catch (error) {
            console.error(`[LARAVEL API] Request failed for ${endpoint}:`, error);

            // Log network errors
            if (error instanceof Error && error.message.includes("fetch failed")) {
                console.error("Network Error: Unable to connect to Laravel API. Please check if the server is running.");
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

    async getClassAttendance(classId: number): Promise<LaravelAttendance[]> {
        return this.request<LaravelAttendance[]>(`/api/attendances/${classId}`);
    }

    async getClassDetails(
        classId: number,
        options?: { next?: NextFetchRequestConfig; cache?: RequestCache }
    ): Promise<LaravelClassDetails> {
        const cacheKey = `class_details_${classId}`;
        const cached = this.getFromCache<LaravelClassDetails>(cacheKey);
        if (cached) return cached;

        const data = await this.request<LaravelClassDetails>(`/api/classes/${classId}`, options);
        this.setCache(cacheKey, data);
        return data;
    }

    async getBatchClassDetails(
        classIds: number[],
        options?: { next?: NextFetchRequestConfig; cache?: RequestCache }
    ): Promise<Array<LaravelClassDetails>> {
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
        return results.filter((result): result is LaravelClassDetails => result !== null);
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
}

// Helper functions for data transformation
export class LaravelApiHelpers {
    static formatSchedule(classDetails: LaravelClassDetails): Array<{
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

    static getClassScheduleDisplay(classDetails: LaravelClassDetails): {
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

    static getClassEnrollmentCount(classDetails: LaravelClassDetails): number {
        const enrolledStudents = classDetails?.data?.enrolled_students || [];
        return enrolledStudents.length;
    }

    static getClassStatus(classDetails: LaravelClassDetails): { isFull: boolean; availableSlots: number } {
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

    static formatClassInfo(classDetails: LaravelClassDetails): {
        subjectCode: string;
        subjectName: string;
        section: string;
        semester: string;
        schoolYear: string;
        gradeLevel: string;
        track: string;
        strand: string;
    } {
        const classInfo = classDetails?.data?.class_information || {};
        const shsInfo = classDetails?.data?.shs_information || {};

        return {
            subjectCode: classInfo.subject_code || "N/A",
            subjectName: classDetails?.data?.course_information?.formatted_course_codes || "N/A",
            section: classInfo.section || "N/A",
            semester: classInfo.formatted_semester || "N/A",
            schoolYear: classInfo.formatted_academic_year || "N/A",
            gradeLevel: shsInfo.grade_level || "N/A",
            track: shsInfo.track?.track_name || "N/A",
            strand: shsInfo.strand?.strand_name || "N/A",
        };
    }
}

export const laravelApi = new LaravelApiClient();
export default LaravelApiClient;
