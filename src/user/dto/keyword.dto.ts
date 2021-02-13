import { IsString } from 'class-validator';

export class KeywordDto {
  @IsString()
  keyword!: string;
}
