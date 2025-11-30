export interface Student {
    id: number;
    student_id: number;
    lrn: string;
    student_type: string;
    basic_information: {
        full_name: string;
        first_name: string;
        middle_name: string;
        last_name: string;
        suffix: string;
        email: string;
        phone: string;
        birth_date: string;
        age: number;
        gender: string;
        civil_status: string;
        nationality: string;
        religion: string;
    };
    academic_information: {
        academic_year: number;
        formatted_academic_year: string;
        course: {
            id: string;
            code: string;
            name: string;
            description: string;
        };
        status: string;
    };
    // Add other fields as needed based on the JSON response
}

export interface Faculty {
    id: string;
    faculty_id_number: string;
    first_name: string;
    last_name: string;
    middle_name: string;
    full_name: string;
    email: string;
    phone_number: string;
    department: string;
    // Add other fields as needed
}

interface DCCPResponse<T> {
    data: T;
}

const API_URL = process.env.DCCP_API_URL;
const API_TOKEN = process.env.DCCP_API_TOKEN;

export async function fetchDCCPUser(email: string): Promise<{
    type: "student" | "faculty" | null;
    data: Student | Faculty | null;
}> {
    if (!API_URL || !API_TOKEN) {
        console.error("DCCP_API_URL or DCCP_API_TOKEN is not defined");
        return { type: null, data: null };
    }

    const headers = {
        Authorization: `Bearer ${API_TOKEN}`,
        Accept: "application/json",
    };

    try {
        // Try finding student first
        // Assuming endpoint structure based on common Laravel patterns: /api/students?search=email or similar
        // The user didn't specify the exact endpoint for searching, so we'll try a likely candidate.
        // If Scramble is used, it often documents standard CRUD.
        // We might need to adjust this path.

        // Attempt 1: Search Students
        // We'll try to fetch all students filtered by email if the API supports it, or a specific search endpoint.
        // Given the user didn't provide the exact search endpoint, I'll assume a standard RESTful filter or a search endpoint.
        // Let's try a query param filter first which is common in Laravel APIs (e.g. Spatie QueryBuilder).

        const studentResponse = await fetch(`${API_URL}/api/students?filter[email]=${email}`, { headers });

        if (studentResponse.ok) {
            const data = await studentResponse.json();
            // Check if we got a list and it has items, or a single object
            if (data.data && Array.isArray(data.data) && data.data.length > 0) {
                return { type: "student", data: data.data[0] };
            } else if (data.data && !Array.isArray(data.data) && data.data.email === email) {
                return { type: "student", data: data.data };
            }
        }

        // If not found in students, try faculty
        const facultyResponse = await fetch(`${API_URL}/api/faculty?filter[email]=${email}`, { headers });

        if (facultyResponse.ok) {
            const data = await facultyResponse.json();
            if (data.data && Array.isArray(data.data) && data.data.length > 0) {
                return { type: "faculty", data: data.data[0] };
            } else if (data.data && !Array.isArray(data.data) && data.data.email === email) {
                return { type: "faculty", data: data.data };
            }
        }
    } catch (error) {
        console.error("Error fetching DCCP user:", error);
    }

    return { type: null, data: null };
}
