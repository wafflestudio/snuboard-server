import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { NoticePaginationDto } from './noticePagination.dto';

export class SearchNoticeInDeptDto extends NoticePaginationDto {
  @IsString()
  keywords!: string;

  @IsBoolean()
  title!: boolean;

  @IsBoolean()
  content!: boolean;

  @IsBoolean()
  pinned = false;

  @IsString()
  @IsOptional()
  tags = '';
}
