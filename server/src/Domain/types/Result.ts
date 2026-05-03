export type Result<T> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string; statusCode: number };
