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

@Injectable()
export class NoticeService {
  async getNotice(req: UserRequest, id: number): Promise<Notice> {
    const notice: Notice | undefined = await Notice.findOne(id, {
      relations: ['department', 'files', 'noticeTags', 'noticeTags.tag'],
    });
    if (!notice) {
      throw new NotFoundException(`There is no notice with the id ${id}`);
    }

    await this.appendIsScrapped(req.user, [notice]);
    return notice;
  }

  async getNoticeInDepartment(
    req: UserRequest,
    departmentId: number,
    query: GetNoticeInDeptDto,
  ): Promise<NoticesResponseDto | undefined> {
    const user = await User.findOne(req.user);
    if (!user) throw new UnauthorizedException();
    await this.validateQuery(query);

    const tags = query.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag);

    const noticeQb = Notice.createQueryBuilder('notice')
      .andWhere('notice.departmentId = :departmentId')
      .setParameter('departmentId', departmentId);

    if (query.pinned) {
      noticeQb.andWhere('notice.isPinned = true');
    }

    this.appendTagNameQb(noticeQb, tags);
    const response = await this.makeResponse(
      noticeQb,
      query.limit,
      query.cursor,
    );
    await this.appendIsScrapped(user, response.notices);
    return response;
  }

  async searchNoticeInDepartment(
    req: UserRequest,
    departmentId: number,
    query: SearchNoticeInDeptDto,
  ): Promise<NoticesResponseDto> {
    const user = await User.findOne(req.user);
    if (!user) throw new UnauthorizedException();
    await this.validateQuery(query);
    if (query.keyword.length == 0) {
      throw new BadRequestException("Keyword' should not be empty");
    }
    if (!(query.title || query.content)) {
      throw new BadRequestException(
        "At least one of 'title' and 'content' should be true",
      );
    }
    const selectedColumn: string =
      query.content && query.title
        ? 'CONCAT(notice.title, notice.content, " ")'
        : query.title
        ? 'notice.title'
        : query.content
        ? 'notice.content'
        : 'at least one of query.title and query.content should be true';

    const tags = query.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag);

    const keywords = query.keyword
      .split(' ')
      .map((keyword) => keyword.trim())
      .filter((keyword) => keyword);

    const noticeQb = Notice.createQueryBuilder('notice')
      .andWhere('notice.departmentId = :departmentId')
      .setParameter('departmentId', departmentId);

    if (query.pinned) {
      noticeQb.andWhere('notice.isPinned = true');
    }

    this.appendTagNameQb(noticeQb, tags);

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
    const response = await this.makeResponse(
      noticeQb,
      query.limit,
      query.cursor,
    );
    await this.appendIsScrapped(user, response.notices);
    return response;
  }

  async getFollowedNotice(
    req: UserRequest,
    query: NoticePaginationDto,
  ): Promise<NoticesResponseDto> {
    const user = await User.findOne(req.user);
    if (!user) throw new UnauthorizedException();
    await this.validateQuery(query);

    const userTags = await UserTag.find({
      relations: ['tag'],
      where: { user: user },
    });
    const tags = userTags.map((userTag) => userTag.tag.id);

    const noticeQb = Notice.createQueryBuilder('notice');
    this.appendTagIdQb(noticeQb, tags);

    const response = await this.makeResponse(
      noticeQb,
      query.limit,
      query.cursor,
    );
    await this.appendIsScrapped(user, response.notices);
    return response;
  }

  async searchFollowedNotice(
    req: UserRequest,
    query: SearchFollowedNoticeDto,
  ): Promise<NoticesResponseDto> {
    const user = await User.findOne(req.user);
    if (!user) throw new UnauthorizedException();
    await this.validateQuery(query);
    if (!(query.title || query.content)) {
      throw new BadRequestException(
        'At least one of "title" and "content" should be true',
      );
    }
    const selectedColumn: string =
      query.content && query.title
        ? 'CONCAT(notice.title, notice.content, " ")'
        : query.title
        ? 'notice.title'
        : query.content
        ? 'notice.content'
        : 'at least one of query.title and query.content should be true';

    const userTags = await UserTag.find({
      relations: ['tag'],
      where: { user: user },
    });

    const tags = userTags.map((userTag) => userTag.tag.id);

    const keywords = query.keyword
      .split(' ')
      .map((keyword) => keyword.trim())
      .filter((keyword) => keyword);

    const noticeQb = Notice.createQueryBuilder('notice');
    this.appendTagIdQb(noticeQb, tags);
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
    const response = await this.makeResponse(
      noticeQb,
      query.limit,
      query.cursor,
    );
    await this.appendIsScrapped(user, response.notices);
    return response;
  }

  async getScrappedNotice(
    req: UserRequest,
    query: NoticePaginationDto,
  ): Promise<NoticesResponseDto> {
    const user = await User.findOne(req.user);
    if (!user) throw new UnauthorizedException();
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
    await this.appendIsScrapped(user, response.notices);
    return response;
  }

  appendTagIdQb(noticeQb: SelectQueryBuilder<Notice>, tags: number[]) {
    const tagQb = Notice.createQueryBuilder('notice')
      .select('noticeTag.noticeId')
      .from(NoticeTag, 'noticeTag')
      .innerJoin(Tag, 'tag', 'noticeTag.tagId = tag.id')
      .where('tag.id IN (:...tags)');

    if (tags.length > 0) {
      noticeQb
        .innerJoinAndSelect(
          'notice.noticeTags',
          'noticeTag',
          'notice.id = noticeTag.noticeId',
        )
        .innerJoinAndSelect('noticeTag.tag', 'tag', 'noticeTag.tagId = tag.id')
        .andWhere('notice.id IN (' + tagQb.getQuery() + ')')
        .setParameter('tags', tags);
    } else {
      noticeQb
        .leftJoinAndSelect('notice.noticeTags', 'noticeTag')
        .leftJoinAndSelect('noticeTag.tag', 'tags');
    }
  }

  appendTagNameQb(noticeQb: SelectQueryBuilder<Notice>, tags: string[]) {
    const tagQb = Notice.createQueryBuilder('notice')
      .select('noticeTag.noticeId')
      .from(NoticeTag, 'noticeTag')
      .innerJoin(Tag, 'tag', 'noticeTag.tagId = tag.id')
      .where('tag.name IN (:...tags)');

    if (tags.length > 0) {
      noticeQb
        .innerJoinAndSelect(
          'notice.noticeTags',
          'noticeTag',
          'notice.id = noticeTag.noticeId',
        )
        .innerJoinAndSelect('noticeTag.tag', 'tag', 'noticeTag.tagId = tag.id')
        .andWhere('notice.id IN (' + tagQb.getQuery() + ')')
        .setParameter('tags', tags);
    } else {
      noticeQb
        .leftJoinAndSelect('notice.noticeTags', 'noticeTag')
        .leftJoinAndSelect('noticeTag.tag', 'tags');
    }
  }

  async validateQuery(query: NoticePaginationDto) {
    await validate(query).then((errors) => {
      if (errors.length > 0) {
        throw new BadRequestException(errors);
      }
    });
  }

  async makeResponse(
    noticeQb: SelectQueryBuilder<Notice>,
    limit: number,
    cursor: number,
  ): Promise<NoticesResponseDto> {
    noticeQb
      .innerJoinAndSelect('notice.department', 'department')
      .leftJoinAndSelect('notice.files', 'files')
      .orderBy('notice.cursor', 'DESC')
      .take(limit + 1);

    if (cursor != 0) {
      noticeQb.andWhere('notice.cursor < :cursor', { cursor: cursor });
    }
    const noticesResponse = new NoticesResponseDto();

    const notices = await noticeQb.getMany();

    noticesResponse.notices = notices.slice(0, limit);

    noticesResponse.next_cursor =
      notices.length > limit ? notices[limit - 1].cursor.toString() : '';

    return noticesResponse;
  }

  async appendIsScrapped(user: User, notices: Notice[]) {
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
}
