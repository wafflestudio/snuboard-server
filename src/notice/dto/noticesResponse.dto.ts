import { IsString } from 'class-validator';
import { Notice } from '../notice.entity.js';

export class NoticesResponseDto {
    notices!: Notice[];

    @IsString()
    next_cursor!: string;
}
