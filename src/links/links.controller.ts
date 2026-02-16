import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { LinksService } from './links.service';
import { CreateLinkDto } from './dto/create-link.dto';
import { SearchLinksDto } from './dto/search-links.dto';

@Controller('links')
export class LinksController {
  constructor(private readonly linksService: LinksService) {}

  @Post()
  create(@Body() dto: CreateLinkDto) {
    return this.linksService.create(dto);
  }

  @Get('search')
  search(@Query() query: SearchLinksDto) {
    return this.linksService.semanticSearch(query.q);
  }
}
