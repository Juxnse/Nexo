import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsDateString,
  IsIn,
  IsInt,
  Min,
  IsNumber,
} from 'class-validator';

export class CreateEventDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsDateString()
  start_at: string;

  @IsNotEmpty()
  @IsDateString()
  end_at: string;

  @IsNotEmpty()
  @IsString()
  timezone: string;

  @IsOptional()
  @IsIn(['in_person', 'online'])
  venue_kind?: string;

  @IsOptional()
  @IsString()
  venue_name?: string;

  @IsOptional()
  @IsString()
  venue_link?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  capacity?: number;

  @IsOptional()
  @IsIn(['scheduled', 'cancelled', 'completed'])
  status?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsNumber()
  lat?: number;

  @IsOptional()
  @IsNumber()
  lng?: number;
}
