import { IsNumber, IsOptional, IsPositive } from 'class-validator';

export class NoticePaginationDto {
  @IsNumber()
  @IsPositive()
  limit!: number;

  @IsNumber()
  @IsOptional()
  cursor!: number;
}
