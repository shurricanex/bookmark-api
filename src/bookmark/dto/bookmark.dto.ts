import { IsOptional, IsString } from 'class-validator';

export class BookmarkDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  link: string;
}
