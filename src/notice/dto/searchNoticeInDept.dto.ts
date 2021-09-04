import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { NoticePaginationDto } from './noticePagination.dto';

export class SearchNoticeInDeptDto extends NoticePaginationDto {
  @IsString()
  @IsOptional()
  keywords!: string;

  @IsBoolean()
  @IsOptional()
  pinned: boolean = false;

  @IsString()
  @IsOptional()
  tags: string = '';
}
