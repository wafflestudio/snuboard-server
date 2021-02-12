import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Notice } from '../notice/notice.entity';
import { Expose, Transform } from 'class-transformer';

@Entity()
export class Department extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @OneToMany(() => Notice, (notice) => notice.department)
  notices!: Notice[];

  @Transform((tags) => tags.value.map((tag) => tag.name))
  @OneToMany(() => Tag, (tag) => tag.department)
  tags!: Tag[];

  follow?: string[];
}

@Entity()
export class Tag extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @ManyToOne(() => Department, (department) => department.tags, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  department!: Department;

  @OneToMany(() => UserTag, (userTag) => userTag.tag)
  userTags!: UserTag[];

  @OneToMany(() => NoticeTag, (noticeTag) => noticeTag.tag)
  noticeTags!: NoticeTag[];
}

@Entity()
export class UserTag extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, (user) => user.userTags, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  user!: User;

  @ManyToOne(() => Tag, (tag) => tag.userTags, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  tag!: Tag;
}

@Entity()
export class NoticeTag extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Notice, (notice) => notice.noticeTags)
  notice!: Notice;

  @ManyToOne(() => Tag, (tag) => tag.noticeTags)
  tag!: Tag;
}
