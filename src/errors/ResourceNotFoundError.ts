export class ResourceNotFoundError extends Error {
  public readonly code: number;

  constructor(message: string) {
    super(message);
    this.name = 'ResourceNotFoundError';
    this.code = 404;
  }
}
