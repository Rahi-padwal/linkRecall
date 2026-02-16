import { Module } from '@nestjs/common';
import { CommonModule } from '../common/common.module';
import { LinksController } from './links.controller';
import { LinksService } from './links.service';

@Module({
  imports: [CommonModule],
  controllers: [LinksController],
  providers: [LinksService],
})
export class LinksModule {}
