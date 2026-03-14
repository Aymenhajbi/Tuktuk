import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.BAD_REQUEST;
    let error = 'Database request failed';

    if (exception.code === 'P2002') {
      status = HttpStatus.CONFLICT;
      error = 'Unique constraint violation';
    } else if (exception.code === 'P2003') {
      status = HttpStatus.BAD_REQUEST;
      error = 'Foreign key violation';
    }

    response.status(status).json({
      error,
      code: exception.code,
      timestamp: new Date().toISOString(),
    });
  }
}
