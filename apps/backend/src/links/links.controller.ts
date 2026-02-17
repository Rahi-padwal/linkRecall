import { Body, Controller, Get, Logger, Post, Query } from '@nestjs/common';
import { LinksService } from './links.service';
import { CreateLinkDto } from './dto/create-link.dto';
import { SearchLinksDto } from './dto/search-links.dto';

@Controller('links')
export class LinksController {
  private readonly logger = new Logger(LinksController.name);

  constructor(private readonly linksService: LinksService) {}

  @Post()
  create(@Body() dto: CreateLinkDto) {
    return this.linksService.create(dto);
  }

  @Get()
  getAllLinks(@Query('userId') userId: string) {
    this.logger.debug(`Fetching all links for userId: ${userId}`);
    return this.linksService.getAllLinks(userId);
  }

  @Get('search')
  search(@Query() query: SearchLinksDto) {
    this.logger.debug(`Search query params: ${JSON.stringify(query)}`);
    return this.linksService.semanticSearch(query.q, query.userId);
  }
}
