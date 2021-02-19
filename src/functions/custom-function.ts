import { BadRequestException, HttpStatus } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { departmentInit } from 'src/department/department.init';
import { noticeInit } from 'src/notice/notice.init';

export function exceptionFormatter(
  validationErrors: ValidationError[] = [],
): BadRequestException {
  const VALIDATION_ERROR = 'validation Error';
  const message: string =
    validationErrors[0] && validationErrors[0].constraints
      ? Object.values(validationErrors[0].constraints)[0]
      : VALIDATION_ERROR;

  return new BadRequestException({
    statusCode: HttpStatus.BAD_REQUEST,
    message,
    error: 'Bad Request',
  });
}

export async function initializeTestDB(): Promise<void> {
  await departmentInit();
  await noticeInit();
}
