import { toast } from "sonner";

/**
 * API Error Response interface
 */
export interface ApiErrorResponse {
    success: false;
    error: string;
    message: string;
    validationErrors?: Record<string, string[]>;
    details?: string;
}

/**
 * Handles API errors and displays appropriate Sonner notifications
 * @param response - The fetch Response object
 * @param result - The parsed JSON result (if available)
 * @param options - Optional configuration
 */
export async function handleApiError(
    response: Response,
    result?: Partial<ApiErrorResponse>,
    options?: {
        defaultMessage?: string;
        showDetails?: boolean;
    }
): Promise<void> {
    const { defaultMessage = "An error occurred", showDetails = true } = options || {};

    // Parse result if not provided
    if (!result) {
        try {
            result = await response.json();
        } catch {
            result = {};
        }
    }

    const status = response.status;

    // Handle different error types with specific notifications
    switch (status) {
        case 400:
            toast.error("Bad Request", {
                description: result.message || "The request was invalid. Please check your input.",
                duration: 5000,
            });
            break;

        case 401:
            toast.error("Authentication Error", {
                description: "Your session may have expired. Please refresh the page and try again.",
                duration: 5000,
            });
            break;

        case 403:
            toast.error("Access Denied", {
                description: "You don't have permission to perform this action.",
                duration: 5000,
            });
            break;

        case 404:
            toast.error("Not Found", {
                description: result.message || "The requested resource could not be found.",
                duration: 5000,
            });
            break;

        case 422:
            // Validation errors - show detailed feedback
            if (result.validationErrors && showDetails) {
                const errorList = Object.entries(result.validationErrors)
                    .slice(0, 3) // Show first 3 errors
                    .map(([field, messages]) => {
                        const fieldName = field.replace(/_/g, ' ').replace(/\./g, ' › ');
                        return `• ${fieldName}: ${messages[0]}`;
                    })
                    .join('\n');

                toast.error("Validation Error", {
                    description: errorList || result.message || "Please check your input and try again.",
                    duration: 6000,
                });
            } else {
                toast.error("Validation Error", {
                    description: result.message || "The given data was invalid.",
                    duration: 5000,
                });
            }
            break;

        case 429:
            toast.error("Too Many Requests", {
                description: "Please wait a moment before trying again.",
                duration: 5000,
            });
            break;

        case 500:
        case 502:
        case 503:
        case 504:
            toast.error("Server Error", {
                description: result.message || "Something went wrong on our end. Please try again later.",
                duration: 5000,
            });
            break;

        default:
            toast.error(result.error || "Error", {
                description: result.message || defaultMessage,
                duration: 5000,
            });
    }
}

/**
 * Handles network/connection errors
 * @param error - The caught error
 */
export function handleNetworkError(error: unknown): void {
    console.error("Network error:", error);

    if (error instanceof TypeError && error.message.includes("fetch")) {
        toast.error("Connection Error", {
            description: "Unable to reach the server. Please check your internet connection.",
            duration: 5000,
        });
    } else if (error instanceof Error) {
        toast.error("Request Failed", {
            description: error.message,
            duration: 5000,
        });
    } else {
        toast.error("Unexpected Error", {
            description: "Something went wrong. Please try again.",
            duration: 5000,
        });
    }
}

/**
 * Wrapper for fetch calls with automatic error handling
 * @param url - The URL to fetch
 * @param options - Fetch options
 * @returns The parsed JSON response
 */
export async function fetchWithErrorHandling<T = any>(
    url: string,
    options?: RequestInit
): Promise<{ data: T | null; success: boolean; error?: string }> {
    try {
        const response = await fetch(url, {
            headers: {
                "Content-Type": "application/json",
                ...options?.headers,
            },
            ...options,
        });

        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
            await handleApiError(response, result);
            return { data: null, success: false, error: result.message };
        }

        return { data: result as T, success: true };
    } catch (error) {
        handleNetworkError(error);
        return {
            data: null,
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
        };
    }
}

/**
 * Shows a success toast notification
 * @param title - The toast title
 * @param description - Optional description
 */
export function showSuccess(title: string, description?: string): void {
    toast.success(title, {
        description,
        duration: 3000,
    });
}

/**
 * Shows an info toast notification
 * @param title - The toast title
 * @param description - Optional description
 */
export function showInfo(title: string, description?: string): void {
    toast.info(title, {
        description,
        duration: 4000,
    });
}

/**
 * Shows a warning toast notification
 * @param title - The toast title
 * @param description - Optional description
 */
export function showWarning(title: string, description?: string): void {
    toast.warning(title, {
        description,
        duration: 5000,
    });
}

/**
 * Shows an error toast notification
 * @param title - The toast title
 * @param description - Optional description
 */
export function showError(title: string, description?: string): void {
    toast.error(title, {
        description,
        duration: 5000,
    });
}
