export type Result<T> =
  | (T extends void
      ? { success: true; data?: T; message?: string }
      : { success: true; data: T; message?: string })
  | { success: false; error: string; statusCode: number };
