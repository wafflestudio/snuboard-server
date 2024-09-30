import { Exclude, Expose, Transform } from 'class-transformer';
import {
    BaseEntity,
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    RelationId,
    Relation,
} from 'typeorm';

import { Notice } from '../notice/notice.entity.js';
import { User } from '../user/user.entity.js';

@Entity()
export class Department extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    name!: string;

    @Column()
    college!: string;

    @OneToMany(() => Notice, (notice) => notice.department)
    notices!: Relation<Notice[]>;

    @Transform((tags) => [...new Set(tags.value.map((tag: Tag) => tag.name))])
    @OneToMany(() => Tag, (tag) => tag.department)
    tags!: Relation<Tag[]>;

    @Transform((tags) => tags.value.map((tag: Tag) => tag.name))
    follow?: Relation<Tag[]>;

    @Column({ default: '' })
    link!: string;

    @Exclude()
    @Column({ default: '' })
    style!: string;

    @Exclude()
    @Column({ type: 'varchar', length: 63, default: '' })
    code!: string;
}

@Entity()
@Index('name_dept_idx', ['name', 'department'], { unique: true })
export class Tag extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @ManyToOne(() => Department, (department) => department.tags, {
        nullable: false,
        onDelete: 'CASCADE',
    })
    department!: Relation<Department>;

    @OneToMany(() => UserTag, (userTag) => userTag.tag)
    userTags!: Relation<UserTag[]>;

    @OneToMany(() => NoticeTag, (noticeTag) => noticeTag.tag)
    noticeTags!: Relation<NoticeTag[]>;
}

@Index('user_tag_idx', ['user', 'tag'], { unique: true })
@Entity()
export class UserTag extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User, (user) => user.userTags, {
        nullable: false,
        onDelete: 'CASCADE',
    })
    user!: Relation<User>;

    @ManyToOne(() => Tag, (tag) => tag.userTags, {
        nullable: false,
        onDelete: 'CASCADE',
    })
    tag!: Relation<Tag>;
}

@Entity()
@Index('notice_cursor', ['noticeCreatedAt', 'notice'])
@Index('notice_tag_idx', ['notice', 'tag'], { unique: true })
export class NoticeTag extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Notice, (notice) => notice.noticeTags, {
        nullable: false,
        onDelete: 'CASCADE',
    })
    notice!: Relation<Notice>;

    @ManyToOne(() => Tag, (tag) => tag.noticeTags, {
        nullable: false,
        onDelete: 'CASCADE',
    })
    tag!: Relation<Tag>;

    @RelationId((noticeTag: NoticeTag) => noticeTag.notice)
    noticeId!: number;

    @Column({ type: 'timestamp', default: '1970-01-01 09:00:01' })
    noticeCreatedAt!: Date;
}
