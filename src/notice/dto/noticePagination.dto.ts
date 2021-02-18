import { IsNumber, IsOptional, IsPositive } from 'class-validator';

export class NoticePaginationDto {
  @IsNumber()
  @IsPositive()
  limit!: number;

  @IsOptional()
  cursor = '';
}
