import { Module } from '@nestjs/common';
import { EmbeddingModule } from './embedding/embedding.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [EmbeddingModule, PrismaModule],
  exports: [EmbeddingModule, PrismaModule],
})
export class CommonModule {}
