export class RequestError extends Error {
  constructor(message: string, public status?: number, public isValidationFailure?: boolean, public reason?: string) {
    super(message);
    this.name = 'RequestError';
  }
}
