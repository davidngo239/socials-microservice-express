import { Response } from "express";
import { ZodError } from "zod";

// export class BaseError extends Error {
//   readonly status: number
//   readonly type: 'DB' | 'Custom'
//   constructor(type: 'DB' | 'Custom', description: string, status: number) {
//     super(description)

//     this.status = status
//     this.type = type
//     Object.setPrototypeOf(this, new.target.prototype)
//     Error.captureStackTrace(this)
//   }
// }

// export class CustomError extends BaseError {
//   constructor(description = 'Not found.', status: number = 400) {
//     super('Custom', description, status)

//     Object.setPrototypeOf(this, new.target.prototype)
//   }
// }

// export class DBError extends BaseError {
//   constructor(description = 'Database error.', status: number = 500) {
//     super('DB', description, status)

//     Object.setPrototypeOf(this, new.target.prototype)
//   }
// }

// AppError
export class AppError extends Error {
  private statusCode: number = 500;
  private rootCause?: Error;

  private details: Record<string, any> = {};
  private logMessage?: string;

  private constructor(err: Error, options?: ErrorOptions) {
    super(err.message, options);
  }

  // Factory method (Design Pattern)
  static from(err: Error, statusCode: number = 500) {
    const appError = new AppError(err);
    appError.statusCode = statusCode;
    return appError;
  }

  getRootCause(): Error | null {
    if (this.rootCause) {
      return this.rootCause instanceof AppError ? this.rootCause.getRootCause() : this.rootCause;
    }

    return null;
  }

  // Wrapper (Design Pattern)
  wrap(rootCause: Error): AppError {
    const appError = AppError.from(this, this.statusCode);
    appError.rootCause = rootCause;
    return appError;
  }

  // setter chain
  withDetail(key: string, value: any): AppError {
    this.details[key] = value;
    return this;
  }

  withLog(logMessage: string): AppError {
    this.logMessage = logMessage;
    return this;
  }

  withMessage(message: string): AppError {
    this.message = message;
    return this;
  }

  toJSON(isProduction: boolean = true) {
    const rootCause = this.getRootCause();

    return isProduction ? {
      message: this.message,
      statusCode: this.statusCode,
      details: this.details,
    } : {
      message: this.message,
      statusCode: this.statusCode,
      rootCause: rootCause ? rootCause.message : this.message,
      details: this.details,
      logMessage: this.logMessage,
    };
  }

  getStatusCode(): number {
    return this.statusCode;
  }
}

// Util error function
export const responseErr = (err: Error, res: Response) => {
  const isProduction = process.env.NODE_ENV === 'production';
  !isProduction && console.error(err.stack);

  if (err instanceof AppError) {
    const appErr = err as AppError;
    res.status(appErr.getStatusCode()).json(appErr.toJSON(isProduction));

    return;
  }

  if (err instanceof ZodError) {
    const zErr = err as ZodError;
    const appErr = ErrInvalidRequest.wrap(zErr);

    zErr.issues.forEach((issue) => {
      appErr.withDetail(issue.path.join('.'), issue.message);
    });

    res.status(appErr.getStatusCode()).json(appErr.toJSON(isProduction));
    return;
  }

  const appErr = ErrInternalServer.wrap(err);
  res.status(appErr.getStatusCode()).json(appErr.toJSON(isProduction));
};

export const ErrInternalServer = AppError.from(new Error('Something went wrong, please try again later.'), 500);
export const ErrInvalidRequest = AppError.from(new Error('Invalid request'), 400);
export const ErrUnauthorized = AppError.from(new Error('Unauthorized'), 401);
export const ErrForbidden = AppError.from(new Error('Forbidden'), 403);
export const ErrNotFound = AppError.from(new Error('Not found'), 404);
export const ErrMethodNotAllowed = AppError.from(new Error('Method not allowed'), 405);
export const ErrTokenInvalid = AppError.from(new Error('Token is invalid'), 401);

