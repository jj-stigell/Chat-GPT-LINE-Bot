// Project imports
import { HttpCode } from '../types/httpCode';

export class ApiError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: HttpCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }
}

export class InvalidCredentials extends Error {
  constructor() {
    super('invalid credentials');
  }
}
