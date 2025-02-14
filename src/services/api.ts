export interface ApiResponse<T> {
  data: T;
  error?: {
    message: string;
    status: number;
  };
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  const url = `${baseUrl}/api${path}`;

  try {
    const response = await fetch(url, {
      credentials: "include",
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    const responseData = (await response.json()) as ApiResponse<T>;

    if (!response.ok) {
      throw new ApiError(
        response.status,
        responseData.error?.message || "An error occurred"
      );
    }

    return responseData.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      500,
      error instanceof Error ? error.message : "An error occurred"
    );
  }
}
