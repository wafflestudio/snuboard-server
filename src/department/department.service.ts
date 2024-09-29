import {
    BadRequestException,
    HttpException,
    HttpStatus,
    Injectable,
    NotFoundException,
    Req,
    UnauthorizedException,
} from '@nestjs/common';
import { In, ObjectLiteral } from 'typeorm';

import { Department, Tag, UserTag } from './department.entity.js';
import { PreFollow, UserRequest } from '../types/custom-type';
import { FollowDto } from './dto/follow.dto';
import { User } from '../user/user.entity';

@Injectable()
export class DepartmentService {
    async getAllDepartments(@Req() req: UserRequest): Promise<Department[]> {
        const departments: Department[] = await Department.find({
            relations: ['tags'],
        });

        return this.attachFollow(departments, req.user);
    }

    async attachFollow(departments: Department[], user: User): Promise<Department[]> {
        departments.forEach((department) => {
            department.follow = [];
        });

        const follows: UserTag[] = await UserTag.find({
            where: {
                user,
            },
            relations: ['tag', 'tag.department'],
        });
        follows.forEach((userTag) => {
            const department = departments.find((department) => department.id === userTag.tag.department.id);
            if (department !== undefined) {
                department.follow?.push(userTag.tag);
            }
        });

        return departments;
    }

    async getDepartment(@Req() req: UserRequest, id: number): Promise<Department> {
        const department: Department | null = await Department.findOne({
            where: { id },
            relations: ['tags'],
        });
        if (!department) {
            throw new NotFoundException('There is no department with the given id');
        }

        department.follow = await this.getFollow(department, req.user);
        return department;
    }

    async getFollow(department: Department, user: User | null): Promise<Tag[]> {
        if (user != null) user = await User.findOne({ where: user as ObjectLiteral });
        if (!user) throw new UnauthorizedException();
        const tags: Tag[] = await Tag.find({
            where: { department },
        });
        const userTags: UserTag[] = await UserTag.find({
            where: {
                user,
                tag: In(tags.map((tag) => tag.id)),
            },
            relations: ['tag'],
        });

        return userTags ? userTags.map((userTag) => userTag.tag) : [];
    }

    async validateIdFollow(req: UserRequest, id: number, followData: FollowDto): Promise<PreFollow> {
        const department: Department | null = await Department.findOne({
            where: { id },
            relations: ['tags'],
        });
        if (!department) {
            throw new NotFoundException('There is no department with the id');
        }

        const tag: Tag | undefined = department.tags.find((tag) => tag.name === followData.follow);
        if (!tag) {
            throw new BadRequestException(`There is no tag with the given name: ${followData.follow}`);
        }
        const user: User | null = await User.findOne({ where: req.user as ObjectLiteral });
        if (!user) throw new UnauthorizedException();
        const userTag: UserTag | null = await UserTag.findOne({
            where: {
                user,
                tag,
            },
        });
        return {
            department,
            tag,
            user,
            userTag: userTag || undefined,
        };
    }

    async createFollow(req: UserRequest, id: number, followData: FollowDto): Promise<Department> {
        const { department, tag, user, userTag } = await this.validateIdFollow(req, id, followData);

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

    async deleteFollow(req: UserRequest, id: number, followData: FollowDto): Promise<Department> {
        const { department, tag, user, userTag } = await this.validateIdFollow(req, id, followData);

        if (!userTag) {
            throw new HttpException(
                {
                    message: 'already deleted follow',
                },
                HttpStatus.NO_CONTENT,
            );
        }
        await userTag.remove();

        department.follow = await this.getFollow(department, user);
        return department;
    }
}
