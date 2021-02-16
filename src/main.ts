import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  BadRequestException,
  ClassSerializerInterceptor,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import { departmentInit } from './department/department.init';
import { ValidationError } from 'class-validator';
import { noticeInit } from './notice/notice.init';

const VALIDATION_ERROR = 'validation Error';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await departmentInit();
  await noticeInit();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        const message: string =
          validationErrors[0] && validationErrors[0].constraints
            ? Object.values(validationErrors[0].constraints)[0]
            : VALIDATION_ERROR;

        return new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message,
          error: 'Bad Request',
        });
      },
    }),
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  await app.listen(3000);
}
bootstrap();
