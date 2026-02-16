import { IsString, IsUUID, MinLength } from 'class-validator';

export class SearchLinksDto {
  @IsString()
  @MinLength(1)
  q!: string;

  @IsUUID()
  userId!: string;
}