export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.status = status;
    this.body = body ?? null;
  }
}

export function extractErrorMessage(body: any): string {
  if (!body) return "Request failed";
  if (typeof body.detail === "string") return body.detail;
  return "Request failed";
}
