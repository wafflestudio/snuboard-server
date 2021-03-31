import {
  Controller,
  Delete,
  Get,
  Param,
  ParseBoolPipe,
  Post,
  Query,
  Req,
  SerializeOptions,
  UseGuards,
} from '@nestjs/common';
import { JwtAccessGuard } from '../auth/auth.guard';
import { UserRequest } from '../types/custom-type';
import { Notice } from './notice.entity';
import { NoticeService } from './notice.service';

import { NoticePaginationDto } from './dto/noticePagination.dto';
import { GetNoticeInDeptDto } from './dto/getNoticeInDept.dto';
import { SearchNoticeInDeptDto } from './dto/searchNoticeInDept.dto';
import { SearchFollowedNoticeDto } from './dto/searchFollowedNotice.dto';

import { NoticesResponseDto } from './dto/noticesResponse.dto';
import { plainToClass } from 'class-transformer';

@UseGuards(JwtAccessGuard)
@Controller('notices')
@SerializeOptions({
  excludePrefixes: ['content', 'files'],
})
export class NoticeController {
  constructor(private noticeService: NoticeService) {}

  @Get('department/:departmentId/search')
  searchNoticeInDepartment(
    @Param('departmentId') departmentId: number,
    @Query('pinned', ParseBoolPipe) pinned: boolean,
    @Query('title', ParseBoolPipe) title: boolean,
    @Query('content', ParseBoolPipe) content: boolean,
    @Query() rawQuery: string,
    @Req() req: UserRequest,
  ): Promise<NoticesResponseDto> {
    const query: SearchNoticeInDeptDto = plainToClass(
      SearchNoticeInDeptDto,
      rawQuery,
      {
        enableImplicitConversion: true,
      },
    );
    query.pinned = pinned;
    query.title = title;
    query.content = content;

    return this.noticeService.getNoticeInDepartment(req, departmentId, query);
  }

  @Get('department/:departmentId')
  getNoticeInDepartment(
    @Param('departmentId') departmentId: number,
    @Query('pinned', ParseBoolPipe) pinned: boolean,
    @Query() rawQuery: string,
    @Req() req: UserRequest,
  ): Promise<NoticesResponseDto> {
    const query: GetNoticeInDeptDto = plainToClass(
      GetNoticeInDeptDto,
      rawQuery,
      {
        enableImplicitConversion: true,
      },
    );
    query.pinned = pinned;
    return this.noticeService.getNoticeInDepartment(req, departmentId, query);
  }

  @Get('follow/search')
  searchFollowedNotice(
    @Query('title', ParseBoolPipe) title: boolean,
    @Query('content', ParseBoolPipe) content: boolean,
    @Query() rawQuery: string,
    @Req() req: UserRequest,
  ): Promise<NoticesResponseDto> {
    const query: SearchFollowedNoticeDto = plainToClass(
      SearchFollowedNoticeDto,
      rawQuery,
      {
        enableImplicitConversion: true,
      },
    );
    query.title = title;
    query.content = content;
    return this.noticeService.getFollowedNotice(req, query);
  }

  @Get('follow')
  getFollowedNotice(
    @Query() rawQuery: string,
    @Req() req: UserRequest,
  ): Promise<NoticesResponseDto> {
    const query: NoticePaginationDto = plainToClass(
      NoticePaginationDto,
      rawQuery,
      {
        enableImplicitConversion: true,
      },
    );
    return this.noticeService.getFollowedNotice(req, query);
  }

  @Get('scrap')
  getScrappedNotice(
    @Query() rawQuery: string,
    @Req() req: UserRequest,
  ): Promise<NoticesResponseDto> {
    const query: NoticePaginationDto = plainToClass(
      NoticePaginationDto,
      rawQuery,
      {
        enableImplicitConversion: true,
      },
    );
    return this.noticeService.getScrappedNotice(req, query);
  }

  @SerializeOptions({ excludePrefixes: ['preview'] })
  @Get(':id')
  getNotice(@Req() req: UserRequest, @Param('id') id: number): Promise<Notice> {
    return this.noticeService.getNotice(req, id);
  }

  @Post(':id/scrap')
  createScrap(
    @Req() req: UserRequest,
    @Param('id') id: number,
  ): Promise<Notice> {
    return this.noticeService.createScrap(req, id);
  }

  @Delete(':id/scrap')
  deleteScrap(
    @Req() req: UserRequest,
    @Param('id') id: number,
  ): Promise<Notice> {
    return this.noticeService.deleteScrap(req, id);
  }
}
