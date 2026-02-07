import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger
} from "@nestjs/common";
import { Request, Response } from "express";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;

    const message =
      typeof exceptionResponse === "object" &&
      exceptionResponse !== null &&
      "message" in exceptionResponse
        ? (exceptionResponse as { message: string | string[] }).message
        : "Internal server error";

    if (!(exception instanceof HttpException)) {
      const errorObj = exception as { message?: string; stack?: string };
      this.logger.error(
        `Unhandled exception on ${request.method} ${request.url}: ${errorObj?.message ?? "unknown error"}`,
        errorObj?.stack
      );
    }

    const isDevelopment = process.env.NODE_ENV !== "production";
    const debugMessage =
      isDevelopment && !(exception instanceof HttpException)
        ? (exception as { message?: string })?.message
        : undefined;

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: debugMessage ?? message
    });
  }
}
