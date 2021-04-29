import { Module } from '@nestjs/common';
import {
  NoticeDetailController,
  NoticeSummaryController,
} from './notice.controller';
import { NoticeService } from './notice.service';

@Module({
  controllers: [NoticeSummaryController, NoticeDetailController],
  providers: [NoticeService],
})
export class NoticeModule {}
