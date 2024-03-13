export enum ApiErrorType {
  UNAUTHORIZED = 'UNAUTHORIZED',
  USAGE_LIMIT = 'USAGE_LIMIT',
  NOT_FOUND = 'NOT_FOUND',
  INVALID_REQUEST = 'INVALID_REQUEST',
  WEBPAGE_IS_SITEMAP = 'WEBPAGE_IS_SITEMAP',
  EMPTY_DATASOURCE = 'EMPTY_DATASOURCE',
  ALREADY_INVITED = 'ALREADY_INVITED',
  INTEGRATION_CREDENTIALS_INVALID = 'INTEGRATION_CREDENTIALS_INVALID',
  INTEGRATION_VALIDATION_FAILED = 'INTEGRATION_VALIDATION_FAILED',
  RATE_LIMIT = 'RATE_LIMIT',
  NOT_IMPLEMENTED = 'NOT_IMPLEMENTED',
  PREMIUM_FEATURE = 'PREMIUM_FEATURE',
}

export class ApiError extends Error {
  constructor(message: ApiErrorType, public status?: number) {
    super(message);

    if (!status) {
      switch (message) {
        case ApiErrorType.UNAUTHORIZED:
          this.status = 403;
          break;
        case ApiErrorType.USAGE_LIMIT:
        case ApiErrorType.PREMIUM_FEATURE:
          this.status = 402;
          break;
        case ApiErrorType.NOT_FOUND:
          this.status = 404;
          break;
        case ApiErrorType.INVALID_REQUEST:
          this.status = 400;
          break;
        case ApiErrorType.EMPTY_DATASOURCE:
          this.status = 400;
          break;
        case ApiErrorType.ALREADY_INVITED:
        case ApiErrorType.INTEGRATION_VALIDATION_FAILED:
          this.status = 400;
          break;
        case ApiErrorType.INTEGRATION_CREDENTIALS_INVALID:
          this.status = 403;
          break;
        case ApiErrorType.RATE_LIMIT:
          this.status = 429;
          break;
        case ApiErrorType.NOT_IMPLEMENTED:
          this.status = 501;
          break;
        default:
          this.status = 500;
          break;
      }
    }

    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export const isApiError = (e: unknown): e is ApiError => e instanceof ApiError;
