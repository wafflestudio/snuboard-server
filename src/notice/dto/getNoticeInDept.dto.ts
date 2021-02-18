import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { NoticePaginationDto } from './noticePagination.dto';

export class GetNoticeInDeptDto extends NoticePaginationDto {
  @IsBoolean()
  pinned = false;

  @IsString()
  @IsOptional()
  tags = '';
}
