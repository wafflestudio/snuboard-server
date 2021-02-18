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
import { exceptionFormatter } from './functions/custom-function';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await departmentInit();
  await noticeInit();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: exceptionFormatter,
    }),
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  await app.listen(3000);
}
bootstrap();
