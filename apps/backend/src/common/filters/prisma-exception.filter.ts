import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { Prisma } from '@prisma/client';

@Catch(Prisma.PrismaClientKnownRequestError, Prisma.PrismaClientValidationError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(
    exception: Prisma.PrismaClientKnownRequestError | Prisma.PrismaClientValidationError,
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Database operation failed';
    let error = 'Prisma Error';

    const isValidationError = 
      exception instanceof Prisma.PrismaClientValidationError || 
      (exception as any).name === 'PrismaClientValidationError';

    if (isValidationError) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Invalid data provided for database operation';
      error = 'Prisma Validation Error';
      
      // Log the specific validation error for debugging
      this.logger.error(`Prisma Validation Error: ${exception.message}`);
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
      case 'P2000':
        status = HttpStatus.BAD_REQUEST;
        message = 'The provided value is too long for the column';
        error = 'Value Too Long';
        break;
      case 'P2001':
        status = HttpStatus.NOT_FOUND;
        message = 'The record searched for does not exist';
        error = 'Record Not Found';
        break;
      case 'P2002':
        status = HttpStatus.CONFLICT;
        message = `Unique constraint failed: ${(exception.meta?.target as string[])?.join(', ')}`;
        error = 'Unique Constraint Violation';
        break;
      case 'P2003':
        status = HttpStatus.CONFLICT;
        message = 'Foreign key constraint failed';
        error = 'Foreign Key Violation';
        break;
      case 'P2004':
        status = HttpStatus.BAD_REQUEST;
        message = 'A constraint failed on the database';
        error = 'Constraint Violation';
        break;
      case 'P2005':
        status = HttpStatus.BAD_REQUEST;
        message = 'The value stored in the database is invalid for this field';
        error = 'Invalid Value';
        break;
      case 'P2006':
        status = HttpStatus.BAD_REQUEST;
        message = 'The provided value is not valid for this field';
        error = 'Invalid Field Value';
        break;
      case 'P2007':
        status = HttpStatus.BAD_REQUEST;
        message = 'Data validation failed';
        error = 'Validation Error';
        break;
      case 'P2008':
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = 'Failed to validate the query';
        error = 'Query Validation Error';
        break;
      case 'P2009':
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = 'Failed to validate the data model';
        error = 'Data Model Validation Error';
        break;
      case 'P2010':
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = 'Raw query failed';
        error = 'Query Execution Error';
        break;
      case 'P2011':
        status = HttpStatus.CONFLICT;
        message = 'A required relation is missing';
        error = 'Required Relation Missing';
        break;
      case 'P2012':
        status = HttpStatus.BAD_REQUEST;
        message = 'Missing required value';
        error = 'Missing Required Value';
        break;
      case 'P2013':
        status = HttpStatus.BAD_REQUEST;
        message = 'Missing required argument';
        error = 'Missing Required Argument';
        break;
      case 'P2014':
        status = HttpStatus.CONFLICT;
        message =
          'The change you are trying to make would violate a required relation';
        error = 'Required Relation Violation';
        break;
      case 'P2015':
        status = HttpStatus.NOT_FOUND;
        message = 'Related record not found';
        error = 'Related Record Not Found';
        break;
      case 'P2016':
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = 'Query interpretation error';
        error = 'Query Interpretation Error';
        break;
      case 'P2017':
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = 'The records for a relation are not connected';
        error = 'Disconnected Relation';
        break;
      case 'P2018':
        status = HttpStatus.NOT_FOUND;
        message = 'The required connected records were not found';
        error = 'Connected Records Not Found';
        break;
      case 'P2019':
        status = HttpStatus.BAD_REQUEST;
        message = 'Input error';
        error = 'Input Error';
        break;
      case 'P2020':
        status = HttpStatus.BAD_REQUEST;
        message = 'Value out of range';
        error = 'Value Out Of Range';
        break;
      case 'P2021':
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = 'The table does not exist in the current database';
        error = 'Table Not Found';
        break;
      case 'P2022':
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = 'The column does not exist in the current database';
        error = 'Column Not Found';
        break;
      case 'P2023':
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = 'Inconsistent column data';
        error = 'Inconsistent Column Data';
        break;
      case 'P2024':
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = 'The timeout during database operation exceeded';
        error = 'Operation Timeout';
        break;
      case 'P2025':
        status = HttpStatus.NOT_FOUND;
        message = 'The record to update not found';
        error = 'Record To Update Not Found';
        break;
      case 'P2026':
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = 'Query parameter type error';
        error = 'Query Parameter Error';
        break;
      case 'P2027':
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = 'Different types of rows in the result';
        error = 'Inconsistent Result Types';
        break;
      default:
        this.logger.error(
          `Unhandled Prisma error: ${exception.code}`,
          exception.stack,
        );
        message = 'An unexpected database error occurred';
    }
  }

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      error,
      message,
    };

    response.status(status).json(errorResponse);
  }
}
