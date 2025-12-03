import { Elysia } from "elysia";

export const academicPeriods = new Elysia({ prefix: "/academic-periods" }).get(
  "/",
  async () => {
    try {
      // Get the Laravel API URL and token from environment
      const baseURL = process.env.DCCP_API_URL || "http://localhost:8000";
      const token = process.env.DCCP_API_TOKEN;

      console.log("[ACADEMIC PERIODS] Config:", {
        baseURL,
        hasToken: !!token,
        tokenLength: token ? token.length : 0,
      });

      if (!token) {
        console.error("[ACADEMIC PERIODS] DCCP_API_TOKEN not configured");
        return {
          success: false,
          error: "API configuration error: DCCP_API_TOKEN is not set",
          data: [],
        };
      }

      if (!baseURL) {
        console.error("[ACADEMIC PERIODS] DCCP_API_URL not configured");
        return {
          success: false,
          error: "API configuration error: DCCP_API_URL is not set",
          data: [],
        };
      }

      // Forward request to Laravel API
      const response = await fetch(`${baseURL}/api/settings/service`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.error(
          `[ACADEMIC PERIODS] Laravel API error: ${response.status} ${response.statusText}`
        );
        const errorText = await response.text();
        console.error("[ACADEMIC PERIODS] Error response:", errorText);

        return {
          success: false,
          error: `Failed to fetch: ${response.statusText}`,
          data: [],
        };
      }

      const apiResponse = await response.json();
      console.log("[ACADEMIC PERIODS] Raw Laravel response:", apiResponse);

      // Laravel returns { message: "...", data: {...} }
      // We check if it has the data property (not success)
      if (!apiResponse.data) {
        return {
          success: false,
          error: apiResponse.message || "Invalid response format from Laravel API",
          data: [],
        };
      }

      const settings = apiResponse.data;
      console.log("[ACADEMIC PERIODS] Settings from Laravel:", {
        current_semester: settings.current_semester,
        current_school_year_start: settings.current_school_year_start,
        available_semesters: settings.available_semesters,
        available_school_years: settings.available_school_years,
      });

      // Transform the response to match expected format
      const academicPeriods = Object.entries(settings.available_school_years).map(
        ([startYear, label]) => ({
          schoolYear: startYear,
          label: label as string,
          semesters: Object.keys(settings.available_semesters),
        })
      );

      console.log("[ACADEMIC PERIODS] Transformed periods:", academicPeriods);

      // Sort school years in descending order (newest first)
      academicPeriods.sort((a, b) => parseInt(b.schoolYear) - parseInt(a.schoolYear));
      console.log("[ACADEMIC PERIODS] Sorted periods:", academicPeriods);

      return {
        success: true,
        data: academicPeriods,
        current: {
          semester: settings.current_semester?.toString() || "1",
          schoolYear: settings.current_school_year_start?.toString() || "2025",
          schoolYearString: settings.current_school_year_string || "2025 - 2026",
        },
        availableSemesters: settings.available_semesters,
        availableSchoolYears: settings.available_school_years,
      };
    } catch (error) {
      console.error("[ACADEMIC PERIODS] Error fetching settings:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error",
        data: [],
      };
    }
  }
);
