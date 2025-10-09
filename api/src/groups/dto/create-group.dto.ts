import { IsString, IsNotEmpty, IsOptional, IsIn, IsArray } from 'class-validator';

export class CreateGroupDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsIn(['public', 'private'])
  visibility: 'public' | 'private';

  @IsString()
  @IsIn(['open', 'request', 'invite'])
  join_policy: 'open' | 'request' | 'invite';

  @IsArray()
  @IsOptional()
  tags?: string[];

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  country?: string;
}
