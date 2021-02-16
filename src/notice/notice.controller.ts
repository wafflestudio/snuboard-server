import {
  Controller,
  Get,
  Param,
  ParseBoolPipe,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAccessGuard } from 'src/auth/auth.guard';
import { UserRequest } from 'src/types/custom-type';
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
    const query = plainToClass(SearchNoticeInDeptDto, rawQuery, {
      enableImplicitConversion: true,
    });
    query.pinned = pinned;
    query.title = title;
    query.content = content;

    return this.noticeService.searchNoticeInDepartment(
      req,
      departmentId,
      query,
    );
  }

  @Get('department/:departmentId')
  getNoticeInDepartment(
    @Param('departmentId') departmentId: number,
    @Query('pinned', ParseBoolPipe) pinned: boolean,
    @Query() rawQuery: string,
    @Req() req: UserRequest,
  ): Promise<NoticesResponseDto | undefined> {
    const query = plainToClass(GetNoticeInDeptDto, rawQuery, {
      enableImplicitConversion: true,
    });
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
    const query = plainToClass(SearchFollowedNoticeDto, rawQuery, {
      enableImplicitConversion: true,
    });
    query.title = title;
    query.content = content;
    return this.noticeService.searchFollowedNotice(req, query);
  }

  @Get('follow')
  getFollowedNotice(
    @Query() rawQuery: string,
    @Req() req: UserRequest,
  ): Promise<NoticesResponseDto> {
    const query = plainToClass(NoticePaginationDto, rawQuery, {
      enableImplicitConversion: true,
    });
    return this.noticeService.getFollowedNotice(req, query);
  }

  @Get('scrap')
  getScrappedNotice(
    @Query() rawQuery: string,
    @Req() req: UserRequest,
  ): Promise<NoticesResponseDto> {
    const query = plainToClass(NoticePaginationDto, rawQuery, {
      enableImplicitConversion: true,
    });
    return this.noticeService.getScrappedNotice(req, query);
  }

  @Get(':id')
  getNotice(@Req() req: UserRequest, @Param('id') id: number): Promise<Notice> {
    return this.noticeService.getNotice(req, id);
  }
}
