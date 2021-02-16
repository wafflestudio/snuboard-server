import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { NoticePaginationDto } from './noticePagination.dto';

export class SearchNoticeInDeptDto extends NoticePaginationDto {
  @IsString()
  keyword!: string;

  @IsBoolean()
  title!: boolean;

  @IsBoolean()
  content!: boolean;

  @IsBoolean()
  pinned!: boolean;

  @IsString()
  tags!: string;
}
