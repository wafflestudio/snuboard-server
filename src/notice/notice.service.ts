import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from '../user/user.entity';
import { Notice, UserNotice } from './notice.entity';
import { GetNoticeInDeptDto } from './dto/getNoticeInDept.dto';
import { NoticesResponseDto } from './dto/noticesResponse.dto';
import { NoticeTag, Tag, UserTag } from '../department/department.entity';
import { Brackets, SelectQueryBuilder } from 'typeorm';
import { UserRequest } from '../types/custom-type';
import { NoticePaginationDto } from './dto/noticePagination.dto';
import { SearchFollowedNoticeDto } from './dto/searchFollowedNotice.dto';
import { SearchNoticeInDeptDto } from './dto/searchNoticeInDept.dto';
import { validate } from 'class-validator';
import { exceptionFormatter } from '../functions/custom-function';

const emptyResponse: NoticesResponseDto = { notices: [], next_cursor: '' };

@Injectable()
export class NoticeService {
  async getNotice(req: UserRequest, id: number): Promise<Notice> {
    if (isNaN(id)) {
      throw new BadRequestException('id should be a number');
    }

    const notice: Notice | undefined = await Notice.findOne(id, {
      relations: ['department', 'files', 'noticeTags', 'noticeTags.tag'],
    });

    if (!notice) {
      throw new NotFoundException(`there is no notice with the id`);
    }

    await this.attachIsScrapped(req.user, [notice]);
    return notice;
  }

  async getNoticeInDepartment(
    req: UserRequest,
    departmentId: number,
    query: GetNoticeInDeptDto,
  ): Promise<NoticesResponseDto | undefined> {
    const user = await User.findOne(req.user);
    if (!user) {
      throw new UnauthorizedException();
    }
    await this.validateQuery(query);

    const tags = this.splitParam(query.tags, ',');
    const noticeQb = Notice.createQueryBuilder('notice')
      .andWhere('notice.departmentId = :departmentId')
      .setParameter('departmentId', departmentId);
    if (query.pinned) {
      noticeQb.andWhere('notice.isPinned = true');
    }
    this.appendTagQb(noticeQb, tags);

    const response = await this.makeResponse(
      noticeQb,
      query.limit,
      query.cursor,
    );
    await this.attachIsScrapped(user, response.notices);
    return response;
  }

  async searchNoticeInDepartment(
    req: UserRequest,
    departmentId: number,
    query: SearchNoticeInDeptDto,
  ): Promise<NoticesResponseDto> {
    const user = await User.findOne(req.user);
    if (!user) {
      throw new UnauthorizedException();
    }
    await this.validateQuery(query);

    const tags = this.splitParam(query.tags, ',');
    const noticeQb = Notice.createQueryBuilder('notice')
      .andWhere('notice.departmentId = :departmentId')
      .setParameter('departmentId', departmentId);
    if (query.pinned) {
      noticeQb.andWhere('notice.isPinned = true');
    }

    return this.searchNotice(user, query, noticeQb, tags);
  }

  async getFollowedNotice(
    req: UserRequest,
    query: NoticePaginationDto,
  ): Promise<NoticesResponseDto> {
    const user = await User.findOne(req.user);
    if (!user) {
      throw new UnauthorizedException();
    }
    await this.validateQuery(query);

    const tags = await this.getFollowedTag(user);
    if (tags.length == 0) {
      return emptyResponse;
    }
    const noticeQb = Notice.createQueryBuilder('notice');
    this.appendTagQb(noticeQb, tags);

    const response = await this.makeResponse(
      noticeQb,
      query.limit,
      query.cursor,
    );
    await this.attachIsScrapped(user, response.notices);
    return response;
  }

  async searchFollowedNotice(
    req: UserRequest,
    query: SearchFollowedNoticeDto,
  ): Promise<NoticesResponseDto> {
    const user = await User.findOne(req.user);
    if (!user) {
      throw new UnauthorizedException();
    }
    const tags = await this.getFollowedTag(user);
    if (tags.length == 0) {
      return emptyResponse;
    }
    const noticeQb = Notice.createQueryBuilder('notice');
    return await this.searchNotice(user, query, noticeQb, tags);
  }

  async getScrappedNotice(
    req: UserRequest,
    query: NoticePaginationDto,
  ): Promise<NoticesResponseDto> {
    const user = await User.findOne(req.user);
    if (!user) {
      throw new UnauthorizedException();
    }
    await this.validateQuery(query);
    const userNotices = await UserNotice.find({
      relations: ['notice'],
      where: { user: user, isScrapped: true },
    });
    const noticeIds = userNotices.map((userNotice) => userNotice.notice.id);
    const noticeQb = Notice.createQueryBuilder('notice').whereInIds(noticeIds);

    const response = await this.makeResponse(
      noticeQb,
      query.limit,
      query.cursor,
    );
    await this.attachIsScrapped(user, response.notices);
    return response;
  }

  async searchNotice(
    user: User,
    query: SearchFollowedNoticeDto | SearchNoticeInDeptDto,
    noticeQb: SelectQueryBuilder<Notice>,
    tags: string[] | number[],
  ): Promise<NoticesResponseDto> {
    await this.validateQuery(query);

    const selectedColumn: string =
      query.content && query.title
        ? 'CONCAT(notice.title, notice.content, " ")'
        : query.title
        ? 'notice.title'
        : 'notice.content';

    const keywords = this.splitParam(query.keywords, ' ');
    this.appendTagQb(noticeQb, tags);
    this.appendKeywordQb(noticeQb, keywords, selectedColumn);

    const response = await this.makeResponse(
      noticeQb,
      query.limit,
      query.cursor,
    );
    await this.attachIsScrapped(user, response.notices);
    return response;
  }

  async makeResponse(
    noticeQb: SelectQueryBuilder<Notice>,
    limit: number,
    cursor: string,
  ): Promise<NoticesResponseDto> {
    noticeQb
      .innerJoinAndSelect('notice.department', 'department')
      .leftJoinAndSelect('notice.files', 'files')
      .orderBy('notice.cursor', 'DESC')
      .take(limit + 1);

    if (cursor.length != 0) {
      noticeQb.andWhere('notice.cursor < :cursor', { cursor: Number(cursor) });
    }

    const noticesResponse = new NoticesResponseDto();

    const notices = await noticeQb.getMany();

    noticesResponse.notices = notices.slice(0, limit);

    noticesResponse.next_cursor =
      notices.length > limit ? notices[limit - 1].cursor.toString() : '';

    return noticesResponse;
  }

  async validateQuery(query: NoticePaginationDto) {
    await validate(query, {
      whitelist: true,
      forbidNonWhitelisted: true,
    }).then((errors) => {
      if (errors.length > 0) {
        throw exceptionFormatter(errors);
      }
    });
    if (query.cursor.length > 0 && isNaN(Number(query.cursor))) {
      throw new BadRequestException('invalid cursor format');
    }
    if (this.isSearchQuery(query)) {
      if (query.keywords.length == 0) {
        throw new BadRequestException("'keywords' should not be empty");
      }
      if (!(query.title || query.content)) {
        throw new BadRequestException(
          "At least one of 'title' and 'content' should be true",
        );
      }
    }
  }

  appendKeywordQb(
    noticeQb: SelectQueryBuilder<Notice>,
    keywords: string[],
    selectedColumn: string,
  ) {
    noticeQb.andWhere(
      new Brackets((keywordQb) => {
        for (let i = 0; i < keywords.length; i++) {
          if (i == 0) {
            keywordQb.where(selectedColumn + ' like "%' + keywords[i] + '%"');
          } else {
            keywordQb.orWhere(selectedColumn + ' like "%' + keywords[i] + '%"');
          }
        }
      }),
    );
  }

  appendTagQb(noticeQb: SelectQueryBuilder<Notice>, tags: string[] | number[]) {
    if (tags.length == 0) {
      noticeQb
        .leftJoinAndSelect('notice.noticeTags', 'noticeTag')
        .leftJoinAndSelect('noticeTag.tag', 'tags');
      return;
    }

    const tagQb = Notice.createQueryBuilder('notice')
      .select('noticeTag.noticeId')
      .from(NoticeTag, 'noticeTag')
      .innerJoin(Tag, 'tag', 'noticeTag.tagId = tag.id');

    if (typeof tags[0] === 'string') {
      tagQb.where('tag.name IN (:...tags)');
    } else {
      tagQb.where('tag.id IN (:...tags)');
    }

    noticeQb
      .innerJoinAndSelect(
        'notice.noticeTags',
        'noticeTag',
        'notice.id = noticeTag.noticeId',
      )
      .innerJoinAndSelect('noticeTag.tag', 'tag', 'noticeTag.tagId = tag.id')
      .andWhere('notice.id IN (' + tagQb.getQuery() + ')')
      .setParameter('tags', tags);
  }

  async getFollowedTag(user: User): Promise<number[]> {
    const userTags = await UserTag.find({
      relations: ['tag'],
      where: { user: user },
    });
    return userTags.map((userTag) => userTag.tag.id);
  }

  async attachIsScrapped(user: User, notices: Notice[]) {
    const userNotices = await UserNotice.find({
      relations: ['notice'],
      where: { user: user, isScrapped: true },
    });
    const scrappedNotices: number[] = userNotices.map((userNotice) => {
      return userNotice.notice.id;
    });

    notices.map((notice) => {
      if (scrappedNotices.includes(notice.id)) {
        notice.isScrapped = true;
      } else {
        notice.isScrapped = false;
      }
      return notice;
    });
  }

  isSearchQuery(
    query: NoticePaginationDto,
  ): query is SearchNoticeInDeptDto | SearchFollowedNoticeDto {
    return (
      (<SearchNoticeInDeptDto | SearchFollowedNoticeDto>query).keywords !==
        undefined &&
      (<SearchNoticeInDeptDto | SearchFollowedNoticeDto>query).content !==
        undefined &&
      (<SearchNoticeInDeptDto | SearchFollowedNoticeDto>query).title !==
        undefined
    );
  }

  splitParam(params: string, separator: string): string[] {
    return params
      .split(separator)
      .map((param) => param.trim())
      .filter((param) => param);
  }
}
