import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from '../user/user.entity';
import { Notice, UserNotice } from './notice.entity';
import { GetNoticeInDeptDto } from './dto/getNoticeInDept.dto';
import { NoticesResponseDto } from './dto/noticesResponse.dto';
import {
  Department,
  NoticeTag,
  UserTag,
} from '../department/department.entity';
import { Brackets, In, SelectQueryBuilder } from 'typeorm';
import { PreNotice, PreQuery, UserRequest } from '../types/custom-type';
import { NoticePaginationDto } from './dto/noticePagination.dto';
import { SearchFollowedNoticeDto } from './dto/searchFollowedNotice.dto';
import { SearchNoticeInDeptDto } from './dto/searchNoticeInDept.dto';
import { validate } from 'class-validator';
import { exceptionFormatter } from '../functions/custom-function';

const emptyResponse: NoticesResponseDto = { notices: [], next_cursor: '' };

@Injectable()
export class NoticeService {
  async getNotice(req: UserRequest, id: number): Promise<Notice> {
    const { user, notice } = await this.validateNotice(req, id);
    await this.attachIsScrapped(user, [notice]);
    return notice;
  }

  async getNoticeInDepartment(
    req: UserRequest,
    departmentId: number,
    query: GetNoticeInDeptDto | SearchNoticeInDeptDto,
  ): Promise<NoticesResponseDto> {
    const user: User = await this.validateQuery({
      query: query,
      user: req.user,
      departmentId: departmentId,
    });

    const tags: string[] = this.splitParam(query.tags, ',');
    const noticeQb: SelectQueryBuilder<Notice> = Notice.createQueryBuilder(
      'notice',
    );
    this.appendDepartmentQb(noticeQb, departmentId, query.pinned);
    if (this.isSearchQuery(query)) {
      return await this.searchNotice(noticeQb, user, query, tags);
    } else {
      this.appendTagQb(noticeQb, tags);
      return await this.makeResponse(noticeQb, user, query.limit, query.cursor);
    }
  }

  async getFollowedNotice(
    req: UserRequest,
    query: NoticePaginationDto,
  ): Promise<NoticesResponseDto> {
    const user: User = await this.validateQuery({
      query: query,
      user: req.user,
    });

    const tags: number[] = await this.getFollowedTag(user);
    if (tags.length == 0) {
      return emptyResponse;
    }
    const noticeQb: SelectQueryBuilder<Notice> = Notice.createQueryBuilder(
      'notice',
    );
    if (this.isSearchQuery(query)) {
      return await this.searchNotice(noticeQb, user, query, tags);
    } else {
      this.appendTagQb(noticeQb, tags);
      return await this.makeResponse(noticeQb, user, query.limit, query.cursor);
    }
  }

  async getScrappedNotice(
    req: UserRequest,
    query: NoticePaginationDto,
  ): Promise<NoticesResponseDto> {
    const user: User = await this.validateQuery({
      query: query,
      user: req.user,
    });

    const userNotices: UserNotice[] = await UserNotice.find({
      relations: ['notice'],
      where: { user: user, isScrapped: true },
    });
    if (userNotices.length == 0) {
      return emptyResponse;
    }
    const noticeIds: number[] = userNotices.map(
      (userNotice) => userNotice.notice.id,
    );
    const noticeQb: SelectQueryBuilder<Notice> = Notice.createQueryBuilder(
      'notice',
    ).whereInIds(noticeIds);
    this.appendTagQb(noticeQb, []);
    return await this.makeResponse(noticeQb, user, query.limit, query.cursor);
  }

  async searchNotice(
    noticeQb: SelectQueryBuilder<Notice>,
    user: User,
    query: SearchFollowedNoticeDto | SearchNoticeInDeptDto,
    tags: string[] | number[],
  ): Promise<NoticesResponseDto> {
    const selectedColumn: string =
      query.content && query.title
        ? 'CONCAT(notice.title, notice.content, " ")'
        : query.title
        ? 'notice.title'
        : 'notice.content';

    const keywords: string[] = this.splitParam(query.keywords, ' ');
    this.appendTagQb(noticeQb, tags);
    this.appendKeywordQb(noticeQb, keywords, selectedColumn);
    return await this.makeResponse(noticeQb, user, query.limit, query.cursor);
  }

  async makeResponse(
    noticeQb: SelectQueryBuilder<Notice>,
    user: User,
    limit: number,
    cursor: string,
  ): Promise<NoticesResponseDto> {
    noticeQb.orderBy('notice.cursor', 'DESC').take(limit + 1);

    if (cursor.length != 0) {
      noticeQb.andWhere('notice.cursor < :cursor', { cursor: Number(cursor) });
    }

    noticeQb
      .innerJoinAndSelect('notice.department', 'department')
      .leftJoinAndSelect('notice.files', 'files');

    const noticesResponse: NoticesResponseDto = new NoticesResponseDto();

    const notices: Notice[] = await noticeQb.getMany();
    const noticeTags: NoticeTag[] = await NoticeTag.find({
      where: {
        notice: In(notices.map((notice) => notice.id)),
      },
      relations: ['tag'],
    });

    notices.forEach((notice) => {
      notice.noticeTags = noticeTags.filter((noticeTag) => {
        return noticeTag.noticeId === notice.id;
      });
    });

    noticesResponse.notices = notices.slice(0, limit);

    noticesResponse.next_cursor =
      notices.length > limit ? notices[limit - 1].cursor.toString() : '';

    await this.attachIsScrapped(user, noticesResponse.notices);
    return noticesResponse;
  }

  async validateQuery(preQuery: PreQuery): Promise<User> {
    const query: NoticePaginationDto = preQuery.query;
    const departmentId: number | undefined = preQuery.departmentId;
    const user: User = await this.getValidatedUser(preQuery.user);
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
    if (departmentId) {
      const department: Department | undefined = await Department.findOne(
        departmentId,
      );
      if (!department) {
        throw new BadRequestException(
          `There is no department with the id ${departmentId}`,
        );
      }
    }
    return user;
  }

  appendDepartmentQb(
    noticeQb: SelectQueryBuilder<Notice>,
    departmentId: number,
    pinned: boolean,
  ): void {
    noticeQb
      .andWhere('notice.departmentId = :departmentId')
      .setParameter('departmentId', departmentId);
    if (pinned) {
      noticeQb.andWhere('notice.isPinned = true');
    }
  }

  appendKeywordQb(
    noticeQb: SelectQueryBuilder<Notice>,
    keywords: string[],
    selectedColumn: string,
  ): void {
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

  appendTagQb(
    noticeQb: SelectQueryBuilder<Notice>,
    tags: string[] | number[],
  ): void {
    if (tags.length == 0) {
      return;
    }

    const tagQb: SelectQueryBuilder<NoticeTag> = NoticeTag.createQueryBuilder(
      'noticeTag',
    )
      .select('noticeTag.noticeId')
      .innerJoin('noticeTag.tag', 'tag', 'noticeTag.tagId = tag.id');

    if (typeof tags[0] === 'string') {
      tagQb.where('tag.name IN (:...tags)');
    } else {
      tagQb.where('tag.id IN (:...tags)');
    }

    noticeQb
      .andWhere('notice.id IN (' + tagQb.getQuery() + ')')
      .setParameter('tags', tags);
  }

  async getValidatedUser(reqUser: User): Promise<User> {
    const user: User | undefined = await User.findOne(reqUser);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }

  async getFollowedTag(user: User): Promise<number[]> {
    const userTags: UserTag[] = await UserTag.find({
      relations: ['tag'],
      where: { user: user },
    });
    return userTags.map((userTag) => userTag.tag.id);
  }

  async attachIsScrapped(user: User, notices: Notice[]): Promise<void> {
    const userNotices: UserNotice[] = await UserNotice.find({
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

  async validateNotice(req: UserRequest, id: number): Promise<PreNotice> {
    const user: User = await this.getValidatedUser(req.user);

    if (isNaN(id)) {
      throw new BadRequestException('id should be a number');
    }

    const notice: Notice | undefined = await Notice.findOne(id, {
      relations: ['department', 'files', 'noticeTags', 'noticeTags.tag'],
    });

    if (!notice) {
      throw new NotFoundException(`There is no notice with the id ${id}`);
    }

    const userNotice: UserNotice | undefined = await UserNotice.findOne({
      user,
      notice,
    });

    return {
      user,
      notice,
      userNotice,
    };
  }

  async createScrap(req: UserRequest, id: number): Promise<Notice> {
    const preNotice: PreNotice = await this.validateNotice(req, id);
    const { user, notice } = preNotice;
    let { userNotice } = preNotice;

    if (userNotice && userNotice.isScrapped) {
      throw new BadRequestException('Already Scrapped notice');
    }

    if (userNotice) {
      userNotice.isScrapped = true;
    } else {
      userNotice = UserNotice.create({
        user,
        notice,
        isScrapped: true,
      });
    }
    await UserNotice.save(userNotice);
    await this.attachIsScrapped(user, [notice]);
    return notice;
  }

  async deleteScrap(req: UserRequest, id: number): Promise<Notice> {
    const { user, notice, userNotice } = await this.validateNotice(req, id);

    if (!userNotice || !userNotice.isScrapped) {
      throw new HttpException('Not scrapped notice', HttpStatus.NO_CONTENT);
    }

    userNotice.isScrapped = false;
    await UserNotice.save(userNotice);
    await this.attachIsScrapped(user, [notice]);
    return notice;
  }
}
