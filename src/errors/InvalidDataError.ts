export class InvalidDataError extends Error {
  public readonly code: number;

  constructor(message: string) {
    super(message);
    this.name = 'InvalidDataError';
    this.code = 400;
  }
}
