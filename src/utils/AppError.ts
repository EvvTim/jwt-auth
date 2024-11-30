import { HttpStatusCode } from "../constants/http";
import AppErrorCode from "../constants/appErrorCode";

class AppError extends Error {
  public readonly statusCode: HttpStatusCode;
  public readonly message: string;
  public readonly errorCode?: AppErrorCode;

  constructor(
    statusCode: HttpStatusCode,
    message: string,
    errorCode?: AppErrorCode,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.errorCode = errorCode;
    this.stack = new Error().stack;
  }
}

export default AppError;
