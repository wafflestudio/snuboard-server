import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  Req,
} from '@nestjs/common';
import { PreFollow, UserRequest } from '../types/custom-type';
import { Department, Tag, UserTag } from './department.entity';
import { FollowDto } from './dto/follow.dto';
import { User } from '../user/user.entity';
import { In } from 'typeorm';

@Injectable()
export class DepartmentService {
  async getAllDepartments(@Req() req: UserRequest): Promise<Department[]> {
    const departments: Department[] = await Department.find({
      relations: ['tags'],
    });

    return departments
      ? await Promise.all(
          departments.map(async (department) => {
            department.follow = await this.getFollow(department, req.user!);
            return department;
          }),
        )
      : [];
  }

  async getDepartment(
    @Req() req: UserRequest,
    id: number,
  ): Promise<Department> {
    const department: Department = (await Department.findOne(id, {
      relations: ['tags'],
    }))!;
    if (!department) {
      throw new NotFoundException('There is no department with the given id');
    }

    department.follow = await this.getFollow(department, req.user!);
    return department;
  }

  async getFollow(department: Department, user: User): Promise<string[]> {
    user = (await User.findOne(user))!;
    const tags: Tag[] = await Tag.find({
      department,
    });
    const userTags: UserTag[] = await UserTag.find({
      where: {
        user,
        tag: In(tags.map((tag) => tag.id)),
      },
      relations: ['tag'],
    });

    return userTags ? userTags.map((userTag) => userTag.tag.name) : [];
  }

  async validateIdFollow(
    req: UserRequest,
    id: number,
    followData: FollowDto,
  ): Promise<PreFollow> {
    const department: Department = (await Department.findOne(id, {
      relations: ['tags'],
    }))!;
    if (!department) {
      throw new NotFoundException('There is no department with the id');
    }

    const tag: Tag = department.tags.find(
      (tag) => tag.name === followData.follow,
    )!;
    if (!tag) {
      throw new BadRequestException(
        `There is no tag with the given name: ${followData.follow}`,
      );
    }
    const user: User = (await User.findOne(req.user))!;
    const userTag: UserTag = (await UserTag.findOne({
      user,
      tag,
    }))!;

    return {
      department,
      tag,
      user,
      userTag,
    };
  }

  async createFollow(
    req: UserRequest,
    id: number,
    followData: FollowDto,
  ): Promise<Department> {
    const { department, tag, user, userTag } = await this.validateIdFollow(
      req,
      id,
      followData,
    );

    if (userTag) {
      throw new BadRequestException('already followed tag');
    }

    const newUserTag: UserTag = UserTag.create({
      user,
      tag,
    });
    await UserTag.save(newUserTag);

    department.follow = await this.getFollow(department, user);
    return department;
  }

  async deleteFollow(
    req: UserRequest,
    id: number,
    followData: FollowDto,
  ): Promise<Department> {
    const { department, tag, user, userTag } = await this.validateIdFollow(
      req,
      id,
      followData,
    );

    if (!userTag) {
      throw new HttpException(
        {
          message: 'already deleted follow',
        },
        HttpStatus.NO_CONTENT,
      );
    }

    await UserTag.delete(userTag);

    department.follow = await this.getFollow(department, user);
    return department;
  }
}
