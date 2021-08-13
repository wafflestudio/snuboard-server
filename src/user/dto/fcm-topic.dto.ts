import { IsString } from 'class-validator';

export class FcmTopicDto {
  @IsString()
  token!: string;
}
