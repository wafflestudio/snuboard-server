import { IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class NoticePaginationDto {
  @IsNumber()
  @IsPositive()
  limit!: number;

  @IsString()
  @IsOptional()
  cursor: string = '';
}
