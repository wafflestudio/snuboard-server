import { IsNumber, IsOptional } from 'class-validator';

export class NoticePaginationDto {
  @IsNumber()
  limit!: number;

  @IsNumber()
  @IsOptional()
  cursor!: number;
}
