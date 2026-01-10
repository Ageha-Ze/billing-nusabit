// This file can be used for global types that are used across the application.
// For example, types for API responses, or other shared structures.

export type ApiResponse<T> = {
  data: T | null;
  error: string | null;
};
