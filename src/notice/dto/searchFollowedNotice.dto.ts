import { IsBoolean, IsString } from 'class-validator';
import { NoticePaginationDto } from './noticePagination.dto';

export class SearchFollowedNoticeDto extends NoticePaginationDto {
  @IsString()
  keywords!: string;

  @IsBoolean()
  title!: boolean;

  @IsBoolean()
  content!: boolean;
}
