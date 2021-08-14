import { BadRequestException, HttpStatus } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { Department } from '../department/department.entity';
import { StringKey } from '../types/custom-type';

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

export function encodeTag(tag: string, department: Department) {
  const rawTopic = `${department.name}/${tag}`;
  const replacement: StringKey = { '+': '-', '/': '_', '=': '%' };
  return Buffer.from(rawTopic)
    .toString('base64')
    .replace(/[+/=]/g, (str) => {
      return replacement[str];
    });
}

export function getEnvFile() {
  const ENV: string = process.env.NODE_ENV ?? 'dev';
  let envFile: string;
  if (ENV === 'production') {
    envFile = '.env.prod';
  } else if (ENV === 'ci') {
    envFile = '.env.ci';
  } else {
    envFile = '.env.dev';
  }

  return envFile;
}
