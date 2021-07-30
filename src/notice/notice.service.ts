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
  Tag,
  UserTag,
} from '../department/department.entity';
import { Brackets, In, SelectQueryBuilder } from 'typeorm';
import {
  PreNotice,
  PreQuery,
  UserDepartment,
  UserRequest,
} from '../types/custom-type';
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
    const { user, department } = await this.validateQuery({
      query: query,
      user: req.user,
      departmentId: departmentId,
    });

    if (department === undefined)
      throw new BadRequestException(
        `There is no department with the id ${departmentId}`,
      );
    const queryTags = this.splitParam(query.tags, ',');
    const tags: Tag[] = await this.getTagsFromName(queryTags, department);
    const tagIds = tags.map((tag) => tag.id);
    const tagNames = tags.map((tag) => tag.name);

    if (queryTags.length !== tags.length) {
      throw new BadRequestException(
        `There is no tag with the name ${queryTags.filter(
          (t) => !tagNames.includes(t),
        )}`,
      );
    }

    const noticeQb: SelectQueryBuilder<Notice> = Notice.createQueryBuilder(
      'notice',
    );
    this.appendDepartmentQb(noticeQb, departmentId, query.pinned);
    if (this.isSearchQuery(query)) {
      return await this.searchNotice(noticeQb, user, query, tagIds);
    } else {
      this.appendTagQb(noticeQb, tagIds);
      return await this.makeResponse(noticeQb, user, query.limit, query.cursor);
    }
  }

  async getFollowedNotice(
    req: UserRequest,
    query: NoticePaginationDto,
  ): Promise<NoticesResponseDto> {
    const { user } = await this.validateQuery({
      query: query,
      user: req.user,
    });

    const tagIds: number[] = await this.getFollowedTagIds(user);
    if (tagIds.length == 0) {
      return emptyResponse;
    }
    const noticeQb: SelectQueryBuilder<Notice> = Notice.createQueryBuilder(
      'notice',
    );
    if (this.isSearchQuery(query)) {
      return await this.searchNotice(noticeQb, user, query, tagIds);
    } else {
      this.appendTagQb(noticeQb, tagIds);
      return await this.makeResponse(noticeQb, user, query.limit, query.cursor);
    }
  }

  async getScrappedNotice(
    req: UserRequest,
    query: NoticePaginationDto,
  ): Promise<NoticesResponseDto> {
    const { user } = await this.validateQuery({
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
    return await this.makeResponse(noticeQb, user, query.limit, query.cursor);
  }

  async searchNotice(
    noticeQb: SelectQueryBuilder<Notice>,
    user: User,
    query: SearchFollowedNoticeDto | SearchNoticeInDeptDto,
    tags: number[],
  ): Promise<NoticesResponseDto> {
    const keywords: string[] = this.splitParam(query.keywords, ' ');
    this.appendTagQb(noticeQb, tags);
    this.appendKeywordQb(noticeQb, keywords);
    return await this.makeResponse(noticeQb, user, query.limit, query.cursor);
  }

  async makeResponse(
    noticeQb: SelectQueryBuilder<Notice>,
    user: User,
    limit: number,
    cursor: string,
  ): Promise<NoticesResponseDto> {
    if (cursor.length != 0) {
      const cursorInfo = cursor.split('-');
      const cursorCreatedAt = new Date(+cursorInfo[0]);
      const cursorId = +cursorInfo[1];

      noticeQb.andWhere(
        new Brackets((qb) => {
          qb.where('notice.createdAt < :cursorCreatedAt', {
            cursorCreatedAt,
          }).orWhere(
            new Brackets((qb) => {
              qb.where('notice.createdAt = :cursorCreatedAt', {
                cursorCreatedAt,
              }).andWhere('notice.id < :cursorId', { cursorId });
            }),
          );
        }),
      );
    }
    noticeQb
      .innerJoinAndSelect('notice.department', 'department')
      .orderBy('notice.createdAt', 'DESC')
      .addOrderBy('notice.id', 'DESC')
      .limit(limit + 1);

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

    if (notices.length > limit) {
      const lastNotice = notices[limit - 1];
      noticesResponse.next_cursor = `${lastNotice.createdAt.getTime()}-${
        lastNotice.id
      }`;
    } else {
      noticesResponse.next_cursor = '';
    }

    await this.attachIsScrapped(user, noticesResponse.notices);
    return noticesResponse;
  }

  async validateQuery(preQuery: PreQuery): Promise<UserDepartment> {
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

    const cursorSplit = query.cursor.split('-');

    if (
      query.cursor.length > 0 &&
      (cursorSplit.length !== 2 ||
        Number.isNaN(+cursorSplit[0]) ||
        Number.isNaN(+cursorSplit[1]))
    ) {
      throw new BadRequestException('invalid cursor format');
    }
    if (this.isSearchQuery(query)) {
      if (query.keywords.length == 0) {
        throw new BadRequestException("'keywords' should not be empty");
      }
      const minLength = Math.min(
        ...this.splitParam(query.keywords, ' ').map(
          (keyword) => keyword.length,
        ),
      );
      if (minLength < 2) {
        throw new BadRequestException(
          'keyword should have at least 2 characters',
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
      return { user, department };
    }
    return { user, department: undefined };
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
  ): void {
    const keywordParam = keywords
      .map((keyword) => '+' + keyword.replace(/[-*+~()<>"]+/g, '') + '*')
      .reduce((a, b) => a + ' ' + b);
    noticeQb
      .andWhere(
        `match (contentText, title) against (:keywordParam IN BOOLEAN MODE)`,
      )
      .setParameter(`keywordParam`, keywordParam);
  }

  appendTagQb(noticeQb: SelectQueryBuilder<Notice>, tags: number[]): void {
    if (tags.length == 0) {
      return;
    }

    noticeQb
      .innerJoin('notice_tag', 'noticeTag', 'noticeTag.noticeId = notice.id')
      .innerJoin('tag', 'tag', 'noticeTag.tagId = tag.id')
      .andWhere('tag.id IN (:...tags)')
      .setParameter('tags', tags);
  }

  async getValidatedUser(reqUser: User): Promise<User> {
    const user: User | undefined = await User.findOne(reqUser);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }

  async getFollowedTagIds(user: User): Promise<number[]> {
    const userTags: UserTag[] = await UserTag.find({
      relations: ['tag'],
      where: { user: user },
    });
    return userTags.map((userTag) => userTag.tag.id);
  }

  async getTagsFromName(
    tagNames: string[],
    department: Department,
  ): Promise<Tag[]> {
    return (
      (await Tag.find({
        where: {
          name: In(tagNames),
          department,
        },
      })) ?? []
    );
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
      notice.isScrapped = scrappedNotices.includes(notice.id);
      return notice;
    });
  }

  isSearchQuery(
    query: NoticePaginationDto,
  ): query is SearchNoticeInDeptDto | SearchFollowedNoticeDto {
    return (
      (<SearchNoticeInDeptDto | SearchFollowedNoticeDto>query).keywords !==
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
