import {
  BaseEntity,
  Column,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  RelationId,
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

  @Column()
  college!: string;

  @OneToMany(() => Notice, (notice) => notice.department)
  notices!: Notice[];

  @Transform((tags) => [...new Set(tags.value.map((tag: Tag) => tag.name))])
  @OneToMany(() => Tag, (tag) => tag.department)
  tags!: Tag[];

  @Transform((tags) => tags.value.map((tag: Tag) => tag.name))
  follow?: Tag[];

  @Column()
  link!: string;
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

  @ManyToOne(() => Notice, (notice) => notice.noticeTags, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  notice!: Notice;

  @ManyToOne(() => Tag, (tag) => tag.noticeTags, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  tag!: Tag;

  @RelationId((noticeTag: NoticeTag) => noticeTag.notice)
  noticeId!: number;
}
