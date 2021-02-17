import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Department, NoticeTag } from '../department/department.entity';
import { Exclude, Expose } from 'class-transformer';

@Entity()
export class Notice extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column({ length: 1000 })
  preview!: string;

  @Column({ type: 'text' })
  content!: string;

  @Expose({ name: 'created_at' })
  @Column({ type: 'timestamp' })
  createdAt!: Date;

  @Expose({ name: 'is_pinned' })
  @Column({ default: false })
  isPinned!: boolean;

  @Column()
  link!: string;

  @Exclude()
  @Column({
    unique: true,
    type: 'bigint',
  })
  cursor!: number;

  @Exclude()
  @ManyToOne(() => Department, (department) => department.notices, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  department!: Department;

  @Expose()
  get department_id(): number {
    return this.department.id;
  }

  @Expose()
  get department_name(): string {
    return this.department.name ? this.department.name : '';
  }
  @Exclude()
  @OneToMany(() => UserNotice, (userNotice) => userNotice.notice)
  userNotices!: UserNotice[];

  @OneToMany(() => File, (file) => file.notice)
  files!: File[];

  @Exclude()
  @OneToMany(() => NoticeTag, (noticeTag) => noticeTag.notice)
  noticeTags!: NoticeTag[];

  @Expose()
  get tags(): string[] {
    return this.noticeTags
      ? this.noticeTags.map((noticeTag) => noticeTag.tag.name)
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

  @Column()
  link!: string;

  @ManyToOne(() => Notice, (notice) => notice.files, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  notice!: Notice;
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
  user!: User;

  @ManyToOne(() => Notice, (notice) => notice.userNotices, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  notice!: Notice;
}
