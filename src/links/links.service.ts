import { Injectable, Logger } from '@nestjs/common';
import { Link, Prisma } from '@prisma/client';
import { EmbeddingService } from '../common/embedding/embedding.service';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateLinkDto } from './dto/create-link.dto';

@Injectable()
export class LinksService {
  private readonly logger = new Logger(LinksService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly embeddingService: EmbeddingService,
  ) {}

  async create(dto: CreateLinkDto) {
    try {
      this.logger.debug('Starting link create flow.');
      const user = await this.prisma.user.findFirst({
        select: { id: true },
      });

      const userId = user?.id
        ? user.id
        : (
            await this.prisma.user.create({
              data: { email: `temp+${Date.now()}@example.com` },
              select: { id: true },
            })
          ).id;

      const { metaDescription } = await this.extractMetadata(dto.originalUrl);
      this.logger.debug('Metadata extraction completed.');

      const link = await this.prisma.link.create({
        data: {
          originalUrl: dto.originalUrl,
          title: dto.title ?? null,
          summary: null,
          keywords: dto.keywords ?? [],
          rawExtractedText: null,
          userId,
        },
      });

      this.logger.debug('Embedding queued.');
      void this.enqueueEmbedding(link, dto.title ?? null, metaDescription);

      return link;
    } catch (error) {
      this.logger.error('Failed to create link.', error instanceof Error ? error.stack : null);
      throw error;
    }
  }

  private async enqueueEmbedding(
    link: Link,
    title: string | null,
    metaDescription: string | null,
  ) {
    const input = [title?.trim(), metaDescription?.trim()]
      .filter(Boolean)
      .join(' - ');

    try {
      this.logger.debug(`Starting embedding generation for link ${link.id}.`);
      const embedding = await this.embeddingService.generateEmbedding(input);

      await this.prisma.$executeRaw(
        Prisma.sql`
          UPDATE "Link"
          SET "embedding" = ARRAY[${Prisma.join(embedding)}]::vector
          WHERE "id" = ${link.id}
        `,
      );

      this.logger.debug(`Embedding stored for link ${link.id}.`);
    } catch (error) {
      this.logger.error(
        `Failed to generate embedding for link ${link.id}.`,
        error instanceof Error ? error.stack : null,
      );
    }
  }

  private async extractMetadata(
    originalUrl: string,
  ): Promise<{ metaDescription: string | null }> {
    try {
      const response = await fetch(originalUrl, {
        method: 'GET',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
          Accept: 'text/html',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        redirect: 'follow',
      });
      if (!response.ok) {
        this.logger.warn(`Content fetch failed with status ${response.status}.`);
        return { metaDescription: null };
      }

      const html = await response.text();
      const descriptionMatch = html.match(
        /<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i,
      );

      const description = descriptionMatch?.[1]?.trim();
      if (description) {
        this.logger.debug('Content fetch succeeded and meta description extracted.');
      }

      return { metaDescription: description || null };
    } catch (error) {
      this.logger.error(
        'Content extraction failed.',
        error instanceof Error ? error.stack : null,
      );
      return { metaDescription: null };
    }
  }
}
