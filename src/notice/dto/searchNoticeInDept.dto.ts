import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { NoticePaginationDto } from './noticePagination.dto';

export class SearchNoticeInDeptDto extends NoticePaginationDto {
  @IsString()
  keywords!: string;

  @IsBoolean()
  @IsOptional()
  title: boolean = false;

  @IsBoolean()
  @IsOptional()
  content: boolean = false;

  @IsBoolean()
  @IsOptional()
  pinned: boolean = false;

  @IsString()
  @IsOptional()
  tags: string = '';
}
