import { Exclude, Expose } from 'class-transformer';
import { BaseEntity, Column, Entity, Index, ManyToOne, OneToMany, PrimaryGeneratedColumn, Relation } from 'typeorm';

import { PREVIEW_LENGTH } from './constants.js';
import { Department, NoticeTag } from '../department/department.entity.js';
import { User } from '../user/user.entity.js';

@Entity()
@Index(['createdAt', 'id'])
export class Notice extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    title!: string;

    @Expose()
    get preview(): string {
        return this.contentText.substring(0, PREVIEW_LENGTH);
    }

    @Column({ type: 'mediumtext' })
    contentText!: string;

    @Column({ type: 'mediumtext' })
    content!: string;

    @Expose({ name: 'created_at' })
    @Column({ type: 'timestamp' })
    createdAt!: Date;

    @Expose({ name: 'is_pinned' })
    @Column({ default: false })
    isPinned!: boolean;

    // Index link(255) applied by migration
    @Column({ length: 1000 })
    link!: string;

    @Exclude()
    @ManyToOne(() => Department, (department) => department.notices, {
        nullable: false,
        onDelete: 'CASCADE',
    })
    department!: Relation<Department>;

    @Exclude()
    @Column()
    departmentCode!: string;

    @Expose()
    get department_id(): number {
        return this.department.id;
    }

    @Expose()
    get department_name(): string {
        return this.department.name ? this.department.name : '';
    }

    @Expose()
    get style(): string {
        return this.department.style;
    }

    @Exclude()
    @OneToMany(() => UserNotice, (userNotice) => userNotice.notice)
    userNotices!: Relation<UserNotice[]>;

    @OneToMany(() => File, (file) => file.notice)
    files!: Relation<File[]>;

    @Exclude()
    @OneToMany(() => NoticeTag, (noticeTag) => noticeTag.notice)
    noticeTags!: Relation<NoticeTag[]>;

    @Expose()
    get tags(): string[] {
        return this.noticeTags
            ? this.noticeTags
                  .sort((lhs, rhs) => {
                      return lhs.tag.id - rhs.tag.id;
                  })
                  .map((noticeTag) => noticeTag.tag.name)
            : [];
    }

    @Expose({ name: 'is_scrapped' })
    isScrapped?: boolean;
}

@Entity()
export class File extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    // Index link(255) applied by migration
    @Column({ length: 1000 })
    link!: string;

    @ManyToOne(() => Notice, (notice) => notice.files, {
        nullable: false,
        onDelete: 'CASCADE',
    })
    notice!: Relation<Notice>;
}

@Entity()
export class UserNotice extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    isScrapped!: boolean;

    @ManyToOne(() => User, (user) => user.userNotices, {
        nullable: false,
        onDelete: 'CASCADE',
    })
    user!: Relation<User>;

    @ManyToOne(() => Notice, (notice) => notice.userNotices, {
        nullable: false,
        onDelete: 'CASCADE',
    })
    notice!: Relation<Notice>;
}
