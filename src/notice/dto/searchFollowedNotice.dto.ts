import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { NoticePaginationDto } from './noticePagination.dto';

export class SearchFollowedNoticeDto extends NoticePaginationDto {
  @IsString()
  keywords!: string;

  @IsBoolean()
  @IsOptional()
  title: boolean = false;

  @IsBoolean()
  @IsOptional()
  content: boolean = false;
}
